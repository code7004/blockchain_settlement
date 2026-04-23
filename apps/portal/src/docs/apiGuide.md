# API Guide

## Overview

이 문서는 파트너 연동 개발자가 입금 주소 발급, 입금 조회, callback 수신을 구현하기 위해 필요한 정보를 설명합니다.

현재 public Partner API의 핵심 흐름은 다음과 같습니다.

```text
1. Admin/운영자가 Partner를 생성하고 API Key를 발급
2. Partner 서버가 x-api-key로 API 호출
3. User 생성
4. 시스템이 Deposit Wallet 자동 생성
5. 사용자가 Deposit Wallet으로 TRC20 token 전송
6. 시스템이 DETECTED -> CONFIRMED 처리
7. Partner callbackUrl로 CONFIRMED callback 전송
8. Partner 서버가 txHash/callbackId 기준으로 멱등 처리
```

---

## 1. Base URL

환경별 API base URL은 운영자에게 전달받습니다.

예:

```text
https://api.example.com
```

Swagger:

```text
/docs/api
```

---

## 2. Authentication

Partner API는 API Key 인증을 사용합니다.

Header:

```http
x-api-key: {PARTNER_API_KEY}
```

주의:

- `Authorization: Bearer`가 아니라 `x-api-key`를 사용합니다.
- API Key는 Partner 단위로 발급됩니다.
- API Key 원문은 최초 발급 시에만 확인 가능합니다.
- API Key가 유출되면 즉시 운영자에게 rotate를 요청해야 합니다.

---

## 3. Pagination

목록 API는 기본적으로 pagination을 사용합니다.

Query:

```text
limit=20
offset=0
```

Response:

```json
{
  "data": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

---

## 4. Create User

파트너 서비스의 사용자를 생성합니다.

요청 시 시스템은 해당 User에 대한 Deposit Wallet을 자동 생성합니다.

Endpoint:

```http
POST /users
```

Headers:

```http
x-api-key: {PARTNER_API_KEY}
Content-Type: application/json
```

Request:

```json
{
  "externalUserId": "user_123"
}
```

Response 예:

```json
{
  "id": "user_uuid",
  "partnerId": "partner_uuid",
  "externalUserId": "user_123",
  "isActive": true,
  "wallets": [
    {
      "id": "wallet_uuid",
      "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "status": "ACTIVE"
    }
  ],
  "createdAt": "2026-04-22T00:00:00.000Z",
  "updatedAt": "2026-04-22T00:00:00.000Z"
}
```

응답 형태는 API 버전에 따라 일부 필드가 달라질 수 있으므로 실제 Swagger 응답도 함께 확인하세요.

규칙:

- `externalUserId`는 Partner 내부에서 unique입니다.
- 이미 생성된 사용자라면 중복 생성 대신 기존 사용자 조회 흐름을 사용하세요.
- Wallet privateKey는 응답에 포함되지 않습니다.

---

## 5. Get Users

Partner에 속한 User 목록을 조회합니다.

Endpoint:

```http
GET /users
```

Query:

```text
limit=20
offset=0
externalUserId=user_123
keyword=user
isActive=true
```

Example:

```bash
curl -X GET "https://api.example.com/users?limit=20&offset=0" \
  -H "x-api-key: {PARTNER_API_KEY}"
```

---

## 6. Get User Detail

Partner에 속한 특정 User를 `externalUserId`로 조회합니다.

Endpoint:

```http
GET /users/{externalUserId}
```

Example:

```bash
curl -X GET "https://api.example.com/users/user_123" \
  -H "x-api-key: {PARTNER_API_KEY}"
