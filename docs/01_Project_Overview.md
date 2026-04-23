# Multi-Partner Blockchain Settlement System

> Tron 기반 멀티 파트너 입출금 정산 API
>
> 파트너 서비스에 입금 주소 발급, 체인 입금 감지, 확정, 콜백, Sweep, 조회 기능을 제공하는 백엔드/포털 시스템

---

## 1. Overview

이 시스템은 멀티 파트너 환경에서 블록체인 기반 입출금 정산을 처리하기 위한 플랫폼이다.

기존 현금 또는 내부 포인트 기반 운영 서비스에 체인 정산 인프라를 연결할 때 다음 문제가 발생한다.

- 입금 확정 시점 판단
- 파트너별 데이터 격리
- 지갑 privateKey 보관 및 사용 통제
- 중복 트랜잭션 처리
- 콜백 재시도와 실패 추적
- Deposit Wallet 자산을 Hot Wallet로 모으는 Sweep 처리
- 운영자가 현재 처리 상태를 확인할 수 있는 Admin/Developer Portal

본 프로젝트는 위 문제를 문서 기반으로 단계적으로 해결한다.

운영 규모 기준:

- 월 약 150,000건 처리

핵심 목표:

- 파트너별 User / Wallet / Transaction 데이터 분리
- Confirmation 이후에만 잔액 반영
- txHash 기반 멱등성 보장
- HMAC 기반 파트너 콜백
- 중앙 Hot Wallet 기반 Sweep / Withdrawal 구조
- Worker 기반 비동기 처리
- Admin / Developer Portal을 통한 상태 조회와 운영 보조
- Phase 확장 가능한 Ledger / Monitoring / Security 구조

---

## 2. Current Phase

현재 기준은 **Phase3 Step3 진행 중**이다.

문서상 Phase3의 목표는 Production Readiness이며, 현재 소스에는 Phase1/Phase2 범위를 넘어 다음 요소까지 구현되어 있다.

- Admin API와 Partner API 분리
- Portal 로그인 및 JWT 인증
- Partner API Key 인증
- Partner / User / Wallet / Deposit / Withdrawal / Callback / Balance / Sweep 조회 도메인
- DepositWorker / ConfirmWorker / CallbackWorker / SweepWorker / ReclaimWorker
- Deposit Wallet 자산 SweepJob / SweepLog 구조
- AssetsReclaimJob 구조
- Public Portal / Admin Portal 라우트 분리
- Swagger 분리: Partner API, Portal API
- EnvService 기반 환경변수 접근
- Logger / HTTP logging / API exception filter

아직 Phase3에서 정리 중인 항목:

- 상태 전이 제한의 코드 레벨 일관성 검증
- txHash UNIQUE 정책의 전체 도메인 검증
- Gas refill 중복 방지 및 wallet cooldown
- 운영 로그 구조화
- Live / Dev 인프라 분리 검증
- Safety Guard: chain, token, env 혼용 방지
- 배포 스크립트와 PM2 운영 구조
- txHash 기준 lifecycle 추적 고도화

---

## 3. Requirements

### 3-1. Functional Requirements

1. Partner 관리
   - 파트너 생성, 조회, 수정
   - API Key 발급 및 교체
   - callbackUrl / callbackSecret 관리

2. User 관리
   - 파트너 소속 사용자 생성 및 조회
   - `partnerId + externalUserId` 기준 식별

3. Wallet 관리
   - Tron 지갑 생성
   - privateKey AES-256 암호화 저장
   - Partner / User 기준 지갑 조회
   - 지갑 자산 스냅샷 및 자산 회수 작업 요청

4. Deposit 처리
   - TRC20 Transfer 이벤트 감지
   - Deposit row 생성
   - DETECTED -> CONFIRMED 전환
   - Confirmation 이후 콜백 및 SweepJob 생성

5. Callback 처리
   - HMAC-SHA256 서명
   - 최대 3회 재시도
   - CallbackLog 기반 상태 추적

6. Sweep 처리
   - Confirmed Deposit 이후 SweepJob 생성
   - Deposit Wallet -> Hot Wallet token transfer
   - SweepLog 기반 BROADCASTED / CONFIRMED / FAILED / SKIPPED 추적
   - TRX 부족 시 Gas Tank에서 refill 시도

7. Withdrawal 처리
   - Partner 출금 요청 구조
   - REQUESTED / APPROVED / BROADCASTED / CONFIRMED / FAILED 상태 모델
   - Hot Wallet 기반 출금 구조

