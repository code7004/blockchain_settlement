# Architecture

> 현재 소스 기준 아키텍처 문서
>
> Phase3 Step3 진행 상태를 기준으로 API, Portal, Worker, DB, Tron Infra의 책임 경계를 정리한다.

---

## 1. High-Level Architecture

```text
[Partner Service]
        |
        | Partner API / x-api-key
        v
[NestJS API]
        |
        | Prisma
        v
[PostgreSQL]

[Admin / Developer Portal]
        |
        | Portal API / JWT
        v
[NestJS API]

[NestJS Workers]
        |
        | TronService
        v
[TronGrid / Tron Node]
        |
        v
[Tron Network]
```

시스템은 하나의 NestJS API 애플리케이션 안에서 Partner API, Portal API, Background Worker를 함께 구성한다.

- Partner API는 외부 파트너 서비스 연동용이다.
- Portal API는 Admin / Developer Portal 조회 및 운영 보조용이다.
- Worker는 체인 감지, confirm, callback, sweep, asset reclaim을 비동기로 처리한다.
- Tron 접근은 `infra/tron` 계층에서 추상화한다.
- DB 접근은 Prisma를 통해 수행한다.

---

## 2. Runtime Composition

현재 `apps/api/src/app.module.ts`는 다음 세 그룹을 조합한다.

```text
AppModule
  ├─ CommonModules
  │   ├─ ConfigModule
  │   ├─ EnvModule
  │   ├─ PrismaModule
  │   ├─ LoggerModule
  │   └─ WorkerModule
  │
  ├─ PortalModules
  │   ├─ AuthAdminModule
  │   ├─ MemberAdminModule
  │   ├─ PartnerAdminModule
  │   ├─ UserAdminModule
  │   ├─ WalletAdminModule
  │   ├─ DepositAdminModule
  │   ├─ WithdrawalAdminModule
  │   ├─ CallbackAdaminModule
  │   ├─ SweepModule
  │   ├─ CallbackTestModule
  │   ├─ BalanceAdminModule
  │   ├─ BlockChainModule
  │   ├─ MonitorModule
  │   └─ OpenAiModule
  │
  └─ ApiModules
      ├─ HealthApiModule
      ├─ PartnerApiModule
      ├─ UserApiModule
      ├─ WalletApiModule
      ├─ DepositApiModule
      ├─ WithdrawalApiModule
      ├─ CallbackApiModule
      └─ BalanceApiModule
```

Swagger도 이 구분을 따른다.

- `/docs/api`: Partner API 문서
- `/docs/partner`: Portal API 문서

현재 global prefix는 사용하지 않는다.

---

## 3. Core Concepts

### 3-1. Partner

외부 연동 주체이자 데이터 격리의 최상위 단위이다.

- API Key 인증 주체
- callbackUrl / callbackSecret 보유
- User, Wallet, Deposit, Withdrawal, CallbackLog, SweepLog의 기준 축

Partner API 요청은 `x-api-key`를 통해 인증하고, 서버는 API Key prefix 조회와 bcrypt compare를 통해 `partnerId`를 식별한다.

### 3-2. User

Partner 내부 사용자 식별 단위이다.

- 독립 계정이 아니라 Partner에 종속된다.
- 외부 시스템 식별자는 `externalUserId`이다.
- 동일 Partner 안에서 `externalUserId`는 unique이다.

### 3-3. Deposit Wallet

사용자 입금 식별을 위해 시스템이 생성하는 Tron 주소이다.

```text
User Wallet -> Deposit Wallet
```

특징:

- Partner / User에 종속된다.
- privateKey는 AES-256으로 암호화 저장한다.
- 입금 식별 주소이지만, Sweep 전까지 실제 token balance가 존재할 수 있다.
- TRX가 부족하면 token transfer가 불가능하므로 Gas Tank 전략이 필요하다.

### 3-4. Hot Wallet

시스템이 실제 자산을 집계하고 출금 송신 주체로 사용하는 중앙 지갑이다.

