# Multi-Partner Blockchain Settlement System

Tron 기반 멀티 파트너 블록체인 입출금 정산 API 및 Admin/Developer Portal.

이 프로젝트는 파트너 서비스에 입금 주소 발급, 체인 입금 감지, confirmation, callback, sweep, withdrawal, balance 조회 기능을 제공하기 위한 문서 기반 시스템이다.

현재 기준:

```text
Phase3 Step3 - Idempotency & State Transition 진행 중
```

---

## Key Features

- Partner / User / Wallet 기반 멀티 파트너 데이터 격리
- Tron TRC20 token 입금 감지
- Confirmation 이후 Deposit 확정
- txHash unique 기반 멱등 처리
- HMAC-SHA256 기반 callback
- Callback retry 및 CallbackLog 추적
- Deposit Wallet -> Hot Wallet Sweep
- SweepJob / SweepLog 기반 broadcast -> confirm 추적
- Partner API와 Portal API 분리
- Admin / Developer Portal
- JWT 기반 Portal 인증
- API Key 기반 Partner 인증
- Prisma / PostgreSQL 기반 상태 저장

---

## Architecture

```text
[Partner Service]
        |
        | x-api-key / Partner API
        v
[NestJS API] ---- Prisma ----> [PostgreSQL]
        |
        | TronService
        v
[TronGrid / Tron Node] ----> [Tron Network]

[Admin / Developer Portal]
        |
        | JWT / Portal API
        v
[NestJS API]

[Workers]
  DepositWorker
  ConfirmWorker
  CallbackWorker
  SweepWorker
  ReclaimWorker
```

---

## Current Worker Flow

```text
DepositWorker
  -> TRC20 Transfer event 감지
  -> Deposit(status=DETECTED)

ConfirmWorker
  -> Deposit(status=CONFIRMED)
  -> CallbackLog 생성
  -> SweepJob 생성
  -> SweepLog(status=BROADCASTED) chain confirm 처리

CallbackWorker
  -> CallbackLog retry
  -> SUCCESS / FAILED

SweepWorker
  -> SweepJob 처리
  -> Deposit Wallet -> Hot Wallet token transfer
  -> SweepLog(status=BROADCASTED)

ReclaimWorker
  -> AssetsReclaimJob 처리
  -> Wallet token/TRX 회수
```

---

## Tech Stack

Backend:

- NestJS 11
- TypeScript
- Prisma ORM 6
- PostgreSQL
- Swagger
- JWT / Passport
- bcrypt
- TronWeb
- Axios

Frontend:

- React 19
- Vite 7
- React Router 7
- Redux Toolkit
- React Query
- TailwindCSS 4

Tooling:

- pnpm workspace
- ESLint
- Prettier
- Husky
- lint-staged

---

## Monorepo Structure

```text
chain-wallet-service/
  apps/
    api/       # NestJS API + Workers
    portal/    # React Portal
    tools/     # development/operation helper scripts

  packages/
    prisma/        # Prisma schema, migrations, seed
    prisam-types/  # current package path

  docs/       # project source-of-truth documents
```

주의:

- `packages/prisam-types`는 현재 실제 디렉터리명이다.
- `apps/portal/src/pagas`, `swgger`, `withdrawall` 등 오탈자성 경로가 현재 소스에 존재한다. rename은 별도 리팩터링 범위로 다룬다.

---

## Environment

민감 정보는 저장소에 커밋하지 않는다.

Root `.env` 주요 항목:

```text
NODE_ENV=development
NAME=dev-api
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

JWT_SECRET=
DEV_API_KEY=

TRON_FULL_HOST=https://nile.trongrid.io
TRONGRID_API_KEY=
TOKEN_SYMBOL=mUSDT
TRON_USDT_CONTRACT=

WALLET_MASTER_KEY_BASE64=

HOT_WALLET_ADDRESS=
HOT_WALLET_PRIVATE_KEY=

GAS_TANK_ADDRESS=
GAS_TANK_PRIVATE_KEY=

USE_WATCHER_POLLING_CURSOR=false
DEPOSIT_POLL_INTERVAL=15000
CONFIRM_POLL_INTERVAL=5000
CALLBACK_POLL_INTERVAL=3000
GASREFILL_POLL_INTERVAL=60000
SWEEP_POLL_INTERVAL=120000
Reclaim_POLL_INTERVAL=120000

OPENAI_API_KEY=
```

Portal `.env` 예:

```text
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

보안 원칙:

- privateKey 평문 저장 금지
- API Key 원문 저장 금지
- callbackSecret 로그 출력 금지
- Dev / Live DB와 wallet은 반드시 분리
- Mainnet/Testnet token contract 혼용 금지

---

## Getting Started

Install:

```bash
pnpm install
```

Run API:

```bash
pnpm dev:api
```

Run Portal:

```bash
pnpm dev:portal
```

Build:

```bash
pnpm build:api
pnpm build:portal
```

Typecheck:

```bash
pnpm typecheck
```

---

## Prisma

Generate:

```bash
pnpm db:generate
```

Format:

```bash
pnpm db:format
```

Migrate:

```bash
pnpm db:migrate
```

Deploy migration:

```bash
pnpm db:deploy
```

---

## Swagger

Partner API:

[http://localhost:3000/docs/api](http://localhost:3000/docs/api)

Portal API:

[http://localhost:3000/docs/partner](http://localhost:3000/docs/partner)

---

## Documentation

상세 설계 문서는 `docs` 폴더를 기준으로 한다.

- [01_Project_Overview.md](./docs/01_Project_Overview.md)
- [02_Architecture.md](./docs/02_Architecture.md)
- [03_Database_Schema.md](./docs/03_Database_Schema.md)
- [04_Sprint_RoadMap.md](./docs/04_Sprint_RoadMap.md)
- [04_Sprint_Phase1.md](./docs/04_Sprint_Phase1.md)
- [04_sprint_Phase2.md](./docs/04_sprint_Phase2.md)
- [04_Sprint_Phase3.md](./docs/04_Sprint_Phase3.md)
- [04_Sprint_Phase4.md](./docs/04_Sprint_Phase4.md)
- [05_Technical_Conventions.md](./docs/05_Technical_Conventions.md)
- [06_Security_Principles.md](./docs/06_Security_Principles.md)
- [07_Operation_Policy.md](./docs/07_Operation_Policy.md)
- [08_MockUSDT.md](./docs/08_MockUSDT.md)
- [09_DevPortal_IA.md](./docs/09_DevPortal_IA.md)
- [10_Sprint_Prompt.md](./docs/10_Sprint_Prompt.md)
- [11_Git_Workflow_Guide.md](./docs/11_Git_Workflow_Guide.md)

---

## Current Gaps

- Phase3 Step3 상태 전이 guard 정리 중
- Gas refill 중복 방지 / wallet cooldown 미완료
- txHash lifecycle monitoring 고도화 필요
- Deployment / PM2 / restart 정책 미완료
- chain checkpoint, callback queue, double-entry ledger는 Phase4 예정
- KMS / Vault, RBAC 고도화, alert는 Phase4 예정