8. Balance 조회
   - Phase 현재 기준 단순 계산
   - 현재 코드 기준: `sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)`

9. Portal
   - Admin / Public 메뉴 분리
   - Partner, User, Wallet, Deposit, Callback, Sweep, Dashboard 조회
   - Swagger / 내부 문서 조회
   - Error / Monitoring / Audit 영역의 초기 화면 구조

---

## 4. Design Philosophy

- 문서 기반 개발을 유지한다.
- 상태 전이 규칙은 문서를 기준으로 판단한다.
- Worker 구조는 Deposit / Confirm / Callback / Sweep 중심으로 유지한다.
- Controller는 얇게 유지하고, 비즈니스 로직은 Service에 둔다.
- DB 접근은 Repository 또는 명확한 Infra 계층을 통해 수행한다.
- 파트너 데이터 격리는 초기 단계부터 강제한다.
- privateKey 평문 저장과 민감 정보 로그 출력을 금지한다.
- 운영 자동화보다 정합성과 추적 가능성을 우선한다.
- Phase 범위를 벗어나는 구조 변경은 문서 갱신 후 진행한다.

---

## 5. Technology Stack

### 5-1. Runtime & Toolchain

- Node.js
- pnpm workspace 기반 Monorepo
- TypeScript
- ESLint
- Prettier
- Husky + lint-staged

현재 루트 `package.json` 기준:

- `packageManager`: pnpm 10
- 주요 스크립트: `dev`, `dev:api`, `dev:portal`, `build:api`, `build:portal`, `typecheck`, `lint`

### 5-2. Backend API

- NestJS 11
- TypeScript
- Prisma ORM 6
- PostgreSQL
- Swagger
- class-validator
- class-transformer
- JWT / Passport
- bcrypt
- Axios
- TronWeb
- OpenAI API 모듈

### 5-3. Frontend Portal

- React 19
- Vite 7
- TypeScript
- React Router 7
- Redux Toolkit
- React Query
- TailwindCSS 4
- Framer Motion
- React Markdown

### 5-4. Blockchain Layer

Tron을 선택한 이유는 TRC20 전송 수수료가 낮고, USDT 기반 정산 인프라에 적합하기 때문이다.

- Tron Network
- TronGrid / Tron node endpoint
- TRC20 token
- 개발 환경: MockUSDT 또는 테스트넷 토큰
- 운영 환경: USDT TRC20

Tron 통신은 `apps/api/src/infra/tron` 모듈에서 추상화한다.

---

## 6. Monorepo Structure

현재 프로젝트 구조:

```text
chain-wallet-service/
  apps/
    api/       # NestJS Backend
    portal/    # React Portal
    tools/     # 운영/개발 보조 스크립트
  packages/
    prisma/        # Prisma schema, migration, seed
    prisam-types/  # Prisma type export package
  docs/        # 프로젝트 기준 문서
```

주의:

- `packages/prisam-types`는 현재 디렉터리명이 `prisma-types`가 아니라 `prisam-types`로 존재한다.
- 문서 정리 과정에서 실제 경로명과 의도한 패키지명을 별도로 맞출 필요가 있다.

---

## 7. Backend Scope

API 서버는 `apps/api`에 위치한다.

주요 구성:

- `core`
  - constants
  - crypto
  - env
  - errors
  - logger
  - utils
- `domains`
  - auth
  - balance
  - blockchain
  - callback
  - callback-test
  - deposit
  - health
  - member
  - monitor
  - openai
  - partner
  - sweep
  - user
  - wallet
  - withdrawal
- `infra`
  - prisma
  - tron
- `worker`
  - DepositWorker
  - ConfirmWorker
  - CallbackWorker
  - SweepWorker
  - ReclaimWorker

API 진입점은 크게 두 계열로 나뉜다.

- Partner API: 파트너 서비스 연동용
- Portal API: Admin / Developer Portal용

Swagger 경로:

- `/docs/api`: Partner API
- `/docs/partner`: Portal API

---

## 8. Portal Scope

Portal은 `apps/portal`에 위치한다.

현재 라우트는 크게 두 영역으로 나뉜다.

- Public / Developer 영역: `/`
- Admin 영역: `/admin`

주요 화면:

- Login
- Dashboard
- Partners
- Users
- Wallets
- Deposits
- Callbacks
- Sweeps
- Documents / Swagger
- System Error Reports

구조만 존재하거나 비활성화된 화면:

