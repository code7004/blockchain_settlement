# Multi-Partner Blockchain Settlement System

> 본 프로젝트는 상용 서비스 개발 과정에서 구현된 초기 버전을 기반으로, 사전 허락을 받아 민감 정보 제거 및 구조 정리를 거쳐 공개용으로 재구성한 코드입니다.

Tron 기반 멀티 파트너 블록체인 입출금 정산 API

기존 현금 운영 서비스에 체인 정산 인프라를 연결하기 위한 백엔드 시스템이다.
멀티 파트너 환경에서 체인 정산 인프라를 안정적으로 구축하기 위한 구조 증명 프로젝트다.

입금 감지 · 확정 처리 · 콜백 · 출금 · 정산까지 전체 흐름을 포함한다.

---

## Key Features

- 멀티 파트너 지원 (데이터 완전 분리)
- Tron 기반 TRC20 (USDT) 입금 감지
- Confirmation 이후만 잔액 반영
- HMAC 기반 콜백 시스템
- 중앙 Hot Wallet 기반 출금
- 확장 가능한 Ledger 구조
- txHash UNIQUE 기반 멱등 처리
- Partner 단위 완전 데이터 격리

---

## High-Level Architecture

```
[Partner Service]

↓ REST API

[Wallet API (NestJS)]

↓

[TronGrid / Tron Node]

↓

[Tron Network]
```

---

## Tech Stack

### Backend(api)

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript
- AES-256 암호화 모듈

### Frontend (Dev Portal)

- React 19
- Vite
- Redux Toolkit
- TailwindCSS

### Blockchain

- Tron Network
- TronGrid API
- TRC20 (USDT 기준)

---

## Monorepo Structure

```
chain-wallet-service/
  ├─ apps/
  │ ├─ api/
  │ └─ portal/
  ├─ packages/
  └─ infra/
```

---

## 🔐 Environment Setup

### 1. 🔒 Security Notes

-`.env` 파일은 절대 Git에 커밋하지 않습니다

- dev / prod 환경 변수는 반드시 분리합니다
- private key 및 master key는 외부 노출 시 즉시 교체해야 합니다
- ENV 설정에 따라 전체 시스템 동작이 결정됩니다
- privateKey는 DB에 평문 저장되지 않는다.
- AES-256으로 암호화되어 저장된다.
- master key는 반드시 환경변수로만 관리한다.
- DB가 유출되더라도 encryptedPrivateKey만 존재하므로 즉시 자금 탈취는 불가능하다.
- Phase2에서 KMS/Vault로 이관 예정.

### 2. API (.env)

`root/.env`

```
# 애플리케이션 실행에 필요한 환경 변수 설정 파일입니다.
# 민감 정보는 절대 저장소에 포함하지 않고, 각 환경(dev / prod)에서 별도로 관리해야 합니다.

NODE_ENV="development"
#개발용 내부 API 접근 키
#Test Console 또는 내부 테스트 요청에서 사용됩니다.
# dev / prod DB는 반드시 분리해야 합니다
# 운영 DB는 직접 접근 금지 원칙을 따릅니다
DEV_API_KEY=""
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"

#potal 인증용 JWT 서명 키
# - 로그인 토큰 생성 및 검증에 사용
# - 반드시 충분한 길이의 랜덤 문자열 사용
JWT_SECRET=""

# TronGrid API 인증 키
TRONGRID_API_KEY=""

# Tron 노드 endpoint
# Mainnet: "https://api.trongrid.io"
# Nile Testnet: "https://nile.trongrid.io"
TRON_FULL_HOST="https://nile.trongrid.io"

#사용 토큰 심볼 `USDT` (Mainnet),- `mUSDT` (Testnet)
TOKEN_SYMBOL="mUSDT"

#TRC20 토큰 컨트랙트 주소
TRON_USDT_CONTRACT="TW4JFMjGzYqycpuGBUfJeXGtbxXCyM1Dky"


# 지갑 private key 암호화를 위한 마스터 키
# - AES-256 암호화에 사용
# - base64 인코딩된 32바이트 키 권장
# - 코드/DB에 저장하지 않고 환경 변수로만 관리
#
# 보안 목적:
# - DB 유출 시에도 private key 직접 노출 방지
# - Phase4에서 KMS/Vault로 확장 가능
WALLET_MASTER_KEY_BASE64=""


# 중앙 출금 지갑 주소
HOT_WALLET_ADDRESS=""
# Hot Wallet의 private key
HOT_WALLET_PRIVATE_KEY=""

# 가스(TRX) 공급용 지갑 주소
GAS_TANK_ADDRESS=""

# 가스 지갑 private key
GAS_TANK_PRIVATE_KEY=""


# #########################################################
# Worker / Polling 설정
# #########################################################

# Watcher cursor 사용 여부
# `true`: 마지막 블록 기준 이어서 조회
# `false`: 범위 기반 조회
USE_WATCHER_POLLING_CURSOR="false"
# 입금 감지 주기 (ms)
DEPOSIT_POLL_INTERVAL=15000
# 입금 확정 처리 주기 (ms)
CONFIRM_POLL_INTERVAL=5000

# Callback 처리 주기 (ms)
CALLBACK_POLL_INTERVAL=3000

# Gas refill worker 실행 주기 (ms)
# Deposit Wallet TRX 부족 시 자동 충전
GASREFILL_POLL_INTERVAL=60000

#Sweep worker 실행 주기 (ms)
# Deposit Wallet → Hot Wallet 자산 이동
SWEEP_POLL_INTERVAL=120000


```

### 3. Prisma

`root/pakages/prisma/.env`

```
ADMIN_INIT_PASSWORD="verystrong"
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
```

### 4. Dev Portal(.env)

`apps/portal/.env`

```
VITE_APP_NAME="BALLET DEV PORTAL"
VITE_API_DEBUG="true"
VITE_API_BASE_URL_DEV=""
VITE_API_BASE_URL_LIVE=""
VITE_API_KEY=""
VITE_SENDER_WALLET_ADDRESS=""
VITE_SENDER_WALLET_PRIVATE_KEY=""
VITE_USERNAME=""
VITE_PASSWORD=""
```

---

---

## Getting Started

1. Install

> pnpm install

2. Run API

   > pnpm dev:api

3. Run Dev Portal

   > pnpm dev:portal

## Swagger

[http://localhost:3000/api](http://localhost:3000/api)

---

## Documentation

상세 설계 문서는 docs 폴더 참고

- [01_Project_Overview.md](./docs/01_Project_Overview.md)
- [02_Architecture.md](./docs/02_Architecture.md)
- [03_Database_Schema.md](./docs/03_Database_Schema.md)
- [04_Sprint_RoadMap.md](./docs/04_Sprint_RoadMap.md)
- [04_Sprint_Phase1.md](./docs/04_Sprint_Phase1.md)
- [04_Sprint_Phase2.md](./docs/04_Sprint_Phase2.md)
- [04_Sprint_Phase3.md](./docs/04_Sprint_Phase3.md)
- [04_Sprint_Phase4.md](./docs/04_Sprint_Phase4.md)
- [05_Technical_Conventions.md](./docs/05_Technical_Conventions.md)
- [06_Security_Principle.md](./docs/06_Security_Principles.md)
- [07_Operation_Policy.md](./docs/07_Operation_Policy.md)
- [08_MockUSDT.md](./docs/08_MockUSDT.md)
- [09_DevPortal_IA.md](./docs/09_DevPortal_IA.md)

---
