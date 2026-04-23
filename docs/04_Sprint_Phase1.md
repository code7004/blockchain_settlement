# Phase 1 - Functional MVP

> 현재 판정: 완료
>
> 목표: 입금 감지 -> 확정 -> 콜백 -> 조회 흐름을 검증 가능한 수준으로 만든다.

---

## 1. Phase Definition

Phase1은 운영 완성이 아니라 구조 증명 단계이다.

핵심:

- Multi-Partner 구조 검증
- Wallet 생성과 privateKey 암호화 저장
- TRC20 입금 감지
- Confirmation 이후 상태 전환
- Callback 생성 및 retry
- Simple balance 계산
- Admin Portal 조회

제외:

- 운영 자동화
- KMS / Vault
- Queue / DLQ
- Double-entry ledger
- 고급 monitoring / alert
- RBAC 고도화
- Mainnet 운영 안정화

---

## 2. Implemented Scope

### 2.1 Core Setup

- pnpm workspace 기반 monorepo
- NestJS API
- React Portal
- Prisma / PostgreSQL
- Swagger
- Global ValidationPipe
- Prisma exception filter
- HTTP logging interceptor

### 2.2 Partner / User

- Partner 생성/조회/수정
- API Key prefix/hash 저장
- User 생성/조회
- `partnerId + externalUserId` unique
- Partner 단위 데이터 격리

### 2.3 Wallet

- Tron account 생성
- privateKey AES-256 암호화 저장
- Wallet address unique
- Wallet status 관리

### 2.4 Deposit

- DepositWorker 기반 TRC20 Transfer event polling
- Deposit row 생성
- `txHash @unique`
- DETECTED 상태 저장

### 2.5 Confirmation

- ConfirmWorker 기반 block confirmation 처리
- DETECTED -> CONFIRMED 전환
- CONFIRMED 이후 CallbackLog 생성

### 2.6 Callback

- CallbackLog 저장
- HMAC-SHA256 서명
- CallbackWorker retry
- PENDING / SUCCESS / FAILED 상태

### 2.7 Balance

현재 코드 기준:

```text
balance = sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

### 2.8 Portal

- Login
- Dashboard
- Partner / User / Wallet / Deposit / Callback / Sweep 조회
- Swagger / 문서 연결
- Admin/Public 라우트 기반 분리의 기초

---

## 3. Sprint History

```text
Day 1-3  Core setup, Prisma, Partner, User
Day 4    Wallet 생성과 privateKey 암호화
Day 5    Deposit detection
Day 6    Confirmation
Day 7    Callback
Day 8    Admin UI 기본 조회
Day 9    Balance 계산
Day 10   Sweep 구조 초안
Day 11   Auth / JWT
```

---

## 4. Completion Criteria

완료 기준:

- 테스트넷 입금이 DB에 DETECTED로 생성된다.
- confirmation 수 충족 후 CONFIRMED로 전환된다.
- callback log가 생성된다.
- callback retry 결과가 SUCCESS / FAILED로 남는다.
- Portal에서 주요 데이터를 조회할 수 있다.
- Partner API와 Portal API의 인증 경계가 존재한다.

현재 판정:

- 완료
- 이후 변경은 Phase2/Phase3 문서에서 관리한다.
