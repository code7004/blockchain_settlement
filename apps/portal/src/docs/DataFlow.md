# Data Flow

## Overview

이 문서는 파트너 개발자와 포털 개발자가 입금 정산 흐름을 이해할 수 있도록 전체 데이터 흐름을 설명합니다.

핵심 흐름:

```text
User 생성
  -> Wallet 발급
  -> 사용자가 Deposit Wallet으로 token 전송
  -> Deposit 감지
  -> Confirmation
  -> Callback
  -> Sweep
```

---

## 1. User & Wallet Issuing Flow

```text
Partner Server
  -> POST /users
  -> API Key 인증
  -> User 생성
  -> Wallet 자동 생성
  -> Deposit Address 반환
```

설명:

- Partner 서버는 `externalUserId`를 전달합니다.
- 시스템은 Partner 기준으로 User를 생성합니다.
- User 생성 시 Deposit Wallet이 함께 생성됩니다.
- Partner는 Wallet address를 사용자에게 Deposit Address로 안내합니다.

주의:

- privateKey는 응답에 포함되지 않습니다.
- 동일 Partner 안에서 같은 `externalUserId`는 중복 생성할 수 없습니다.

---

## 2. Deposit Detection Flow

```text
End User
  -> TRC20 transfer
  -> Deposit Wallet
  -> Tron Network
  -> DepositWorker
  -> Transfer event 감지
  -> toAddress 기준 Wallet 매칭
  -> Deposit(status=DETECTED)
```

설명:

- 시스템은 Wallet balance를 계속 조회하는 방식이 아니라 TRC20 Transfer event를 block 단위로 확인합니다.
- 수신 주소가 시스템 Wallet과 일치하면 Deposit을 생성합니다.
- `txHash`는 unique이므로 같은 트랜잭션은 중복 저장되지 않습니다.

DETECTED 의미:

- 체인 이벤트는 감지했습니다.
- 아직 최종 확정으로 보지 않습니다.
- 파트너 서비스 잔액에 반영하지 않는 것을 권장합니다.

---

## 3. Confirmation Flow

```text
Deposit(status=DETECTED)
  -> ConfirmWorker
  -> latestBlock 확인
  -> confirmation count 충족
  -> Deposit(status=CONFIRMED)
```

설명:

- 블록체인 트랜잭션은 즉시 최종 확정으로 보지 않습니다.
- 시스템은 지정된 confirmation 수를 만족한 뒤 CONFIRMED로 전환합니다.
- CONFIRMED 이후 callback과 sweep 준비가 시작됩니다.

CONFIRMED 이후 발생:

- CallbackLog 생성
- SweepJob 생성 조건 확인
- Partner callback 전송 대상이 됨

---

## 4. Callback Flow

```text
Deposit(status=CONFIRMED)
  -> CallbackLog(status=PENDING)
  -> CallbackWorker
  -> POST partner.callbackUrl
  -> 2xx response
  -> CallbackLog(status=SUCCESS)
```

실패 시:

```text
CallbackLog(status=PENDING)
  -> retry
  -> max attempts 초과
  -> CallbackLog(status=FAILED)
```

파트너 서버의 책임:

- `X-Signature` 검증
- `txHash` 또는 `callbackId` 기준 멱등 처리
- 정상 처리 시 2xx 응답
- 내부 장애 시 재처리 가능한 구조 유지

---

## 5. Sweep Flow

```text
Deposit(status=CONFIRMED)
  -> SweepJob(status=PENDING)
  -> SweepWorker
  -> Deposit Wallet token balance 확인
  -> Deposit Wallet TRX balance 확인
  -> 필요 시 Gas Tank refill
  -> token transfer broadcast
  -> SweepLog(status=BROADCASTED)
  -> ConfirmWorker
  -> SweepLog(status=CONFIRMED or FAILED)
```

설명:

- Sweep은 Deposit Wallet에 들어온 token을 Hot Wallet로 모으는 작업입니다.
- TRC20 token transfer에는 TRX가 필요합니다.
- Deposit Wallet의 TRX가 부족하면 Gas Tank에서 refill을 시도합니다.
- broadcast 이후에도 체인 receipt 확인 전까지는 최종 완료가 아닙니다.

파트너 서비스 관점:

- Sweep은 보통 파트너가 직접 호출하지 않습니다.
- Portal에서 상태를 조회하여 자산 집계 상태를 확인할 수 있습니다.

---

## 6. Balance Flow

현재 단순 계산:

```text
balance = sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

주의:

- DETECTED Deposit은 제외됩니다.
- Withdrawal 정책은 현재 제한적입니다.
- Double-entry ledger는 향후 확장 예정입니다.

---

## 7. Status Summary

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

---

## 8. Timing Guide

| 이벤트            | 발생 시점            | 파트너 처리                |
| ----------------- | -------------------- | -------------------------- |
| User created      | `POST /users` 성공   | Deposit Address 저장       |
| Deposit DETECTED  | Transfer event 감지  | 입금 확인 중으로 표시 가능 |
| Deposit CONFIRMED | confirmation 충족    | 유효 입금으로 처리         |
| Callback SUCCESS  | 파트너 서버 2xx 응답 | 내부 처리 완료             |
| Sweep BROADCASTED | Hot Wallet 전송 제출 | 운영 조회용                |
| Sweep CONFIRMED   | 체인 receipt 성공    | 집계 완료                  |

---

## 9. Failure Cases

Deposit이 보이지 않는 경우:

- 사용자가 다른 네트워크로 전송했을 수 있습니다.
- token contract가 지원 대상과 다를 수 있습니다.
- 아직 DepositWorker가 해당 block을 처리하지 않았을 수 있습니다.

Callback이 실패하는 경우:

- 파트너 callbackUrl이 응답하지 않을 수 있습니다.
- `X-Signature` 검증 실패로 파트너가 401을 반환했을 수 있습니다.
- 파트너 서버가 2xx가 아닌 응답을 반환했을 수 있습니다.

Sweep이 지연되는 경우:

- Deposit Wallet에 TRX가 부족할 수 있습니다.
- Gas Tank 잔액이 부족할 수 있습니다.
- Tron 네트워크 또는 endpoint 지연이 있을 수 있습니다.

---

## 10. Developer Checklist

- `x-api-key` 인증을 적용했습니다.
- User 생성 후 Deposit Address를 저장했습니다.
- 사용자가 Tron/TRC20 token만 보내도록 안내했습니다.
- callback endpoint가 HTTPS로 공개되어 있습니다.
- callback HMAC 검증을 구현했습니다.
- callback 중복 수신에 대비했습니다.
- CONFIRMED 이후에만 잔액을 반영합니다.