```text
Deposit Wallet -> Hot Wallet
Hot Wallet -> User Wallet
```

역할:

- Sweep 수신 주소
- Withdrawal 송신 주소
- 운영상 항상 관리되어야 하는 핵심 지갑

### 3-5. Gas Tank

Deposit Wallet의 TRX 부족 문제를 해결하기 위한 보조 지갑이다.

```text
Gas Tank -> Deposit Wallet -> Hot Wallet
```

현재 SweepWorker는 Deposit Wallet의 TRX가 부족할 경우 Gas Tank에서 TRX refill을 시도하고, 해당 SweepJob을 다시 PENDING으로 돌린다.

Phase3에서는 refill 중복 방지, wallet cooldown, gas 로그 정리가 아직 보완 대상이다.

### 3-6. Worker

Worker는 API 요청 흐름과 분리된 polling 기반 백그라운드 처리 단위이다.

공통 동작:

- `BaseWorker`를 상속한다.
- `onModuleInit` 시 interval을 시작한다.
- 중복 tick 실행을 막기 위해 `isRunning` guard를 둔다.
- interval 값은 `EnvService.getPollInterval()`에서 가져온다.

---

## 4. System Flow

### 4-1. Deposit Flow

```text
User Wallet
  -> Deposit Wallet
  -> Tron Transfer Event
  -> DepositWorker
  -> DepositService
  -> Deposit(status=DETECTED)
  -> ConfirmWorker
  -> Deposit(status=CONFIRMED)
  -> CallbackLog(status=PENDING)
  -> SweepJob(status=PENDING)
  -> CallbackWorker
  -> CallbackLog(status=SUCCESS or FAILED)
  -> SweepWorker
  -> SweepLog(status=BROADCASTED)
  -> ConfirmWorker
  -> SweepLog(status=CONFIRMED or FAILED)
```

핵심 원칙:

- Deposit은 체인 이벤트 감지 시 `DETECTED`로 생성된다.
- 지정 confirmation 수를 만족해야 `CONFIRMED`로 전환된다.
- 잔액 계산은 `CONFIRMED` Deposit만 반영한다.
- 동일 `txHash`는 DB unique 제약으로 중복 반영을 차단한다.
- Callback과 Sweep은 Confirm 이후 별도 worker 흐름으로 처리한다.

### 4-2. Deposit Detection

현재 DepositWorker는 Tron contract event API를 block 단위로 polling한다.

```text
latest block 조회
  -> targetBlock = latest - 2
  -> lastScannedBlock + 1 부터 최대 10 block 처리
  -> Transfer event 조회
  -> result.from / result.to base58 변환
  -> DepositService.handleDetectedTransfer()
  -> block cursor 저장
```

현재 cursor:

- `runtime/watcher-state.json`
- `USE_WATCHER_POLLING_CURSOR=true`일 때 사용

주의:

- checkpoint DB 테이블 기반 복구는 아직 Phase4/운영 고도화 대상이다.
- 현재 방식은 파일 기반 cursor라 실행 환경/배포 구조에 따라 별도 운영 정책이 필요하다.

### 4-3. Confirm Flow

ConfirmWorker는 두 가지 confirm을 담당한다.

1. Deposit confirm

```text
Deposit(status=DETECTED)
  -> latestBlock - CONFIRMATION_COUNT 조건 확인
  -> status=CONFIRMED
  -> CallbackLog 생성
  -> token balance 확인
  -> SweepJob upsert
```

2. Sweep confirm

```text
SweepLog(status=BROADCASTED, txHash exists)
  -> Tron transaction info 조회
  -> blockNumber / receipt 확인
  -> confirmation 수 확인
  -> receipt SUCCESS면 CONFIRMED
  -> 실패 receipt면 FAILED
  -> terminal 상태에서 SweepJob 제거
```

### 4-4. Callback Flow

```text
CallbackLog(status=PENDING)
  -> requestBody + callbackSecret 기반 HMAC 생성
  -> partner.callbackUrl POST
  -> 성공: SUCCESS
  -> 실패: attemptCount 증가
  -> 최대 시도 초과: FAILED
```

