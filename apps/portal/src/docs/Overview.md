# Overview

## Multi-Partner Blockchain Settlement System

이 솔루션은 Tron 기반 TRC20 입금 정산을 파트너 서비스에 연결하기 위한 멀티 파트너 지갑/정산 플랫폼입니다.

파트너사는 API를 통해 사용자를 생성하고 Deposit Address를 발급받습니다. 사용자가 해당 주소로 TRC20 토큰을 전송하면 시스템이 체인 이벤트를 감지하고, confirmation 이후 파트너 callback으로 입금 확정 이벤트를 전달합니다.

---

## Who Uses This Portal

Portal은 권한에 따라 두 가지 성격으로 사용됩니다.

| 영역               | 대상                            | 목적                                                       |
| ------------------ | ------------------------------- | ---------------------------------------------------------- |
| Public / Developer | 포털 개발자, 파트너 연동 개발자 | API 문서 확인, 데이터 조회, 연동 흐름 이해                 |
| Admin              | 운영자, 관리자                  | 파트너/API Key 관리, 운영 조회, callback retry, sweep 추적 |

Public 영역은 `RouteData.tsx` 기준 `/` 하위 라우트입니다.

Admin 영역은 `/admin` 하위 라우트이며, 별도 권한이 필요합니다.

---

## What This System Solves

블록체인 입금 정산을 서비스에 연결할 때는 다음 문제가 생깁니다.

- 입금을 언제 확정으로 볼 것인가
- 파트너별 데이터가 섞이지 않게 어떻게 분리할 것인가
- 같은 txHash가 여러 번 처리되는 것을 어떻게 막을 것인가
- 입금 확정 이벤트를 파트너 서버에 어떻게 안전하게 전달할 것인가
- Deposit Wallet에 들어온 자산을 어떻게 중앙 Hot Wallet로 모을 것인가
- 운영자가 장애나 지연을 어떻게 추적할 것인가

이 시스템은 상태 기반 처리, txHash 멱등성, Partner 단위 격리, HMAC callback, Worker 기반 비동기 처리를 통해 위 문제를 해결합니다.

---

## Core Concepts

### Partner

솔루션을 사용하는 외부 서비스 단위입니다.

- API Key 인증 주체
- callbackUrl / callbackSecret 보유
- User, Wallet, Deposit, Withdrawal, Callback, Sweep 데이터의 격리 기준

### User

파트너 서비스 내부의 사용자입니다.

- `externalUserId`로 식별합니다.
- 동일 Partner 안에서 `externalUserId`는 중복될 수 없습니다.
- User 생성 시 Deposit Wallet이 함께 생성됩니다.

### Deposit Wallet

사용자 입금을 식별하기 위해 발급되는 Tron 주소입니다.

- 파트너는 이 주소를 사용자에게 안내합니다.
- 사용자는 이 주소로 TRC20 토큰을 전송합니다.
- privateKey는 외부에 제공되지 않습니다.

### Deposit

블록체인에서 감지된 입금 트랜잭션입니다.

상태:

```text
DETECTED -> CONFIRMED
```

CONFIRMED 이후에만 유효한 입금으로 처리됩니다.

### Callback

Deposit이 CONFIRMED 되면 파트너 서버로 전송되는 이벤트입니다.

- `X-Signature` HMAC 서명 포함
- 실패 시 retry
- callbackId와 txHash로 멱등 처리 가능

### Sweep

Deposit Wallet의 토큰을 중앙 Hot Wallet로 옮기는 작업입니다.

```text
Deposit Wallet -> Hot Wallet
```

파트너 서비스는 일반적으로 Sweep을 직접 수행하지 않습니다. Portal에서는 Sweep 상태를 조회하여 입금 이후 자산 집계 상태를 확인할 수 있습니다.

---

## Current Supported Partner API

현재 Partner API로 제공되는 주요 기능:

- User 생성
- User 목록/상세 조회
- Wallet 목록 조회
- Deposit 목록 조회

현재 운영/포털 권한 영역:

- Partner 생성 및 API Key 발급
- Callback retry
- Sweep 조회
- Balance 조회
- Wallet asset reclaim
- Blockchain test transfer
- Monitoring

Withdrawal API는 상태 모델은 존재하지만, 현재 public partner integration 문서에서는 활성 연동 범위로 안내하지 않습니다.

---

## Core Processing Flow

```text
Partner creates User
  -> System creates Deposit Wallet
  -> Partner shows address to end user
  -> End user sends TRC20 token
  -> DepositWorker detects Transfer event
  -> Deposit status = DETECTED
  -> ConfirmWorker waits confirmations
  -> Deposit status = CONFIRMED
  -> CallbackLog created
  -> CallbackWorker sends callback
  -> SweepJob created
  -> SweepWorker broadcasts token transfer to Hot Wallet
  -> ConfirmWorker confirms SweepLog
```

---

## Important Rules

- Partner API 인증은 `x-api-key` 헤더를 사용합니다.
- API Key 원문은 최초 발급 시에만 확인할 수 있습니다.
- Deposit은 `txHash` 기준으로 중복 처리되지 않습니다.
- `DETECTED` 상태의 Deposit은 아직 유효 입금이 아닙니다.
- `CONFIRMED` 상태 이후 callback이 발생합니다.
- 파트너 서버는 callback을 반드시 멱등하게 처리해야 합니다.
- privateKey, master key, callbackSecret은 외부에 노출되지 않습니다.

---

## Environment Notes

개발/테스트 환경에서는 MockUSDT 또는 테스트넷 token을 사용할 수 있습니다.

운영 환경에서는 실제 TRC20 USDT와 Mainnet 설정을 사용합니다.

파트너 개발자는 다음 값만 알면 됩니다.

- API base URL
- Partner API Key
- callbackSecret
- callbackUrl 설정값
- token symbol / decimals
- Deposit Address

서버 내부 privateKey, Hot Wallet privateKey, Gas Tank privateKey, master key는 파트너에게 제공되지 않습니다.
