# Dev/Admin Portal IA

> 현재 `apps/portal/src/app/RouteData.tsx` 기준 IA 문서
>
> 일부 메뉴는 route에 존재하지만 `enabled: false` 또는 placeholder 상태이다.

---

## 1. Top-Level Routes

```text
/login

/                         Developer/Public 영역
  /dashboard
  /partners
  /users
  /wallets
  /deposits
  /callbacks
  /sweeps
  /documents
  /documents/system

/admin                    Admin 영역
  /admin/dashboard
  /admin/members
  /admin/partners
  /admin/users
  /admin/wallets
  /admin/deposits
  /admin/callbacks
  /admin/sweeps
  /admin/documents
  /admin/system
```

권한:

```text
OWNER      Admin + Public 접근
OPERATOR   Admin 일부 + Public 접근
DEVELOPER  Public 접근
```

---

## 2. Current Menu Status

## 2.1 Login

경로:

```text
/login
```

목적:

- Member 로그인
- JWT 발급
- Portal 진입

상태:

- 구현됨

---

## 2.2 Public / Developer Dashboard

경로:

```text
/dashboard
```

컴포넌트:

```text
PublicDashboard
```

목적:

- 개발자/운영자가 전체 상태를 빠르게 확인한다.

상태:

- 구현됨
- 실제 metric 연결은 추가 보완 대상

---

## 2.3 Public Lists

경로:

```text
/partners
/users
/wallets
/deposits
/callbacks
/sweeps
```

컴포넌트:

```text
PublicPartnerList
PublicUserList
PublicWalletList
PublicDepositList
PublicCallbackList
PublicSweepList
```

목적:

- 조회 중심 화면
- Developer / Operator가 상태를 확인할 수 있는 영역

상태:

- 구현됨

---

## 2.4 Public Documents

경로:

```text
/documents/api-guide
/documents/api-swagger
/documents/dataModel
/documents/console
/documents/system/overview
/documents/system/flow
/documents/system/security
```

비활성:

```text
/documents/system/architecture
/documents/system/domains
```

Swagger:

```text
/documents/api-swagger -> /docs/api
```

상태:

- 구현됨
- 일부 문서는 viewer 연결 상태에 따라 보완 필요

---

## 2.5 Admin Dashboard

경로:

```text
/admin/dashboard
```

권한:

```text
OWNER
OPERATOR
```

상태:

- 구현됨

---

## 2.6 Admin Members

경로:

```text
/admin/members
```

권한:

```text
OWNER
```

목적:

- Member 목록/생성/수정
- 운영자/개발자 계정 관리

상태:

- 구현됨

---

## 2.7 Admin Domain Lists

경로:

```text
/admin/partners
/admin/users
/admin/wallets
/admin/deposits
/admin/callbacks
/admin/sweeps
```

컴포넌트:

```text
AdminPartnerList
AdminUserList
AdminWalletList
AdminDepositList
AdminCallbackList
AdminSweepList
```

권한:

```text
OWNER
OPERATOR
```

목적:

- 운영자용 조회/관리 화면
- Partner / User / Wallet / Deposit / Callback / Sweep 상태 관리

상태:

- 구현됨

---

## 2.8 Admin Disabled Routes

현재 route는 있으나 비활성 상태:

```text
/admin/withdrawals
/admin/balances
/admin/blockchain
/admin/blockchain/thot
/admin/blockchain/watcher
```

보완 방향:

- Withdrawal은 state machine 고도화 후 활성화
- Balance는 ledger 정책 정리 후 활성화
- Blockchain/Watcher는 monitoring API 연결 후 활성화

---

## 2.9 Admin Documents

경로:

```text
/admin/documents/api-swagger
/admin/documents/dataModel
/admin/documents/system/overview
/admin/documents/system/architecture
/admin/documents/system/flow
/admin/documents/system/domains
/admin/documents/system/security
/admin/documents/openai
```

Swagger:

```text
/admin/documents/api-swagger -> /docs/partner
```

권한:

- 대부분 OWNER / OPERATOR
- OpenAI 문서는 OWNER

상태:

- 구현됨

---

## 2.10 Admin System

경로:

```text
/admin/system/errors
/admin/system/monitoring
/admin/system/audit-logs
```

상태:

- Error Reports: 구현됨
- Monitoring: placeholder
- Audit Logs: placeholder

보완 방향:

- Phase3에서 txHash lifecycle / worker lag 연결
- Phase4에서 audit log table 도입

---

## 3. IA by Domain

### Partner

필요 정보:

- id
- name
- callbackUrl
- isActive
- apiKeyPrefix
- apiKeyCreatedAt

주요 액션:

- 생성
- 수정
- API Key 발급
- API Key rotate

### User

필요 정보:

- id
- partnerId
- externalUserId
- isActive
- createdAt

주요 액션:

- 생성
- 수정
- Partner 기준 필터

### Wallet

필요 정보:

- id
- partnerId
- userId
- address
- status
- assetsSnapshot
- lastRefillAt
- refillCount

주요 액션:

- 생성
- 자산 조회
- 자산 회수 job 생성

### Deposit

필요 정보:

- txHash
- partnerId
- userId
- walletId
- amount
- blockNumber
- status
- detectedAt
- confirmedAt

주요 액션:

- 조회
- txHash 추적

### Callback

필요 정보:

- txHash
- depositId
- eventType
- callbackUrl
- attemptCount
- maxAttempts
- status
- lastStatusCode
- lastAttemptAt

주요 액션:

- retry selected
- retry failed
- 상태 수정

### Sweep

필요 정보:

- depositId
- partnerId
- txHash
- fromAddress
- toAddress
- amount
- feeAmount
- status
- reason
- errorMessage

주요 액션:

- 조회
- failed/pending 추적

---

## 4. UX Rules

- 조회 화면은 Partner / status / txHash 필터를 우선한다.
- txHash는 copy와 external explorer link를 제공한다.
- 상태는 badge로 통일한다.
- Admin 화면과 Public 화면은 동일 데이터를 보여도 가능한 액션을 분리한다.
- disabled route는 사이드바에서 숨기거나 명확히 비활성 처리한다.
- 운영성 기능은 Audit 정책 없이 먼저 열지 않는다.

---

## 5. Current Gaps

- `pagas`, `swgger`, `withdrawall` 경로 오탈자 정리 여부 결정 필요
- Monitoring / Audit Logs placeholder
- Watcher Status disabled
- THOT Wallet disabled
- Withdrawal / Balance disabled
- txHash lifecycle 전용 화면 보완 필요
- Developer Guide 문서 보강 필요