현재 callback은 DB 기반 polling 재시도 구조이다.

Phase4 후보:

- Queue 기반 처리
- DLQ
- Exponential backoff
- callback eventType unique 정책

### 4-5. Sweep Flow

```text
SweepJob(status=PENDING)
  -> PROCESSING lock
  -> terminal SweepLog 존재 여부 확인
  -> BROADCASTED SweepLog 존재 여부 확인
  -> Deposit Wallet token/TRX balance 조회
  -> TRX 부족: Gas Tank refill, job release
  -> token transfer broadcast
  -> SweepLog(status=BROADCASTED, txHash)
  -> job 제거
  -> ConfirmWorker가 chain receipt로 최종 CONFIRMED/FAILED 처리
```

현재 Sweep 구조의 핵심은 `SweepJob`과 `SweepLog` 분리이다.

- SweepJob: 처리 대기 queue
- SweepLog: 실행 이력과 상태 추적

### 4-6. Assets Reclaim Flow

Wallet 자산 회수는 `AssetsReclaimJob`과 `ReclaimWorker`가 담당한다.

```text
AssetsReclaimJob
  -> wallet privateKey 복호화
  -> token balance 확인
  -> TRX 부족 시 refill
  -> token -> Hot Wallet
  -> 남은 TRX -> Gas Tank
  -> job 삭제 또는 FAILED 처리
```

이 흐름은 일반 Deposit Sweep과 별도이며, 운영 보조 성격의 자산 회수 작업이다.

### 4-7. Withdrawal Flow

현재 Withdrawal 도메인은 Partner API 요청과 상태 모델을 가진다.

```text
Partner
  -> Withdrawal request
  -> Withdrawal(status=REQUESTED)
  -> 승인/브로드캐스트 흐름
  -> BROADCASTED / CONFIRMED / FAILED
```

Prisma enum 기준 상태:

```text
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                                  \-> FAILED
```

Phase3/Phase4에서 보완할 부분:

- 상태 전이 제한을 코드 레벨에서 일관되게 강제
- double broadcast 방지
- chain receipt 기반 confirmed 추적
- 실패 재처리 정책

---

## 5. Backend Structure

현재 `apps/api/src` 구조:

```text
apps/api/src/
  app.module.ts
  main.ts

  core/
    constants/
    crypto/
    dto/
    env/
    errors/
    logger/
    utils/

  domains/
    auth/
    balance/
    blockchain/
    callback/
    callback-test/
    deposit/
    health/
    member/
    monitor/
    openai/
    partner/
    sweep/
    user/
    wallet/
    withdrawal/

  infra/
    prisma/
    tron/

  worker/
    base.worker.ts
    deposit.worker.ts
    confirm.worker.ts
    callback.worker.ts
    sweep.worker.ts
    recalim.worker.ts
    worker.module.ts
```

주의:

- `recalim.worker.ts`는 현재 실제 파일명이다. 의도상 `reclaim.worker.ts`로 보이나, 문서에서는 현재 소스 기준 파일명을 기록한다.
- `GasRefillWorker` 파일은 존재하지만 현재 `WorkerModule` provider에는 등록되어 있지 않다.

---

## 6. Domain Module Pattern

현재 프로젝트는 도메인별로 다음 구조를 기본으로 한다.

```text
domains/{domain}/
  dto/
  {domain}.controller.ts
  {domain}.service.ts
  {domain}.repository.ts
  {domain}.module.ts
  {domain}.types.ts
```

역할:

- Controller: HTTP 진입점, Guard, Swagger, DTO 검증
- Service: 비즈니스 규칙과 상태 처리
- Repository: Prisma 기반 DB 접근
- DTO: 요청/응답 스키마와 validation
- Types: 도메인 내부 타입

컨텍스트 분리 원칙:

