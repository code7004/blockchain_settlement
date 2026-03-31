# Database Schema (Phase 1)

---

# 1. Overview

본 데이터베이스는 멀티 파트너 환경에서 블록체인 기반 입출금 정산의

정합성, 멱등성, 상태 기반 전이를 보장하기 위해 설계되었다.

설계의 핵심 목표:

- Partner 단위 데이터 완전 격리
- txHash 기반 멱등성 보장
- Confirmation 이후만 잔액 반영
- 상태 기반 전이(State Transition) 강제
- Hot Wallet 단일 출금 구조 유지

Phase 1은 구조 증명 단계이며, Phase 2에서 Double-Entry Ledger 구조로 확장 예정이다.

---

# 2. 도메인 구조

```
Partner
 └─ User
     └─ Wallet
         ├─ Deposit
         │    └─ CallbackLog
         └─ Withdrawal

Member (Admin)
```

---

# 3. 테이블 정의

아래는 Phase 1 기준 테이블 정의이다.

---

## 3.1 HealthPing

시스템 상태 확인용 테이블

| 컬럼      | 타입     | 설명             |
| --------- | -------- | ---------------- |
| id        | UUID     | PK               |
| message   | String   | 헬스 체크 메시지 |
| createdAt | DateTime | 생성 시간        |

---

## 3.2 Partner

외부 연동 파트너

| 컬럼            | 타입     | 설명                 |
| --------------- | -------- | -------------------- |
| id              | UUID     | PK                   |
| name            | String   | 파트너 이름 (unique) |
| callbackUrl     | String   | 콜백 URL             |
| callbackSecret  | String   | HMAC 서명용 secret   |
| apiKeyPrefix    | String   | API Key prefix       |
| apiKeyHash      | String   | API Key hash         |
| apiKeyCreatedAt | DateTime | 생성 시간            |
| memberId        | UUID     | 관리자 계정          |
| isActive        | Boolean  | 활성 여부            |
| createdAt       | DateTime | 생성                 |
| updatedAt       | DateTime | 수정                 |

### 특징

- 멀티 파트너 데이터 분리 기준
- API Key 인증 주체
- Partner 단위로 모든 데이터 격리

---

## 3.3 User

파트너 소속 사용자

| 컬럼           | 타입     | 설명                  |
| -------------- | -------- | --------------------- |
| id             | UUID     | PK                    |
| partnerId      | UUID     | 소속 파트너           |
| externalUserId | String   | 외부 시스템 사용자 ID |
| isActive       | Boolean  | 활성 여부             |
| createdAt      | DateTime | 생성                  |
| updatedAt      | DateTime | 수정                  |

### 특징

- 파트너 내부 사용자 식별 단위
- (partnerId + externalUserId) unique

---

## 3.4 Wallet

입금/출금 지갑

| 컬럼                | 타입     | 설명                     |
| ------------------- | -------- | ------------------------ |
| id                  | UUID     | PK                       |
| partnerId           | UUID     | 파트너                   |
| userId              | UUID     | 사용자                   |
| address             | String   | TRON 주소                |
| encryptedPrivateKey | Text     | AES256 암호화 privateKey |
| status              | Enum     | ACTIVE / SUSPENDED       |
| createdAt           | DateTime | 생성                     |
| updatedAt           | DateTime | 수정                     |

### 특징

- Deposit address 역할
- privateKey는 반드시 암호화 저장

---

## 3.5 Deposit

입금 트랜잭션

| 컬럼          | 타입     | 설명                          |
| ------------- | -------- | ----------------------------- |
| id            | UUID     | PK                            |
| partnerId     | UUID     | 파트너                        |
| userId        | UUID     | 사용자                        |
| walletId      | UUID     | 지갑                          |
| tokenSymbol   | String   | 토큰 심볼                     |
| tokenContract | String   | 컨트랙트 주소                 |
| txHash        | String   | 트랜잭션 해시 (unique)        |
| fromAddress   | String   | 송신 주소                     |
| toAddress     | String   | 수신 주소                     |
| amount        | Decimal  | 금액                          |
| blockNumber   | Int      | 블록 번호                     |
| status        | Enum     | DETECTED / CONFIRMED / FAILED |
| detectedAt    | DateTime | 감지 시점                     |
| confirmedAt   | DateTime | 확정 시점                     |
| createdAt     | DateTime | 생성                          |

### 처리 흐름

```
DETECTED → CONFIRMED → (Callback) → Sweep
```

---

## 3.6 CallbackLog

파트너 콜백 로그

| 컬럼             | 타입     | 설명                       |
| ---------------- | -------- | -------------------------- |
| id               | UUID     | PK                         |
| partnerId        | UUID     | 파트너                     |
| depositId        | UUID     | deposit                    |
| txHash           | String   | 트랜잭션                   |
| eventType        | String   | 이벤트 타입                |
| callbackUrl      | String   | 호출 URL                   |
| requestBody      | String   | 요청 데이터                |
| requestSignature | String   | HMAC 서명                  |
| attemptCount     | Int      | 시도 횟수                  |
| maxAttempts      | Int      | 최대 시도                  |
| lastStatusCode   | Int      | 응답 코드                  |
| status           | Enum     | PENDING / SUCCESS / FAILED |
| lastAttemptAt    | DateTime | 마지막 시도                |
| createdAt        | DateTime | 생성                       |
| updatedAt        | DateTime | 수정                       |

### 특징

- retry 기반 콜백 관리
- 실패 추적 가능

---

## 3.7 CallbackTestLog

콜백 테스트 로그