```

사용 목적:

- Deposit Address 재확인
- User 활성 상태 확인
- Wallet 매핑 확인

---

## 7. Get Wallets

Partner에 속한 Wallet 목록을 조회합니다.

Endpoint:

```http
GET /wallets
```

Query:

```text
limit=20
offset=0
keyword=TXXXX
status=ACTIVE
```

Response 예:

```json
{
  "data": [
    {
      "id": "wallet_uuid",
      "partnerId": "partner_uuid",
      "userId": "user_uuid",
      "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "status": "ACTIVE",
      "createdAt": "2026-04-22T00:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

주의:

- Wallet은 입금 식별 주소입니다.
- privateKey는 어떤 API에서도 제공되지 않습니다.

---

## 8. Deposit Address 안내

User 생성 또는 Wallet 조회로 얻은 `address`를 사용자에게 Deposit Address로 안내합니다.

예:

```text
Network: Tron
Token: USDT TRC20 또는 테스트넷 mUSDT
Deposit Address: TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

사용자 안내 시 주의:

- 다른 네트워크의 토큰을 보내지 않도록 안내하세요.
- 운영 환경 token과 테스트 환경 token을 혼동하지 않도록 안내하세요.
- 주소를 잘못 입력한 전송은 복구가 어려울 수 있습니다.

---

## 9. Get Deposits

입금 내역을 조회합니다.

Endpoint:

```http
GET /deposits
```

Query:

```text
limit=20
offset=0
txHash={txHash}
```

Response 예:

```json
{
  "data": [
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
      "detectedAt": "2026-04-22T00:00:00.000Z",
      "confirmedAt": "2026-04-22T00:01:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Amount:

- 현재 amount는 token raw amount 기준입니다.
- USDT/mUSDT decimals가 6이면 `100000000`은 `100.000000` token입니다.

상태:

```text
DETECTED   감지됨, 아직 확정 아님
CONFIRMED  확정됨, callback 대상
FAILED     처리 실패
```

중요:

- Partner 서비스의 잔액 반영은 `CONFIRMED` 이후에만 수행하세요.
- `DETECTED` 상태는 사용자에게 "입금 확인 중" 정도로 표시하는 것이 안전합니다.

---

## 10. Callback

Deposit이 CONFIRMED 되면 시스템은 Partner의 callbackUrl로 이벤트를 전송합니다.

Method:

```http
POST {partner.callbackUrl}
```

Headers:

```http
Content-Type: application/json
X-Signature: {HMAC_SHA256_SIGNATURE}
```

Body:

```json
{
  "event": "CONFIRMED",
  "to": "T_DEPOSIT_ADDRESS",
  "from": "T_SENDER_ADDRESS",
  "depositId": "deposit_uuid",
  "externalUserId": "user_123",
  "txHash": "transaction_hash",
  "amount": "100000000",
  "tokenSymbol": "USDT",
  "confirmedAt": "2026-04-22T00:01:00.000Z",
  "detectedAt": "2026-04-22T00:00:00.000Z",
  "confirmations": 5,
  "blockNumber": 123456,
  "contractAddress": "TRC20_CONTRACT_ADDRESS",
  "callbackId": "callback_uuid"
}
```

Callback 처리 규칙:

- `X-Signature`를 반드시 검증하세요.
- `txHash` 또는 `callbackId` 기준으로 멱등 처리하세요.
- 정상 처리 후 `2xx` 응답을 반환하세요.
- `2xx`가 아니거나 timeout이면 retry 대상이 됩니다.

---

## 11. HMAC Verification Example

Node.js / Express 예제:

```js
const express = require('express');
const crypto = require('crypto');

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  }),
);

const CALLBACK_SECRET = process.env.CALLBACK_SECRET;

app.post('/wallet/callback', (req, res) => {
  const signature = req.header('x-signature');
  const expected = crypto.createHmac('sha256', CALLBACK_SECRET).update(req.rawBody).digest('hex');

  if (signature !== expected) {
    return res.status(401).send('invalid signature');
  }

  const event = req.body;

  if (event.event === 'CONFIRMED') {
    // 1. txHash 또는 callbackId 중복 처리 확인
    // 2. externalUserId 기준 사용자 매핑
    // 3. amount를 decimals 기준으로 변환
    // 4. 내부 잔액 반영
  }

  return res.status(200).send('ok');
});

app.listen(3000);
```

주의:

- HMAC은 raw body 기준으로 검증하는 것을 권장합니다.
- JSON stringify 방식이 서버마다 달라지면 서명이 불일치할 수 있습니다.

---

## 12. JavaScript API Example

```js
const axios = require('axios');

const API_BASE_URL = 'https://api.example.com';
const API_KEY = process.env.PARTNER_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

async function createUser(externalUserId) {
  const res = await api.post('/users', { externalUserId });
  return res.data;
}

async function getUser(externalUserId) {
  const res = await api.get(`/users/${externalUserId}`);
  return res.data;
}

async function getWallets() {
  const res = await api.get('/wallets', {
    params: { limit: 20, offset: 0, status: 'ACTIVE' },
  });
  return res.data;
}

async function getDepositByTxHash(txHash) {
  const res = await api.get('/deposits', {
    params: { txHash },
  });
  return res.data;
}

async function main() {
  const user = await createUser('user_123');
  console.log('created user:', user);

  const found = await getUser('user_123');
  console.log('user detail:', found);

  const wallets = await getWallets();
  console.log('wallets:', wallets);
}

main().catch(console.error);
```

---

## 13. Error Response

오류 응답은 다음 형태를 따릅니다.

```json
{
  "statusCode": 400,
  "code": "BAD_REQUEST",
  "message": "Invalid request",
  "timestamp": "2026-04-22T00:00:00.000Z",
  "path": "/users"
}
```

주요 상황:

| 상태 | 의미                     |
| ---- | ------------------------ |
| 400  | 요청 값 오류             |
| 401  | API Key 누락 또는 불일치 |
| 404  | 대상 없음                |
| 409  | 중복 데이터              |
| 500  | 서버 내부 오류           |

---

## 14. Integration Checklist

- Partner API Key를 안전하게 저장했다.
- callbackUrl이 외부에서 접근 가능하다.
- callbackSecret으로 HMAC 검증을 구현했다.
- callback은 txHash/callbackId 기준으로 멱등 처리한다.
- 사용자는 Tron/TRC20 주소로만 입금하도록 안내한다.
- CONFIRMED 이후에만 잔액을 반영한다.
- API 호출 로그에 API Key 원문을 남기지 않는다.
