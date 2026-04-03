# API Guide (with Real Integration Flow)

## Overview

이 API는 Tron 네트워크 기반 멀티 파트너 입출금 정산 시스템입니다.

파트너사는 API를 통해 사용자 지갑을 생성하고, 입금 이벤트를 수신하며, 정산 데이터를 조회할 수 있습니다.

본 시스템은 **입금 감지 → 확정 → 콜백 → 잔액 반영** 흐름으로 동작합니다.

---

## 전체 흐름 (핵심)

```
Transfer → DETECTED → CONFIRMED → CALLBACK → SWEEP

[1] 포털 접속 → Partner 생성 → API Key 발급
[2] API 연동 시작 → API Key 인증
[3] User 생성 (Wallet 자동 생성) → Deposit Address 확보
[4] 사용자 입금 (Tron 전송)
[5] 시스템 처리
    DETECTED → CONFIRMED
[6] Callback 수신 (핵심 이벤트)
[7] 내부 잔액 반영
```

---

# 1. Getting Started

## Supported Network

- Tron (TRC20 / USDT)

---

# 2. Authentication

모든 요청은 API Key 기반으로 인증한다.

```
Authorization: Bearer {API_KEY}
```

---

# 3. Step 1 — User 생성 (핵심 시작점)

## Request

```
POST /users
```

## Request Body

```
{
  "externalUserId": "user_123"
}
```

## Response

```
{
  "id": "user_uuid",
  "externalUserId": "user_123",
  "wallet": {
    "id": "wallet_uuid",
    "address": "TXXXXXXX"
  },
  "createdAt": "2026-03-01T00:00:00Z"
}
```

---

## 중요

- User 생성 시 **Wallet 자동 생성**
- 해당 Wallet 주소가 **입금 주소 (Deposit Address)**

---

# 4. Step 2 — Deposit Address 전달

User 생성 후 Wallet 주소를 사용자에게 전달한다.

```
Deposit Address: TXXXXXXX
```

---

# 5. Step 3 — 사용자 입금

사용자는 위 주소로 Tron (USDT)을 전송한다.

설명:

- TRC20 토큰 전송
- 해당 주소로 들어온 트랜잭션을 시스템이 감지

---

# 6. Deposit Flow

입금은 다음 단계로 처리된다.

```
User → Deposit Address
      ↓
DETECTED
      ↓
CONFIRMED
      ↓
Callback
      ↓
Balance 반영
```

---

## 상태 정의

### DETECTED

- 블록에서 트랜잭션 감지
- 아직 확정되지 않음

### CONFIRMED

- 지정된 블록 수 이후 확정
- 이 시점부터 유효한 입금

---

### 중요 규칙

- CONFIRMED 이전 금액은 반영되지 않음
- txHash 기준 중복 처리 방지

---

# 7. Step 4 — Callback

입금이 CONFIRMED 되면 Callback이 전송된다.

## Request

```
POST {partner.callbackUrl}
```

---

## Headers

```
Content-Type: application/json
X-Signature: {HMAC_SIGNATURE}
```

---

## Body

```
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

## Notes

- decimals=6 → 1000000 = 1.0 USDT
- 시간 필드 (detectedAt, confirmedAt)는 UTC 기준 ISO8601 형식입니다.
- amount는 decimals가 적용되지 않은 raw 값입니다.
- callbackId는 재시도 시 동일하게 전달되며, 중복 처리 방지에 사용할 수 있습니다.
- Callback은 CONFIRMED 상태에서만 발생합니다.
- 반드시 HMAC 서명을 검증해야 합니다.

---

## Callback 처리 (Node.js 예제)

```js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const CALLBACK_SECRET = 'YOUR_CALLBACK_SECRET';

app.post('/callback', (req, res) => {
  const signature = req.headers['x-signature'];
  const rawBody = JSON.stringify(req.body);

  const expected = crypto.createHmac('sha256', CALLBACK_SECRET).update(rawBody).digest('hex');

  if (signature !== expected) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'deposit.confirmed') {
    console.log('Deposit confirmed:', data);

    // 해야 할 것
    // - 내부 잔액 증가
    // - txHash 기준 중복 처리 방지
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

---

## 중요

- 반드시 **200 OK 반환**
- 실패 시 재시도 발생

## Retry 정책

- 최대 3회 재시도
- 실패 시 status = FAILED 기록

```
CallbackLog.status

PENDING → SUCCESS → FAILED
```

# 8. Callback Retry (Phase1.5 추가)

운영자가 실패한 콜백을 수동으로 재시도할 수 있다.

---

## 사용 목적

- 파트너 서버 장애 대응
- 네트워크 오류 복구

---

## 사용 방법

### 1) 선택 재시도

경로:

- 포털 > CallbackList
- 실패 또는 특정 콜백 선택
- "재시도" 버튼 클릭

설명:

- 선택된 callback_log 기준으로 재전송 수행
- attemptCount 증가
- 성공 시 status = SUCCESS로 변경

---

### 2) 전체 재시도 (Failed 대상)

경로:

- 포털 > CallbackList
- Status Filter → FAILED 선택
- "전체 재시도" 실행

설명:

- FAILED 상태의 모든 callback_log 대상 재시도
- batch 처리 방식으로 수행
- maxAttempts 초과 여부 체크 후 실행

---

---

# 9. Step 5 — Deposit 조회 (보조 기능)

## Request

```
GET /deposits
```

## Query

```
limit=20
offset=0
status=CONFIRMED
externalUserId=user_123
```

## Response

```
{
  "data": [
    {
      "id": "deposit_id",
      "txHash": "0x123",
      "amount": "100.0",
      "status": "CONFIRMED",
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

# 10. Optional — Wallet 추가 생성

정책에 따라 Wallet을 추가 생성할 수 있다.

## Request

```
POST /wallets
```

## Body

```
{
  "externalUserId": "user_123"
}
```

---

## 정책

- 기본: **User : Wallet = 1 : 1**
- 필요 시 확장 가능

---

# 11. Error Handling

## Response Format

```
{
  "statusCode": 400,
  "code": "INVALID_REQUEST",
  "message": "Invalid parameter",
  "timestamp": "2026-03-01T00:00:00Z",
  "path": "/wallets"
}
```

---

## 주요 에러 코드

- INVALID_REQUEST
- UNAUTHORIZED
- NOT_FOUND
- DUPLICATE_TX

---

# 12. Full JavaScript Example

```js
const axios = require('axios');

const API_BASE = 'API_BASE_URL';
const API_KEY = 'YOUR_API_KEY';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// 1. User 생성
async function createUser() {
  const res = await api.post('/users', {
    externalUserId: 'user_123',
  });

  return res.data;
}

// 2. Deposit Address 획득
async function issueDepositAddress() {
  const user = await createUser();
  console.log('Address:', user.wallet.address);
}

// 3. Deposit 조회
async function getDeposits() {
  const res = await api.get('/deposits', {
    params: {
      externalUserId: 'user_123',
      status: 'CONFIRMED',
    },
  });

  console.log(res.data);
}

// 실행 흐름
async function run() {
  await issueDepositAddress();

  // 사용자 입금 (외부에서 수행)

  // Callback 수신 후 처리

  await getDeposits();
}

run();
```

---

# 13. 핵심 요약

```
✔ createUser = 시작점 (Wallet 자동 생성)
✔ Deposit Address = 입금 식별 키
✔ CONFIRMED 이후만 유효
✔ Callback = 실제 입금 이벤트
✔ txHash = 멱등 처리 기준
```
