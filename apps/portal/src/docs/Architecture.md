# Architecture

## Overview

이 문서는 파트너/포털 개발자가 시스템 구조를 이해할 수 있도록 공개 가능한 아키텍처를 설명합니다.

민감한 내부 키, 서버 운영 상세, privateKey 처리 세부 구현은 포함하지 않습니다.

---

## 1. High-Level Structure

```text
Partner Service
  -> Partner API
  -> NestJS API
  -> PostgreSQL

End User
  -> Tron Network
  -> Deposit Wallet

Workers
  -> TronGrid / Tron Node
  -> Deposit / Callback / Sweep 처리

Admin / Developer Portal
  -> Portal API
  -> 운영/조회 화면
```

---

## 2. API Areas

### Partner API

파트너 서버가 직접 호출하는 API입니다.

인증:

```http
x-api-key: {PARTNER_API_KEY}
```

주요 기능:

- User 생성
- User 조회
- Wallet 조회
- Deposit 조회

Swagger:

```text
/docs/api
```

### Portal API

Portal 화면이 사용하는 API입니다.

인증:

```http
Authorization: Bearer {JWT}
```

주요 기능:

- Partner 관리
- Member 관리
- Callback retry
- Sweep 조회
- Balance 조회
- Blockchain test/monitoring
- 문서/운영 화면 지원

Swagger:

```text
/docs/partner
```

---

## 3. Worker Architecture

시스템은 API 요청과 별도로 백그라운드 Worker가 체인/정산 흐름을 처리합니다.

```text
DepositWorker
  -> TRC20 Transfer event 감지

ConfirmWorker
  -> Deposit confirmation
  -> Sweep confirmation

CallbackWorker
  -> Partner callback retry

SweepWorker
  -> Deposit Wallet -> Hot Wallet transfer

ReclaimWorker
  -> Wallet asset reclaim operation
```

Worker는 Partner가 직접 호출하지 않습니다. Partner는 API 조회와 callback 수신을 통해 결과를 확인합니다.

---

## 4. Deposit Architecture

입금 흐름:

```text
End User
  -> TRC20 transfer
  -> Deposit Wallet
  -> Tron Network
  -> DepositWorker
  -> Deposit(status=DETECTED)
  -> ConfirmWorker
  -> Deposit(status=CONFIRMED)
  -> CallbackWorker
  -> Partner callbackUrl
```

설계 이유:

- Wallet balance polling이 아니라 Transfer event 기반으로 감지합니다.
- txHash unique로 멱등성을 확보합니다.
- confirmation 이후에만 유효 입금으로 처리합니다.

---

## 5. Sweep Architecture

입금된 token은 Deposit Wallet에 장기간 보관하지 않고 Hot Wallet로 집계합니다.

```text
Deposit(status=CONFIRMED)
  -> SweepJob
  -> SweepWorker
  -> SweepLog(status=BROADCASTED)
  -> ConfirmWorker
  -> SweepLog(status=CONFIRMED or FAILED)
```

개념:

- SweepJob: 처리 대기 queue 역할
- SweepLog: 실행 이력 및 상태 추적
- Hot Wallet: 중앙 집계 지갑
- Gas Tank: Deposit Wallet의 TRX 부족 시 보충하는 지갑

보안상 Hot Wallet/Gas Tank의 privateKey는 외부에 공개되지 않습니다.

---

## 6. Callback Architecture

입금 확정 후 시스템은 Partner callbackUrl로 이벤트를 보냅니다.

```text
Deposit CONFIRMED
  -> CallbackLog PENDING
  -> HMAC signature 생성
  -> POST partner.callbackUrl
  -> 2xx 응답이면 SUCCESS
  -> 실패하면 retry
```

파트너 서버는 다음을 구현해야 합니다.

- HMAC signature 검증
- txHash/callbackId 멱등 처리
- 정상 처리 후 2xx 응답

---

## 7. Portal Architecture

Portal은 권한에 따라 Public/Developer 영역과 Admin 영역으로 나뉩니다.

```text
/login

/              Public / Developer
/admin         Admin / Operator
```

Public/Developer 영역:

- API Guide
- Data Model
- Data Flow
- Security
- Partner/User/Wallet/Deposit/Callback/Sweep 조회

Admin 영역:

- Partner 생성/수정
- API Key 생성/회전
- Member 관리
- Callback retry
- Sweep 운영 조회
- System/Monitoring 영역

---

## 8. State Model

Deposit:

```text
DETECTED -> CONFIRMED
DETECTED -> FAILED
```

Callback:

```text
PENDING -> SUCCESS
PENDING -> FAILED
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

현재 public integration의 핵심은 Deposit / Callback 흐름입니다. Withdrawal은 별도 운영 정책과 함께 확장됩니다.

---

## 9. Design Principles

- Partner 단위 데이터 격리
- privateKey 외부 미노출
- confirmation 이후 잔액 반영
- txHash 기반 멱등성
- Worker 기반 비동기 처리
- callback HMAC 검증
- Hot Wallet 중심 자산 집계
- Admin 기능과 Developer 조회 기능 분리

---

## 10. What Developers Should Not Depend On

다음 항목은 내부 구현 세부사항이므로 외부 연동 로직이 의존하면 안 됩니다.

- 내부 DB 테이블명
- Worker polling interval
- Hot Wallet 주소 변경 가능성
- Gas Tank refill 시점
- 내부 writer/server name
- privateKey 또는 encryptedPrivateKey
- callback retry의 정확한 실행 시각

외부 연동은 다음 기준에 의존해야 합니다.

- API response
- callback payload
- txHash
- callbackId
- documented status
