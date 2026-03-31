# 📘 Technical Conventions

---

# 1. Global Validation

- 반드시 ValidationPipe 글로벌 설정
- Query는 string → 자동 변환 필요

```
new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});
```

✔ 목적

- DTO 기반 타입 자동 변환
- 잘못된 필드 차단

---

# 2. Prisma Error Handling

## 기본 규칙

- catch (error: unknown) 사용 (any 금지)
- Prisma 에러는 직접 노출 금지
- mapPrismaError()로 중앙 처리

## 매핑 규칙

```
P2002 → 409 (Conflict)
P2003 → 400 (Invalid Reference)
P2025 → 404 (Not Found)
ValidationError → 400
```

✔ 핵심

- DB 구조 숨김
- API는 항상 HTTP Exception 형태 유지

---

# 3. Prisma UUID 규칙

```
id        String @id @default(uuid()) @db.Uuid
partnerId String @db.Uuid
userId    String @db.Uuid
walletId  String @db.Uuid
```

✔ 목적

- Postgres uuid 타입 명시
- FK 타입 일관성 유지
- migration 오류 방지

---

# 4. Pagination 규칙

## 제한

- DTO → @Max() (1차)
- Service → Math.min() (2차)

## 응답 구조

```
{
  data: T[],
  total: number,
  limit: number,
  offset: number
}
```

✔ 핵심

- total은 prisma.$transaction으로 함께 조회

---

# 5. DTO 규칙

- strict 모드 유지
- 모든 필드 definite assignment (!) 사용
- Swagger 필수

✔ 포함 항목

- @ApiProperty / @ApiPropertyOptional
- example
- description

---

# 6. Query DTO 구성

- extends 대신 IntersectionType 사용
- Filter DTO + Pagination DTO 조합 구조 권장

---

# 7. Constants 규칙

- 숫자 하드코딩 금지
- core/constants에서 중앙 관리

✔ 장점

- 유지보수 용이
- Swagger에서도 재사용 가능

---

# 8. Formatting 규칙

- Prettier → 포맷 담당
- ESLint → 코드 품질만 담당

❌ 금지

- eslint-plugin-prettier
- max-len 강제

---

# 9. API Error Response 규격

```
{
  statusCode: number
  code: string
  message: string
  timestamp: string
  path: string
}
```

✔ 구현 위치

- src/core/errors/api-exception.filter.ts

---

# 10. Type Safety 규칙

- any 사용 금지
- Prisma 타입 직접 사용 금지
- 별도 Domain Type 사용

```
// ❌
async create(data: any)

// ✅
async create(data: CreateDepositInput)
```

✔ 이유

- 도메인 독립성 유지
- 타입 안정성 확보

---

# 11. Domain Naming 규칙

## 기본 패턴

```
[domain]-[context].[type].ts
```

## 예시

```
partner.controller.ts
admin-partner.controller.ts
```

❌ 금지

```
partner-admin.controller.ts
```

---

# 12. Domain 구조 규칙

## 핵심 원칙

```
도메인은 하나, 진입점은 여러 개
```

---

## 12-1. Domain Module (Core)

```
partner.module.ts
```

✔ 포함

- Service
- Repository

❌ Controller 없음

---

## 12-2. Context Module (Entry)

```
partner-api.module.ts
partner-admin.module.ts
```

✔ 역할

- Controller 등록
- Guard 분리
- Swagger 분리

---

# 13. 책임 분리

```
Controller → Service → Repository
```

- Controller: Entry point
- Service: 비즈니스 로직
- Repository: DB 접근

---

# 14. Swagger 분리

```
// API Swagger
include: [PartnerApiModule]

// Admin Swagger
include: [PartnerAdminModule]
```

✔ 기준

- 도메인 기준이 아니라 모듈 기준

---

# 15. 디렉토리 구조 예시

```
domains/
  partner/
    dto/

    partner.module.ts

    partner.controller.ts

    partner.service.ts
    partner.repository.ts

    partner-api.module.ts
    partner-admin.module.ts
```

---

# 16. Controller File Rule (Updated)

- 동일 도메인의 Controller는 한 파일에 공존 가능
- 단, "Context 단위"로 클래스 분리 필수

예:

- PartnerController (API)
- AdminPartnerController (Admin)

✔ 필수 조건

- 각 Controller는 독립된 Guard 사용
- 각 Controller는 독립된 Swagger 설정
- 각 Controller는 독립된 Route prefix 사용
- Controller 간 로직 공유 금지 (Service 통해서만)

---

# 17. Controller Structure Rule

파일 내 순서:

1. import
2. PartnerController (API)
3. AdminPartnerController (Admin)

각 Controller 사이에 반드시 구분 주석 추가

```
// --- API Controller ---
// --- Admin Controller ---
```

---

# 18. Split Conditions

다음 중 하나라도 만족하면 파일 분리:

- Controller 길이 300줄 이상
- API / Admin 기능 차이가 커짐
- DTO가 서로 달라짐
- endpoint 10개 이상
- 유지보수 시 스크롤이 불편해짐

---

# 🔥 핵심 한줄 요약

```
도메인은 하나로 유지하고,
컨텍스트(API / Admin)는 진입점에서만 분리한다
```
