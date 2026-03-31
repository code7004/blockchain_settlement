# Multi-Partner Blockchain Settlement System

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

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript
- AES-256 암호화 모듈

### Frontend (Admin)

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
  │ └─ admin/
  ├─ packages/
  └─ infra/
```

---

## 🔐 Environment Setup

### API (.env)

`apps/api/.env`

```
# Database
DATABASE_URL="postgresql://wallet_dev_user:password@localhost:5432/wallet_dev"

# Tron
TRONGRID_API_KEY="your_trongrid_api_key"
TRON_FULL_HOST="https://api.trongrid.io"

# Wallet Encryption
# 32-byte key (base64 encoded)
# Example:
# openssl rand -base64 32
# or
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
WALLET_MASTER_KEY_BASE64="your_base64_32byte_key"
```

### 🔒 Security Notes

- privateKey는 DB에 평문 저장되지 않는다.
- AES-256으로 암호화되어 저장된다.
- master key는 반드시 환경변수로만 관리한다.
- DB가 유출되더라도 encryptedPrivateKey만 존재하므로 즉시 자금 탈취는 불가능하다.
- Phase2에서 KMS/Vault로 이관 예정.

### 2️⃣ Admin (.env)

`apps/admin/.env`

```
VITE_API_DEBUG="true"
```

---

## Getting Started

1. Install

> pnpm install

2. Run API

   > pnpm dev:api

3. Run Admin

   > pnpm dev:admin

## Swagger

[http://localhost:3000/api](http://localhost:3000/api)

---

## Documentation

상세 설계 문서는 docs 폴더 참고

- [01_Project_Overview.md](./docs/01_Project_Overview.md)
- [02_Architecture.md](./docs/02_Architecture.md)
- [03_Database_Schema.md](./docs/03_Database_Schema.md)
- [04_Sprint_Phase1_Plan.md](./docs/04_Phase1_Sprint_Plan.md)
- [04_Sprint_Phase2_Plan.md](./docs/04_Phase2_Sprint_Plan.md)
- [04_Sprint_Phase3_Plan.md](./docs/04_Phase3_Sprint_Plan.md)
- [04_Sprint_Phase4_Plan.md](./docs/04_Phase4_Sprint_Plan.md)
- [05_Technical_Conventions.md](./docs/05_Technical_Conventions.md)
- [06_Security_Principle.md](./docs/06_Security_Principles.md)
- [07_Operation_Policy.md](./docs/07_Operation_Policy.md)
- [08_MockUSDT.md](./docs/08_MockUSDT.md)
- [09_Admin_IA.md](./docs/09_Admin_IA.md)

---

## Development Roadmap

- Phase 1 – 기능 증명 (MVP)
- Phase 2 – 운영 안정성 확보
