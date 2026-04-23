# Technical Conventions

> 현재 소스 기준 기술 규약
>
> 본 문서는 신규 구현과 리팩터링 시 반드시 지켜야 할 코드 구조, API, DB, Worker 규칙을 정의한다.

---

# 1. Global Application Rules

## 1.1 ValidationPipe

`apps/api/src/main.ts`에서 global `ValidationPipe`를 사용한다.

현재 설정:

```ts
new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
```

규칙:

- DTO에 정의되지 않은 필드는 거부한다.
- Query DTO는 필요한 경우 명시적으로 타입 변환을 고려한다.
- implicit conversion이 필요한 경우 전역 옵션 변경 전에 영향 범위를 검토한다.

## 1.2 Global Error Filter

전역 `ApiExceptionFilter`를 사용한다.

구현 위치:

```text
apps/api/src/core/errors/api-exception.filter.ts
```

API 에러 응답은 다음 구조를 유지한다.

```json
{
  "statusCode": 400,
  "code": "ERROR_CODE",
  "message": "message",
  "timestamp": "ISO_DATE",
  "path": "/path"
}
```

## 1.3 Logging

전역 HTTP logging:

```text
apps/api/src/core/logger/http-logging.interceptor.ts
```

Worker logging:

- `BaseWorker`에서 worker name 기반 Logger를 사용한다.
- txHash가 있는 작업은 가능한 한 로그에 txHash를 포함한다.
- privateKey, API Key 원문, callbackSecret, JWT는 로그에 남기지 않는다.

---

# 2. Module Boundaries

## 2.1 AppModule Composition

`AppModule`은 세 그룹으로 구성한다.

```text
CommonModules
PortalModules
ApiModules
```

규칙:

- 공통 infra는 CommonModules에 둔다.
- Admin/Portal 진입점은 PortalModules에 둔다.
- Partner API 진입점은 ApiModules에 둔다.
- Swagger include 기준도 이 배열을 따른다.

## 2.2 Domain Structure

기본 구조:

```text
domains/{domain}/
  dto/
  {domain}.controller.ts
  {domain}.service.ts
  {domain}.repository.ts
  {domain}.module.ts
  {domain}.types.ts
```

모든 도메인에 모든 파일이 반드시 필요한 것은 아니지만, 책임은 다음 기준을 따른다.

- Controller: HTTP 진입점, Guard, Swagger, DTO 검증
- Service: 비즈니스 규칙, 상태 전이, 외부 service 조합
- Repository: Prisma DB 접근
- DTO: 요청/응답 validation 및 Swagger schema
- Types: 도메인 내부 타입

## 2.3 Controller Context Rule

하나의 도메인 안에서 Partner API와 Portal API를 함께 가질 수 있다.

규칙:

- context별 Controller class를 분리한다.
- context별 Guard를 분리한다.
- context별 route prefix를 분리한다.
- 로직 공유는 Service를 통해서만 한다.

예:

```text
PartnerController       -> Partner API
PortalPartnerController -> Portal API
```

파일 분리 조건:

- controller가 300줄 이상
- context별 DTO가 크게 달라짐
- endpoint가 10개 이상
- 유지보수가 어려움

---

# 3. API Rules

## 3.1 Authentication

Portal:

- JWT 사용
- `Authorization: Bearer <token>`
- `JwtAuthGuard`

Partner API:

- API Key 사용
- `x-api-key`
- `ApiKeyGuard`
- 인증 성공 시 partnerId를 요청 context에 주입

## 3.2 Swagger

Swagger 경로:

- `/docs/api`: Partner API
- `/docs/partner`: Portal API

규칙:

- Partner API에는 ApiKeyAuth를 적용한다.
- Portal API에는 BearerAuth를 적용한다.
- Swagger include는 `ApiModules`, `PortalModules` 기준이다.

## 3.3 Pagination

응답 구조:

```ts
{
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
```

규칙:

- DTO에서 limit/offset을 검증한다.
- Service 또는 Repository에서 최대 limit를 다시 제한한다.
- total과 data는 가능한 한 동일 조건으로 조회한다.

## 3.4 DTO

규칙:

- `any` 사용 금지
- 필수 필드는 definite assignment `!` 사용
- `@ApiProperty`, `@ApiPropertyOptional`을 작성한다.
- validation decorator를 사용한다.
- DTO는 controller boundary에서만 사용하고 service 내부 타입과 혼용하지 않는다.

---

# 4. Prisma Rules

## 4.1 UUID

UUID 필드는 PostgreSQL uuid 타입을 명시한다.

```prisma
id        String @id @default(uuid()) @db.Uuid
partnerId String @db.Uuid
userId    String @db.Uuid
walletId  String @db.Uuid
```