- Withdrawals 일부
- Balances 일부
- Blockchain THOT / Watcher 일부
- Monitoring / Audit Logs 일부
- Demo 일부

Portal은 정산 로직을 직접 수행하지 않고, Backend API 상태 조회와 운영 보조 기능을 담당한다.

---

## 9. Database Scope

현재 Prisma schema에는 다음 주요 모델이 존재한다.

- HealthPing
- Member
- Partner
- User
- Wallet
- Deposit
- Withdrawal
- CallbackLog
- CallbackTestLog
- SweepJob
- SweepLog
- AssetsReclaimJob

핵심 정합성 기준:

- Partner는 데이터 격리의 최상위 단위다.
- User는 Partner에 종속된다.
- Wallet은 User / Partner에 종속된다.
- Deposit은 txHash unique 기준으로 멱등성을 보장한다.
- Withdrawal은 txHash unique를 nullable로 가진다.
- SweepJob은 Deposit당 1개만 생성된다.
- SweepLog는 Sweep 시도 및 결과 추적을 담당한다.
- privateKey는 Wallet에 암호화된 값으로만 저장한다.

---

## 10. Worker Scope

현재 Worker 구조:

1. DepositWorker
   - TRC20 Transfer 이벤트를 block polling으로 감지
   - `runtime/watcher-state.json` 파일 기반 cursor 저장 옵션 사용
   - DepositService로 감지 이벤트 전달

2. ConfirmWorker
   - DETECTED Deposit을 CONFIRMED로 전환
   - CallbackLog 생성
   - SweepJob 생성
   - BROADCASTED SweepLog를 체인 receipt 기준으로 CONFIRMED / FAILED 처리

3. CallbackWorker
   - PENDING / 미성공 CallbackLog 재시도
   - HMAC-SHA256 서명 후 파트너 callbackUrl 호출

4. SweepWorker
   - PENDING SweepJob 처리
   - Deposit Wallet token balance 확인
   - TRX 부족 시 Gas Tank refill 시도
   - token transfer broadcast 후 SweepLog 생성

5. ReclaimWorker
   - AssetsReclaimJob 처리
   - Wallet의 token을 Hot Wallet로 회수
   - 남은 TRX를 Gas Tank로 회수

---

## 11. Infrastructure Policy

- Docker 사용은 운영 정책상 제한한다.
- Windows 기반 EC2 환경 직접 구성을 고려한다.
- TurboRepo는 사용하지 않는다.
- pnpm workspace 기반 Monorepo 구조를 유지한다.
- Dev / Prod DB는 분리한다.
- 운영 DB는 RDS 사용을 목표로 한다.
- Mainnet / Testnet 환경 혼용 방지를 Phase3에서 강화한다.

환경 구성 기준:

| 환경 | DB명        | 계정             | 비고                |
| ---- | ----------- | ---------------- | ------------------- |
| 개발 | wallet_dev  | wallet_dev_user  | EC2 PostgreSQL 기준 |
| 운영 | wallet_prod | wallet_prod_user | RDS PostgreSQL 목표 |

---

## 12. Security Baseline

- privateKey 평문 저장 금지
- AES-256 기반 privateKey 암호화 저장
- WALLET_MASTER_KEY_BASE64 환경변수 기반 복호화
- Partner API Key 원문 저장 금지
- API Key hash 저장 및 prefix 기반 조회
- Portal JWT 인증
- Partner API Key 인증
- Callback HMAC-SHA256 서명
- 민감 정보 로그 출력 금지
- 상태 변경은 DB 기록을 우선한다.

Phase4 이후 고도화 후보:

- KMS / Vault
- Key Access Audit
- RBAC 고도화
- Rate Limit
- Alert / Monitoring

---

## 13. Document Cleanup Notes

문서 정리 시 다음 원칙을 따른다.

- 01 문서는 프로젝트의 현재 진입점으로 유지한다.
- 상세 아키텍처는 02 문서에서 관리한다.
- 실제 Prisma schema와 DB 문서는 03 문서에서 맞춘다.
- Phase별 완료 여부는 04 문서군에서 관리한다.
- 코드 규칙은 05 문서 기준으로 유지한다.
- 보안 정책은 06 문서, 운영 정책은 07 문서에서 확장한다.
- Portal IA는 09 문서와 실제 `RouteData.tsx`를 함께 비교하며 갱신한다.

현재 01 문서는 소스 기준의 큰 범위와 진행 상태를 반영한 개요 문서이며, 세부 상태 전이와 테이블 정의는 후속 문서에서 계속 정합화한다.