- 같은 도메인 안에서 Partner API와 Portal API 진입점을 나눌 수 있다.
- 서비스 로직은 공유하되, 인증/라우팅/Swagger는 context module 또는 controller에서 분리한다.
- `ApiModules`와 `PortalModules`는 Swagger include 기준이기도 하다.

---

## 7. Infra Layer

### 7-1. Prisma

위치:

```text
apps/api/src/infra/prisma/
packages/prisma/prisma/schema.prisma
```

역할:

- PostgreSQL 연결
- PrismaService 제공
- 도메인 Repository와 Worker에서 DB 접근
- migration/schema 관리는 `packages/prisma`에서 수행

### 7-2. Tron

위치:

```text
apps/api/src/infra/tron/
  tron.client.ts
  tron.module.ts
  tron.service.ts
  tron.types.ts
```

역할:

- Tron 계정 생성
- 최신 블록 조회
- transaction info 조회
- TRX balance / token balance 조회
- token transfer / trx transfer
- TRC20 Transfer event 조회
- rate limit / transient error 판단

도메인과 Worker는 TronWeb을 직접 다루지 않고 `TronService`를 통해 접근한다.

---

## 8. Portal Structure

현재 `apps/portal/src`는 다음 축으로 구성된다.

```text
apps/portal/src/
  app/
    App.tsx
    RouteData.tsx
    main.tsx

  core/
    hooks/
    network/
    route-meta/
    tx-ui/

  domains/
    balance/
    blockchain/
    callback/
    dashboard/
    deposit/
    devconsole/
    member/
    openai/
    partner/
    sweep/
    system/
    user/
    wallet/
    withdrawall/

  components/
  constants/
  docs/
  hooks/
  lib/
  pagas/
  store/
  styles/
```

주의:

- `pagas`, `swgger`, `withdrawall` 등 오탈자로 보이는 디렉터리가 현재 소스에 존재한다.
- 문서에서는 현재 실제 경로를 기준으로 기록하고, 이름 정리는 별도 리팩터링 범위로 둔다.

라우트 구조:

- `/login`: 로그인
- `/`: Developer/Public 영역
- `/admin`: Admin 영역

현재 활성 주요 메뉴:

- Dashboard
- Partners
- Users
- Wallets
- Deposits
- Callbacks
- Sweeps
- Documents / Swagger
- System Errors

일부 화면은 route에는 있으나 `enabled: false`이거나 placeholder 상태이다.

---

## 9. Data Model Overview

현재 주요 모델:

```text
Member
Partner
User
Wallet
Deposit
Withdrawal
CallbackLog
CallbackTestLog
SweepJob
SweepLog
AssetsReclaimJob
HealthPing
```

관계 요약:

```text
Partner
  -> User
  -> Wallet
  -> Deposit
  -> Withdrawal
  -> CallbackLog
  -> SweepLog

Deposit
  -> CallbackLog
  -> SweepJob
  -> SweepLog

Wallet
  -> AssetsReclaimJob
```

상세 컬럼, 인덱스, enum 정의는 `docs/03_Database_Schema.md`에서 관리한다.

---

## 10. State Model

공통 기준 enum:

```text
TxStatus
  DETECTED
  PENDING
  BROADCASTED
  CONFIRMED
  FAILED
  SKIPPED
```

도메인별 상태:

```text
DepositStatus
  DETECTED
  CONFIRMED
  FAILED

WithdrawalStatus
  REQUESTED
  APPROVED
  BROADCASTED
  CONFIRMED
  FAILED

CallbackStatus
  PENDING
  SUCCESS
  FAILED

SweepJobStatus
  PENDING
  PROCESSING

SweepStatus
  PENDING
  BROADCASTED
  CONFIRMED
  FAILED
  SKIPPED

AssetsReclaimJobStatus
  PENDING
  PROCESSING
  CONFIRMED
  FAILED
```

Phase3 Step3의 핵심 과제는 상태 전이를 코드 레벨에서 일관되게 제한하는 것이다.

---

## 11. Authentication

### 11-1. Portal JWT

```text
Portal
  -> POST /portal/auth/login
  -> JWT 발급
  -> Authorization: Bearer <token>
  -> JwtAuthGuard
```