## 4.2 Decimal

금액 필드는 `Decimal`을 사용한다.

규칙:

- token amount를 number로 장시간 유지하지 않는다.
- DB 저장 전 decimal precision을 확인한다.
- UI 표시 전 format utility를 사용한다.

## 4.3 Prisma Error Handling

규칙:

- `catch (error: unknown)` 사용
- Prisma raw error를 API 응답으로 직접 노출하지 않는다.
- `mapPrismaError()`를 통해 변환한다.

기본 매핑:

```text
P2002 -> 409 Conflict
P2003 -> 400 Invalid Reference
P2025 -> 404 Not Found
ValidationError -> 400 Bad Request
```

## 4.4 Prisma Type Exposure

규칙:

- Service public API에서 Prisma model type을 직접 노출하지 않는다.
- 도메인 type 또는 DTO response type으로 감싼다.
- Repository 내부에서는 Prisma type 사용 가능하다.

---

# 5. State Transition Rules

상태 전이는 문서와 Prisma enum 기준으로 제한한다.

Deposit:

```text
DETECTED -> CONFIRMED
DETECTED -> FAILED
```

Sweep:

```text
PENDING -> BROADCASTED -> CONFIRMED
        \-> FAILED
        \-> SKIPPED
```

Withdrawal:

```text
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                              \-> FAILED
```

Callback:

```text
PENDING -> SUCCESS
PENDING -> FAILED
```

규칙:

- 역방향 전이는 금지한다.
- terminal 상태는 별도 정책 없이 되돌리지 않는다.
- update 시 현재 상태 조건을 where에 포함한다.
- txHash가 있는 상태 전이는 unique 제약과 함께 검증한다.

---

# 6. Worker Rules

현재 Worker:

```text
DepositWorker
ConfirmWorker
CallbackWorker
SweepWorker
ReclaimWorker
```

공통 규칙:

- `BaseWorker`를 상속한다.
- polling interval은 EnvService에서 가져온다.
- 중복 실행을 방지한다.
- worker 작업은 idempotent해야 한다.
- 외부 API 호출 실패는 재시도 가능 상태로 남긴다.

작업별 규칙:

- DepositWorker는 detect만 담당한다.
- ConfirmWorker는 deposit confirm과 sweep confirm을 담당한다.
- CallbackWorker는 callback retry만 담당한다.
- SweepWorker는 token transfer broadcast까지 담당한다.
- ReclaimWorker는 운영 보조 자산 회수만 담당한다.

주의:

- `GasRefillWorker`는 현재 파일은 있으나 WorkerModule에 등록되어 있지 않다.
- worker 추가/등록은 Phase 문서에 먼저 반영한다.

---

# 7. Constants & Env

## 7.1 Constants

공통 상수 위치:

```text
apps/api/src/core/constants/index.ts
```

규칙:

- 숫자 하드코딩 금지
- confirmation count, max attempts, threshold는 constants/env에서 관리한다.
- 운영 중 변경 가능성이 높은 값은 env 후보로 둔다.

## 7.2 EnvService

위치:

```text
apps/api/src/core/env/env.service.ts
```

규칙:

- 환경변수는 직접 `process.env`로 읽지 않고 EnvService를 우선 사용한다.
- 필수 env는 누락 시 fail-fast 한다.
- chain/token/hot wallet/gas tank env는 운영 전 guard가 필요하다.

---

# 8. Formatting & Naming

현재 프로젝트는 Prettier / ESLint / Husky / lint-staged를 사용한다.

규칙:

- lint와 format은 커밋 전에 통과해야 한다.
- 신규 파일명은 오탈자 없이 domain 기준으로 작성한다.
- 기존 오탈자성 경로는 별도 리팩터링 작업으로만 수정한다.

현재 존재하는 오탈자성 경로:

- `apps/api/src/worker/recalim.worker.ts`
- `apps/portal/src/pagas`
- `apps/portal/src/domains/swgger`
- `apps/portal/src/domains/withdrawall`
- `packages/prisam-types`

---

# 9. Testing & Verification

코드 변경 시 권장 검증:

```text
pnpm typecheck
pnpm lint
pnpm build:api
pnpm build:portal
```

단, 현재 실행 환경에서 `node` / `pnpm`이 PATH에 없을 수 있으므로 검증 실패 시 원인을 명확히 기록한다.

DB 변경 시:

- Prisma schema 변경
- migration 생성
- migration SQL 검토
- schema 문서 갱신
- Phase 문서 갱신

---

# 10. One-Line Summary

```text
도메인은 하나로 유지하고,
진입점은 Partner API / Portal API로 분리하며,
상태 전이와 Worker는 문서 기준으로 제한한다.
```
