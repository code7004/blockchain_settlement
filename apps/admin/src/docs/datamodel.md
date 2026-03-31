# Data Models

## Overview

본 시스템은 블록체인 입출금 정산을 위해 다음 주요 데이터 모델을 사용합니다.

- Wallet
- Deposit
- Callback Payload
- Withdrawal (제한적)

※ 내부 보안 및 운영 관련 필드는 제외되어 있습니다.

---

# 1. Wallet

사용자에게 발급되는 입금 주소입니다.

## Schema

```json
{
  "id": "string",
  "address": "string",
  "externalUserId": "string",
  "status": "ACTIVE | SUSPENDED",
  "createdAt": "datetime"
}
```

---

## Field Description

| 필드           | 설명                          |
| -------------- | ----------------------------- |
| id             | Wallet 고유 ID                |
| address        | 블록체인 주소 (TRON)          |
| externalUserId | 파트너 시스템의 사용자 식별자 |
| status         | Wallet 상태                   |
| createdAt      | 생성 시간                     |

---

## Notes

- Wallet은 입금 식별용 주소입니다.
- privateKey는 외부에 노출되지 않습니다.
- 하나의 사용자에 여러 Wallet 생성이 가능합니다.

---

# 2. Deposit

블록체인 입금 트랜잭션 정보입니다.

## Schema

```json
{
  "id": "string",
  "txHash": "string",
  "address": "string",
  "fromAddress": "string",
  "amount": "string",
  "token": "string",
  "status": "DETECTED | CONFIRMED | FAILED",
  "externalUserId": "string",
  "blockNumber": "number",
  "detectedAt": "datetime",
  "confirmedAt": "datetime",
  "createdAt": "datetime"
}
```

---

## Field Description

| 필드           | 설명                   |
| -------------- | ---------------------- |
| id             | Deposit ID             |
| txHash         | 트랜잭션 해시 (고유값) |
| address        | 입금된 Wallet 주소     |
| fromAddress    | 송신 주소              |
| amount         | 입금 금액              |
| token          | 토큰 심볼 (예: USDT)   |
| status         | 입금 상태              |
| externalUserId | 사용자 식별자          |
| blockNumber    | 포함된 블록 번호       |
| detectedAt     | 감지 시점              |
| confirmedAt    | 확정 시점              |
| createdAt      | 생성 시간              |

---

## Status Description

| 상태      | 설명                 |
| --------- | -------------------- |
| DETECTED  | 입금 감지됨 (미확정) |
| CONFIRMED | 확정 완료            |
| FAILED    | 처리 실패            |

---

## Notes

- txHash 기준으로 중복 처리가 방지됩니다.
- CONFIRMED 이후에만 유효한 입금으로 간주됩니다.

---

# 3. Callback Payload

입금 확정 시 파트너에게 전달되는 데이터입니다.

## Schema

```json
{
  "event": "deposit.confirmed",
  "data": {
    "txHash": "string",
    "address": "string",
    "amount": "string",
    "token": "string",
    "externalUserId": "string",
    "confirmedAt": "datetime"
  }
}
```

---

## Notes

- Callback은 CONFIRMED 상태에서만 발생합니다.
- 반드시 HMAC 서명을 검증해야 합니다.

---

# 4. Data Rules

## Idempotency

- 동일 txHash는 한 번만 처리됩니다.

---

## Confirmation Rule

- 입금은 CONFIRMED 상태 이후에만 유효합니다.

---

## Data Isolation

- 모든 데이터는 Partner 단위로 분리됩니다.

---

# 5. Security Notice

다음 정보는 외부에 제공되지 않습니다:

- privateKey 및 암호화 키
- 내부 callback 로그
- retry / queue 상태
- 시스템 내부 식별자 및 관계 구조

---

# 7. Summary

- Wallet: 입금 주소
- Deposit: 입금 트랜잭션
- Callback: 입금 확정 이벤트
- Withdrawal: 출금 요청 (제한적)

👉 이 모델을 기반으로 API가 동작합니다.