| 컬럼      | 타입     | 설명      |
| --------- | -------- | --------- |
| id        | UUID     | PK        |
| headers   | Json     | 요청 헤더 |
| body      | Json     | 요청 바디 |
| signature | String   | 서명      |
| createdAt | DateTime | 생성      |

---

## 3.8 Withdrawal

출금 요청

| 컬럼          | 타입     | 설명                                        |
| ------------- | -------- | ------------------------------------------- |
| id            | UUID     | PK                                          |
| partnerId     | UUID     | 파트너                                      |
| userId        | UUID     | 사용자                                      |
| walletId      | UUID     | 지갑                                        |
| tokenSymbol   | String   | 토큰                                        |
| tokenContract | String   | 컨트랙트                                    |
| toAddress     | String   | 수신 주소                                   |
| amount        | Decimal  | 금액                                        |
| status        | Enum     | REQUESTED / APPROVED / BROADCASTED / FAILED |
| txHash        | String   | 트랜잭션                                    |
| blockNumber   | BigInt   | 블록                                        |
| requestedAt   | DateTime | 요청                                        |
| approvedAt    | DateTime | 승인                                        |
| broadcastedAt | DateTime | 전송                                        |
| failReason    | String   | 실패 사유                                   |
| createdAt     | DateTime | 생성                                        |
| updatedAt     | DateTime | 수정                                        |

### 특징

- Phase1: 구조 검증 중심
- Phase2: 실제 broadcast/confirm 확장

---

## 3.9 Member

관리자 계정

| 컬럼      | 타입     | 설명                         |
| --------- | -------- | ---------------------------- |
| id        | UUID     | PK                           |
| username  | String   | 로그인 ID                    |
| password  | String   | bcrypt hash                  |
| role      | Enum     | OWNER / OPERATOR / DEVELOPER |
| isActive  | Boolean  | 활성 여부                    |
| createdAt | DateTime | 생성                         |
| updatedAt | DateTime | 수정                         |

---

# 4. 핵심 설계 원칙

## 4.1 Entity Relationship

관계 구조는 다음과 같다:

- Partner 1:N User
- User 1:N Wallet
- Wallet 1:N Deposit
- Wallet 1:N Withdrawal
- Deposit 1:N CallbackLog
- Partner 1:N SettlementSnapshot

설계 원칙:

- 모든 정산 데이터는 Partner에 종속된다.
- User는 독립 개체가 아니라 Partner에 소속된다.
- Wallet은 User 단위로 생성된다.
- Deposit / Withdrawal은 Wallet 기준으로 발생한다.

---

## 4.2. State Transition Rules

정산 시스템은 상태 기반 전이를 통해 정합성을 유지한다.

## 4.3 Deposit 상태 전이

```
Deposit:
DETECTED → CONFIRMED

Withdrawal:
REQUESTED → APPROVED → BROADCASTED
```

규칙:

- DETECTED 상태에서는 잔액에 반영하지 않는다.
- CONFIRMED 상태에서만 Ledger 계산에 포함된다.
- CONFIRMED는 지정된 Confirmation 블록 수 충족 시 전환된다.
- 동일 txHash는 중복 저장되지 않는다 (UNIQUE).

---

## 4.4 Withdrawal 상태 전이

REQUESTED → APPROVED → BROADCASTED

규칙:

- REQUESTED 상태에서는 체인 전송이 발생하지 않는다.
- APPROVED 이후에만 브로드캐스트 가능하다.
- BROADCASTED 상태에서만 Ledger 차감 대상이 된다.
- 동일 txHash 중복 저장 금지.
- 상태 전이는 역방향으로 허용되지 않는다.

---

## 4.5 Idempotency Strategy

멱등성은 다음 제약으로 보장된다:

- deposits.txHash UNIQUE
- withdrawals.txHash UNIQUE
- 상태 기반 전이 제한
- 동일 블록 재스캔 허용 설계
- 중복 txHash 입력 시 DB 레벨에서 차단

Watcher 재시작 또는 블록 재처리 시에도 잔액 중복 반영이 발생하지 않도록 설계되었다.

---

## 4.6 Ledger Calculation Rule (Phase 1)

Phase 1에서는 단순 합산 방식으로 잔액을 계산한다.

```
balance = sum(CONFIRMED deposits)
```

- sum(BROADCASTED withdrawals)

주의:

- DETECTED 상태는 계산 제외
- REQUESTED / APPROVED 출금은 계산 제외

Phase 2에서는 Double-Entry Ledger 기반으로 전환 예정이다.

---

## 4.7 Index Strategy

월 150,000건 규모를 기준으로 다음 인덱스를 필수로 둔다:

- deposits.txHash UNIQUE
- deposits.partnerId INDEX
- deposits.blockNumber INDEX
- withdrawals.partnerId INDEX
- withdrawals.txHash UNIQUE
- callback_logs.status INDEX
- users.partnerId INDEX
- wallets.partnerId INDEX

Index 전략은 조회 성능과 멱등성 보장을 동시에 고려한다.

---

## 4.8 Data Integrity Rules

- 모든 FK는 반드시 명시적 관계를 가진다.
- Partner 삭제 시 Cascade 정책은 사용하지 않는다.
- 상태 변경은 반드시 timestamp와 함께 기록한다.
- privateKey는 평문으로 저장하지 않는다.
- Confirmation 없이 잔액 반영 금지.

---

# 5. Phase 2 Extension Plan

Phase 2에서는 다음 확장이 예정되어 있다:

- Double-Entry Ledger 테이블 도입
- chain_checkpoint 테이블 도입
- sweep 관련 테이블 추가
- callback_job 및 queue 기반 비동기 처리 구조
- Withdrawal CONFIRMED 상태 추적

  ***
