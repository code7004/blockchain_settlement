# Data Models

## Overview

이 문서는 파트너/포털 개발자가 API 응답과 callback payload를 이해하기 위해 필요한 공개 데이터 모델을 설명합니다.

보안상 다음 정보는 문서와 API 응답에 포함하지 않습니다.

- privateKey
- encryptedPrivateKey
- master key
- hot wallet privateKey
- gas tank privateKey
- callbackSecret
- raw API Key

---

## 1. Partner

파트너 서비스 단위입니다.

Admin 권한에서 생성/관리합니다.

공개/표시 가능한 주요 필드:

```json
{
  "id": "partner_uuid",
  "name": "partner-name",
  "callbackUrl": "https://partner.example.com/callback",
  "apiKeyPrefix": "cws_xxxxxx",
  "isActive": true,
  "createdAt": "2026-04-22T00:00:00.000Z",
  "updatedAt": "2026-04-22T00:00:00.000Z"
}
```

설명:

| 필드         | 설명                          |
| ------------ | ----------------------------- |
| id           | Partner 식별자                |
| name         | Partner 이름                  |
| callbackUrl  | 입금 확정 callback을 받을 URL |
| apiKeyPrefix | API Key 식별용 prefix         |
| isActive     | 활성 여부                     |

주의:

- `apiKeyHash`, `callbackSecret`은 외부에 표시하지 않습니다.
- raw API Key는 최초 발급 시에만 확인할 수 있습니다.

---

## 2. User

파트너 내부 사용자입니다.

```json
{
  "id": "user_uuid",
  "partnerId": "partner_uuid",
  "externalUserId": "user_123",
  "isActive": true,
  "createdAt": "2026-04-22T00:00:00.000Z",
  "updatedAt": "2026-04-22T00:00:00.000Z"
}
```

설명:

| 필드           | 설명                      |
| -------------- | ------------------------- |
| id             | 시스템 내부 User ID       |
| partnerId      | 소속 Partner ID           |
| externalUserId | 파트너 시스템의 사용자 ID |
| isActive       | 활성 여부                 |

규칙:

- `externalUserId`는 동일 Partner 안에서 unique입니다.
- Partner API에서는 API Key 기준으로 partnerId가 자동 적용됩니다.

---

## 3. Wallet

사용자에게 발급되는 Tron Deposit Address입니다.

```json
{
  "id": "wallet_uuid",
  "partnerId": "partner_uuid",
  "userId": "user_uuid",
  "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "status": "ACTIVE",
  "assetsSnapshot": null,
  "createdAt": "2026-04-22T00:00:00.000Z",
  "updatedAt": "2026-04-22T00:00:00.000Z"
}
```

상태:

```text
ACTIVE
SUSPENDED
LOCKED
PENDING
```

설명:

| 필드           | 설명                               |
| -------------- | ---------------------------------- |
| id             | Wallet ID                          |
| address        | Tron 주소                          |
| status         | Wallet 상태                        |
| assetsSnapshot | 마지막 자산 스냅샷, 실시간 값 아님 |

주의:

- Wallet privateKey는 API로 제공되지 않습니다.
- Wallet은 입금 식별 주소이며 장기 보관 지갑으로 사용하지 않습니다.

---

## 4. Deposit

블록체인에서 감지된 입금 트랜잭션입니다.

```json
{
  "id": "deposit_uuid",
  "partnerId": "partner_uuid",
  "userId": "user_uuid",
  "walletId": "wallet_uuid",
  "tokenSymbol": "USDT",
  "tokenContract": "TRC20_CONTRACT_ADDRESS",
  "txHash": "transaction_hash",
  "fromAddress": "T_FROM_ADDRESS",
  "toAddress": "T_DEPOSIT_ADDRESS",
  "amount": "100000000",
  "blockNumber": 123456,
  "status": "CONFIRMED",
  "reason": null,
  "detectedAt": "2026-04-22T00:00:00.000Z",
  "confirmedAt": "2026-04-22T00:01:00.000Z",
  "createdAt": "2026-04-22T00:00:00.000Z"
}
```

상태:

```text
DETECTED
CONFIRMED
FAILED
```

설명:

| 필드        | 설명                       |
| ----------- | -------------------------- |
| txHash      | 체인 트랜잭션 해시, unique |
| fromAddress | 송신 주소                  |
| toAddress   | Deposit Wallet 주소        |
| amount      | raw token amount           |
| blockNumber | 감지 블록 번호             |
| detectedAt  | 감지 시점                  |
| confirmedAt | 확정 시점                  |

