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

입금 트랜잭션이 확정(CONFIRMED) 되었을 때 파트너 서버로 전송되는 데이터

## Schema

```ts
export interface IDepositConfirmedCallback {
  event: 'CONFIRMED'; // 이벤트 타입, CONFIRMED: 입금 확정 완료
  to: string; // 입금 대상 주소 (우리 시스템 deposit address)
  from: string; //입금 발생 주소 (사용자 또는 외부 지갑)
  depositId: string; // 내부 Deposit 식별자 (UUID)
  externalUserId: string; // 파트너 시스템에서 사용하는 사용자 ID
  txHash: string; // 블록체인 트랜잭션 해시 (고유값)
  amount: string; // 입금 금액 (raw 값, decimals 적용 필요)
  tokenSymbol: string; // 토큰 심볼 예: USDT, mUSDT
  detectedAt: string; // ISO 8601, 입금 감지 시점 (Watcher에서 감지된 시간, UTC)
  confirmedAt: string; // ISO 8601, 입금 확정 시점 (Confirmation 완료 시점, UTC)
  confirmations: number; // 확정 기준 블록 컨펌 수, 예: 5 confirmations
  blockNumber: number; // 해당 트랜잭션이 포함된 블록 번호
  contractAddress: string; // 토큰 컨트랙트 주소 (TRC20)
  callbackId: string; // Callback 고유 ID (재시도 / 추적용)
}
```

---

## Notes

- decimals=6 → 1000000 = 1.0 USDT
- 시간 필드 (detectedAt, confirmedAt)는 UTC 기준 ISO8601 형식입니다.
- amount는 decimals가 적용되지 않은 raw 값입니다.
- callbackId는 재시도 시 동일하게 전달되며, 중복 처리 방지에 사용할 수 있습니다.
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
