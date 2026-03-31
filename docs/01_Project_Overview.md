# Multi-Partner Blockchain Settlement System

> Tron 기반 멀티 파트너 입출금 정산 API
>
> 기존 현금 운영 서비스에 체인 정산 인프라를 연결하기 위한 백엔드 시스템

---

## 1. Overview

이 시스템은 멀티 파트너 환경에서 블록체인 기반 입출금 정산을 처리하기 위한 백엔드 플랫폼이다.

기존 현금 기반 운영 환경에 체인 정산을 도입할 경우 다음과 같은 문제가 발생한다:

- 입금 확정 시점 판단 문제
- 멀티 파트너 데이터 격리
- 출금 통제 및 키 관리
- 중복 트랜잭션 처리
- 정산 정합성 유지

본 시스템은 이러한 문제를 구조적으로 해결하기 위해 설계되었다.

운영 규모 기준:

- 월 약 150,000건 처리

핵심 목표:

- 파트너별 지갑 분리
- Confirmation 이후만 잔액 반영
- HMAC 기반 콜백 통지
- 중앙 Hot Wallet 기반 출금
- 확장 가능한 Ledger 구조

---

## 2. Requirements

### 2-1. Development Order (Recommended)

1. Tron 연결 테스트
2. Wallet 생성 API
3. Deposit 감지
4. Confirmation 처리
5. Callback 시스템
6. Withdrawal API
7. Ledger 반영
8. Admin UI
9. 테스트넷 시연

### 2-2. Design Philosophy

- 1차는 기능 증명
- 2차는 안정성 확보
- 보안 최소선은 1차부터 적용
- 확장 가능성을 전제로 설계
- 멀티 파트너 구조는 초기에 강제

---

## 3. Technology Stack

### 3-1. Runtime & Toolchain

- Node.js v24.14.0
- nvm v1.1.11
- pnpm v10.30.3

> 모든 개발 환경은 nvm 기반으로 Node 버전을 고정한다.
>
> pnpm workspace 기반 Monorepo 구성.

### 3-2.Frontend (Admin)

- React 19
- Vite
- Redux Toolkit
- TypeScript
- TailwindCSS v4
- Axios

### 3-3. Backend (API)

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- AES-256 자체 암호화 모듈 (wallet-crypto)
- class-validator
- class-transformer

### 3-4. Blockchain Layer

> Tron을 선택한 이유는 TRC20 전송 수수료가 낮고, USDT 기반 정산 인프라에 적합하기 때문이다.

- Tron Network
- TronGrid API
- TRC20 (USDT 기준)

Tron 통신은 내부 `infra/tron` 모듈에서 추상화한다.

### 3-5. Infrastructure Policy

- Docker 사용 제한 (운영 환경 정책)
- Windows 기반 EC2 환경 직접 구성
- TurboRepo 사용 안함
- Monorepo 구조 유지
- DB 분리 전략 적용

### 3-6. 구성

| 환경 | DB명        | 계정             |
| ---- | ----------- | ---------------- |
| 개발 | wallet_dev  | wallet_dev_user  |
| 운영 | wallet_prod | wallet_prod_user |

> DB 완전 분리 계정도 분리하여 권한 최소화