Amount:

- USDT/mUSDT는 일반적으로 decimals 6입니다.
- `100000000` raw amount는 `100.000000` token입니다.

---

## 5. Callback Payload

Deposit이 CONFIRMED 되었을 때 Partner callbackUrl로 전송되는 payload입니다.

```ts
export interface DepositConfirmedCallback {
  event: 'CONFIRMED';
  to: string;
  from: string;
  depositId: string;
  externalUserId: string;
  txHash: string;
  amount: string;
  tokenSymbol: string;
  confirmedAt: string;
  detectedAt: string;
  confirmations: number;
  blockNumber: number;
  contractAddress: string;
  callbackId: string;
}
```

설명:

| 필드           | 설명                                |
| -------------- | ----------------------------------- |
| event          | 현재 입금 확정 이벤트는 `CONFIRMED` |
| to             | Deposit Wallet 주소                 |
| from           | 송신 주소                           |
| depositId      | 시스템 Deposit ID                   |
| externalUserId | 파트너 사용자 ID                    |
| txHash         | 체인 txHash                         |
| amount         | raw token amount                    |
| confirmations  | 확정 기준 블록 수                   |
| callbackId     | callback retry 추적 ID              |

주의:

- callback은 중복 전송될 수 있으므로 멱등 처리해야 합니다.
- `txHash` 또는 `callbackId`를 멱등 key로 사용하세요.

---

## 6. CallbackLog

Portal에서 callback 처리 상태를 확인하기 위한 모델입니다.

```json
{
  "id": "callback_uuid",
  "partnerId": "partner_uuid",
  "depositId": "deposit_uuid",
  "txHash": "transaction_hash",
  "eventType": "CONFIRMED",
  "callbackUrl": "https://partner.example.com/callback",
  "attemptCount": 1,
  "maxAttempts": 3,
  "lastStatusCode": 200,
  "status": "SUCCESS",
  "lastAttemptAt": "2026-04-22T00:01:10.000Z",
  "createdAt": "2026-04-22T00:01:00.000Z"
}
```

상태:

```text
PENDING
SUCCESS
FAILED
```

주의:

- `requestSignature`와 `requestBody`는 운영 확인 용도로 사용될 수 있으나, 외부 공개 화면에서는 필요한 범위만 표시해야 합니다.

---

## 7. SweepLog

Deposit Wallet에서 Hot Wallet로 자산을 이동하는 Sweep 실행 이력입니다.

```json
{
  "id": "sweep_log_uuid",
  "partnerId": "partner_uuid",
  "depositId": "deposit_uuid",
  "txHash": "sweep_tx_hash",
  "fromAddress": "T_DEPOSIT_ADDRESS",
  "toAddress": "T_HOT_WALLET_ADDRESS",
  "amount": "100.000000",
  "feeAmount": "0.123",
  "feeSymbol": "TRX",
  "status": "CONFIRMED",
  "reason": null,
  "errorMessage": null,
  "createdAt": "2026-04-22T00:02:00.000Z"
}
```

상태:

```text
PENDING
BROADCASTED
CONFIRMED
FAILED
SKIPPED
```

설명:

- `BROADCASTED`: token transfer가 체인에 제출됨
- `CONFIRMED`: 체인 receipt 기준 확정됨
- `FAILED`: 체인 또는 시스템 처리 실패
- `SKIPPED`: zero balance, hot wallet 주소 일치 등 정책상 제외

---

## 8. Withdrawal

Withdrawal 모델은 존재하지만, 현재 public Partner API 연동 문서에서는 활성 출금 연동 범위로 안내하지 않습니다.

상태 모델:

```text
REQUESTED
APPROVED
BROADCASTED
CONFIRMED
FAILED
```

출금 연동이 활성화될 경우 별도 API 문서와 운영 승인 정책이 제공됩니다.

---

## 9. Balance

현재 balance 계산은 단순 합산 기반입니다.

```text
balance = sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

주의:

- DETECTED Deposit은 제외됩니다.
- Withdrawal 정책은 Phase3/Phase4에서 고도화됩니다.
- Double-entry ledger는 향후 확장 예정입니다.

---

## 10. Summary

개발자가 주로 다루는 모델:

- User
- Wallet
- Deposit
- Callback Payload

Portal에서 추가로 확인하는 모델:

- CallbackLog
- SweepLog
- Balance

보안상 제공하지 않는 모델/필드:

- privateKey
- encryptedPrivateKey
- raw API Key
- callbackSecret
- internal env / key material
