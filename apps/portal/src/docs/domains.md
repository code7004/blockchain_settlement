# Domains

## Overview

이 문서는 시스템의 주요 도메인을 파트너/포털 개발자 관점에서 설명합니다.

도메인은 단순 화면 메뉴가 아니라 정산 흐름의 책임 단위입니다.

---

## 1. Partner

Partner는 솔루션을 사용하는 외부 서비스 단위입니다.

역할:

- API Key 인증 주체
- User / Wallet / Deposit 데이터 격리 기준
- callbackUrl 수신 주체

Partner가 관리하는 값:

- Partner name
- callbackUrl
- callbackSecret
- API Key

보안:

- raw API Key는 최초 발급 시에만 확인합니다.
- callbackSecret은 HMAC 검증에 사용하며 외부에 노출하면 안 됩니다.

---

## 2. Member

Member는 Portal 로그인 계정입니다.

역할:

- Admin / Developer Portal 접근
- 권한별 메뉴 접근 제어

역할:

```text
OWNER
OPERATOR
DEVELOPER
```

일반 파트너 API 호출은 Member JWT가 아니라 Partner API Key를 사용합니다.

---

## 3. User

User는 Partner 내부의 최종 사용자입니다.

역할:

- Deposit Wallet의 소유자
- 입금 식별의 사용자 기준

주요 필드:

- `externalUserId`
- `isActive`

규칙:

- `externalUserId`는 Partner 내부에서 unique입니다.
- User 생성 시 Wallet이 자동 생성됩니다.

---

## 4. Wallet

Wallet은 사용자에게 발급되는 Tron Deposit Address입니다.

역할:

- 입금 주소 제공
- Deposit의 `toAddress` 매칭 기준
- Sweep의 출발 주소

상태:

```text
ACTIVE
SUSPENDED
LOCKED
PENDING
```

보안:

- privateKey는 API로 제공되지 않습니다.
- Partner는 address만 사용합니다.

---

## 5. Deposit

Deposit은 체인에서 감지된 입금 트랜잭션입니다.

역할:

- txHash 기반 입금 기록
- confirmation 상태 관리
- callback 생성 기준
- balance 계산 기준

상태:

```text
DETECTED
CONFIRMED
FAILED
```

규칙:

- DETECTED는 아직 확정 입금이 아닙니다.
- CONFIRMED 이후에만 파트너 잔액 반영을 권장합니다.
- txHash는 unique입니다.

---

## 6. Callback

Callback은 입금 확정 이벤트를 파트너 서버로 전달하는 도메인입니다.

역할:

- CONFIRMED Deposit 이벤트 전달
- HMAC signature 생성
- retry 상태 관리

상태:

```text
PENDING
SUCCESS
FAILED
```

파트너 책임:

- HMAC 검증
- txHash/callbackId 멱등 처리
- 2xx 응답 반환

---

## 7. Sweep

Sweep은 Deposit Wallet에 들어온 token을 Hot Wallet로 옮기는 도메인입니다.

구성:

- SweepJob: 처리 대기 작업
- SweepLog: 실행 이력과 상태

상태:

```text
PENDING
BROADCASTED
CONFIRMED
FAILED
SKIPPED
```

파트너 관점:

- 직접 호출하는 기능이 아니라 운영/조회 대상입니다.
- Sweep 지연이 입금 callback 자체를 의미하지는 않습니다.

---

## 8. Withdrawal

Withdrawal은 출금 요청과 체인 전송 상태를 관리하는 도메인입니다.

상태 모델:

```text
REQUESTED
APPROVED
BROADCASTED
CONFIRMED
FAILED
```

현재 public Partner API 문서에서는 출금 연동을 활성 기능으로 안내하지 않습니다.

출금 기능은 운영 승인, Hot Wallet 정책, double broadcast 방지, chain confirmation 추적과 함께 별도 문서로 제공됩니다.

---

## 9. Balance

Balance는 현재 단순 계산 기반입니다.

```text
sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

주의:

- DETECTED Deposit은 제외됩니다.
- 향후 double-entry ledger로 확장될 수 있습니다.

---

## 10. Blockchain / Monitor

Portal 운영 보조 도메인입니다.

기능:

- wallet balance 조회
- test transfer
- txHash lifecycle 조회

권한:

- 일반적으로 Portal JWT 권한이 필요합니다.
- Partner API Key로 직접 호출하는 public API가 아닙니다.

---

## 11. Domain Relationship

```text
Partner
  -> User
  -> Wallet
  -> Deposit
  -> Callback
  -> Sweep

Partner
  -> Withdrawal
  -> Balance
```

핵심:

- 모든 정산 데이터는 Partner를 기준으로 추적됩니다.
- User는 Partner에 종속됩니다.
- Wallet은 User에 종속됩니다.
- Deposit은 Wallet 주소 매칭으로 생성됩니다.
- Callback은 Deposit 확정 이후 생성됩니다.
- Sweep은 Deposit 확정 이후 자산 집계를 담당합니다.

---

## 12. Summary

파트너 개발자가 반드시 이해해야 하는 도메인:

- Partner
- User
- Wallet
- Deposit
- Callback

Portal 개발자가 추가로 이해해야 하는 도메인:

- Sweep
- Balance
- Member
- Blockchain / Monitor
- Withdrawal