Portal 인증 주체는 `Member`이다.

역할 enum:

```text
OWNER
OPERATOR
DEVELOPER
```

### 11-2. Partner API Key

```text
Partner Service
  -> x-api-key
  -> ApiKeyGuard
  -> partnerId 추출
```

API Key 생성/인증 흐름:

```text
rawKey 생성
  -> prefix 추출
  -> bcrypt.hash(rawKey)
  -> apiKeyPrefix / apiKeyHash 저장
  -> rawKey는 1회만 반환

request x-api-key
  -> prefix로 Partner 조회
  -> bcrypt.compare
  -> 성공 시 partnerId 주입
```

---

## 12. Cross-Cutting Concerns

### 12-1. Validation

`main.ts`에서 global `ValidationPipe`를 사용한다.

```text
transform: true
whitelist: true
forbidNonWhitelisted: true
```

### 12-2. Error Handling

전역 `ApiExceptionFilter`를 사용한다.

Prisma 에러는 `mapPrismaError()`를 통해 HTTP 예외로 매핑한다.

### 12-3. Logging

전역 `HttpLoggingInterceptor`와 `AppLoggerService`를 사용한다.

Worker는 Nest `Logger` 기반으로 처리 상태를 남긴다.

Phase3에서는 txHash 기반 lifecycle 추적과 structured error 로그가 보완 대상이다.

### 12-4. CORS

현재 허용 기준:

- localhost
- `*.balletpay.net`
- `https://balletpay.net`

---

## 13. Monorepo Structure

현재 루트 구조:

```text
chain-wallet-service/
  apps/
    api/
    portal/
    tools/

  packages/
    prisma/
    prisam-types/

  docs/
```

역할:

- `apps/api`: NestJS API + Worker
- `apps/portal`: React Portal
- `apps/tools`: 개발/운영 보조 스크립트
- `packages/prisma`: Prisma schema, migrations, seed
- `packages/prisam-types`: Prisma type export package
- `docs`: 프로젝트 기준 문서

---

## 14. Architecture Principles

- 문서 기반 구조를 우선한다.
- 도메인 책임을 기준으로 모듈을 나눈다.
- 외부 I/O는 infra 계층으로 격리한다.
- Partner API와 Portal API는 인증과 Swagger 경계를 분리한다.
- Worker는 API 요청 흐름과 분리한다.
- txHash unique와 상태 전이를 통해 멱등성을 유지한다.
- privateKey는 암호화 저장하고, 복호화는 필요한 작업 시점에만 수행한다.
- 잔액 반영은 confirmation 이후 기준으로 제한한다.
- Sweep은 broadcast와 confirm을 분리하여 체인 결과를 추적한다.
- 운영 자동화보다 정합성, 추적 가능성, 복구 가능성을 우선한다.

---

## 15. Current Gaps

현재 소스 기준으로 문서/구현 정합화가 필요한 지점:

- `GasRefillWorker` 파일은 있으나 WorkerModule에 등록되어 있지 않다.
- `recalim.worker.ts`, `pagas`, `swgger`, `withdrawall`, `prisam-types` 등 오탈자성 경로가 존재한다.
- Deposit cursor가 DB checkpoint가 아니라 runtime 파일 기반이다.
- Withdrawal lifecycle은 enum상 CONFIRMED까지 있으나 confirm worker 통합은 Sweep 중심이다.
- 상태 전이 제한은 도메인별로 더 명시적인 guard가 필요하다.
- Gas refill 중복 방지와 wallet cooldown 정책이 아직 미완성이다.
- Monitoring / Audit / Blockchain Portal 화면 일부는 placeholder 또는 disabled 상태이다.
- Global prefix가 비활성화되어 있어 API path 정책은 현재 controller path 기준으로 해석해야 한다.

이 항목들은 즉시 구조를 바꾸기보다 Phase 문서와 실제 코드 범위를 맞춘 뒤, 별도 리팩터링/구현 작업으로 다룬다.
