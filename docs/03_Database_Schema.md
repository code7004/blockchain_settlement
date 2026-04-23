# Database Schema

> 현재 Prisma schema 기준 데이터베이스 문서
>
> 기준 파일: `packages/prisma/prisma/schema.prisma`

---

# 1. Overview

본 데이터베이스는 멀티 파트너 환경에서 블록체인 기반 입출금 정산의 정합성, 멱등성, 상태 기반 전이를 보장하기 위해 설계되었다.

핵심 목표:

- Partner 단위 데이터 격리
- txHash 기반 멱등성 보장
- Confirmation 이후 잔액 반영
- Deposit / Withdrawal / Sweep 상태 기반 추적
- Hot Wallet 기반 중앙 집계 및 출금 구조
- Callback retry 이력 보관
- Worker 기반 비동기 처리 상태 추적

현재 schema는 Phase1 문서보다 확장되어 있으며, Phase3 Step3 기준으로 SweepJob, SweepLog, AssetsReclaimJob, 통합 TxStatus 기준 enum이 포함되어 있다.

---

# 2. Prisma Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

DB provider는 PostgreSQL이다.

---

# 3. Domain Relationship

현재 주요 관계:

```text
Member

Partner
  ├─ User
  │   └─ Wallet
  │       ├─ Deposit
  │       │   ├─ CallbackLog
  │       │   ├─ SweepJob
  │       │   └─ SweepLog
  │       ├─ Withdrawal
  │       └─ AssetsReclaimJob
  │
  ├─ CallbackLog
  └─ SweepLog

HealthPing
CallbackTestLog
```

설계 원칙:

- Partner는 정산 데이터 격리의 최상위 단위이다.
- User는 독립 개체가 아니라 Partner에 종속된다.
- Wallet은 Partner / User에 종속된다.
- Deposit / Withdrawal은 Wallet 기준으로 발생한다.
- CallbackLog는 Deposit에 종속된다.
- SweepJob은 Deposit당 1개만 존재한다.
- SweepLog는 Sweep 시도 및 결과 이력을 보관한다.
- AssetsReclaimJob은 Wallet 자산 회수 작업 queue 역할을 한다.

---

# 4. Enums

## 4.1 MemberRole

관리자 / 운영자 / 개발자 권한 구분.

```text
OWNER
OPERATOR
DEVELOPER
```

## 4.2 WalletStatus

```text
ACTIVE      정상 사용 가능
SUSPENDED   입출금 제한
LOCKED      보안 이슈
PENDING     생성 직후
```

## 4.3 TxStatus

도메인별 상태 enum의 기준이 되는 공통 상태 개념이다.

```text
DETECTED     체인 이벤트 감지
PENDING      처리 대기
BROADCASTED  체인 제출됨
CONFIRMED    체인 확정
FAILED       실패
SKIPPED      정책상 제외
```

현재 Prisma 주석상 실제 모델이 직접 참조하지는 않지만, Deposit / Withdrawal / Sweep 상태 설계의 기준으로 사용한다.

## 4.4 DepositStatus

```text
DETECTED
CONFIRMED
FAILED
```

기본 전이:

```text
DETECTED -> CONFIRMED
DETECTED -> FAILED
```

## 4.5 WithdrawalStatus

```text
REQUESTED
APPROVED
BROADCASTED
CONFIRMED
FAILED
```

기본 전이:

```text
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                              \-> FAILED
```

## 4.6 CallbackStatus

```text
PENDING
SUCCESS
FAILED
```

## 4.7 SweepJobStatus

```text
PENDING
PROCESSING
```

`PROCESSING`은 worker lock 용도로 사용한다.

## 4.8 SweepStatus

```text
PENDING
BROADCASTED
CONFIRMED
FAILED
SKIPPED
```

## 4.9 AssetsReclaimJobStatus

```text
PENDING
PROCESSING
CONFIRMED
FAILED
```

---

# 5. Table Definitions

## 5.1 HealthPing

시스템 헬스 체크용 테이블.

| 컬럼      | 타입        | 제약/기본값                 | 설명             |
| --------- | ----------- | --------------------------- | ---------------- |
| id        | String UUID | PK, default uuid            | 식별자           |
| message   | String      |                             | 헬스 체크 메시지 |
| createdAt | DateTime    | default now, timestamptz(3) | 생성 시간        |

---

## 5.2 Member

Admin Portal 인증 주체.

| 컬럼      | 타입        | 제약/기본값                 | 설명        |
| --------- | ----------- | --------------------------- | ----------- |
| id        | String UUID | PK, default uuid            | 식별자      |
| username  | String      | unique                      | 로그인 ID   |
| password  | String      |                             | bcrypt hash |
| role      | MemberRole  | default DEVELOPER           | 역할        |
| isActive  | Boolean     | default true                | 활성 여부   |
| createdAt | DateTime    | default now, timestamptz(3) | 생성 시간   |
| updatedAt | DateTime    | updatedAt, timestamptz(3)   | 수정 시간   |

특징:

- Portal JWT 로그인 대상이다.
- OWNER / OPERATOR / DEVELOPER 역할을 가진다.

---

## 5.3 Partner

외부 연동 파트너이자 데이터 격리 기준.

| 컬럼            | 타입        | 제약/기본값                 | 설명                |
| --------------- | ----------- | --------------------------- | ------------------- |
| id              | String UUID | PK, default uuid            | 식별자              |
| name            | String      | unique                      | 파트너 이름         |
| callbackUrl     | String      |                             | 콜백 URL            |
| callbackSecret  | String      |                             | HMAC secret         |
| apiKeyPrefix    | String      | unique                      | API Key prefix      |
| apiKeyHash      | String      |                             | API Key bcrypt hash |
| apiKeyCreatedAt | DateTime    | timestamptz(3)              | API Key 생성 시간   |
| memberId        | String UUID |                             | 관리자 참조값       |
| isActive        | Boolean     | default true                | 활성 여부           |
| createdAt       | DateTime    | default now, timestamptz(3) | 생성 시간           |
| updatedAt       | DateTime    | updatedAt, timestamptz(3)   | 수정 시간           |

관계:

- `users`
- `wallets`
- `deposits`
- `withdrawals`
- `callbackLogs`
- `sweepLogs`

인덱스:

- `@@index([isActive])`

특징:

- API Key 인증 주체이다.
- API Key 원문은 저장하지 않는다.
- Partner 삭제 cascade는 사용하지 않는 방향을 원칙으로 한다.

---

## 5.4 User

파트너 소속 사용자.

| 컬럼           | 타입        | 제약/기본값                 | 설명                  |
| -------------- | ----------- | --------------------------- | --------------------- |
| id             | String UUID | PK, default uuid            | 식별자                |
| partnerId      | String UUID | FK Partner                  | 소속 파트너           |
| externalUserId | String      |                             | 외부 시스템 사용자 ID |
| isActive       | Boolean     | default true                | 활성 여부             |
| createdAt      | DateTime    | default now, timestamptz(3) | 생성 시간             |
| updatedAt      | DateTime    | updatedAt, timestamptz(3)   | 수정 시간             |

관계:

- `partner`
- `wallets`
- `deposits`
- `withdrawals`

제약/인덱스:

- `@@unique([partnerId, externalUserId])`
- `@@index([partnerId])`
- `@@index([isActive])`
- Partner relation은 `onDelete: Restrict`

---

## 5.5 Wallet

입금 식별 주소이자 출금/회수 작업의 기준 지갑.

| 컬럼                | 타입         | 제약/기본값                 | 설명                      |
| ------------------- | ------------ | --------------------------- | ------------------------- |
| id                  | String UUID  | PK, default uuid            | 식별자                    |
| partnerId           | String UUID  | FK Partner                  | 파트너                    |
| userId              | String UUID  | FK User                     | 사용자                    |
| address             | String(64)   | unique                      | Tron 주소                 |
| encryptedPrivateKey | Text         |                             | AES-256 암호화 privateKey |
| status              | WalletStatus | default ACTIVE              | 지갑 상태                 |
| lastRefillAt        | DateTime?    | timestamptz(3)              | 마지막 TRX refill 시간    |
| refillCount         | Int          | default 0                   | refill 횟수               |
| assetsSnapshot      | Json?        |                             | 자산 스냅샷, 실시간 아님  |
| createdAt           | DateTime     | default now, timestamptz(3) | 생성 시간                 |
| updatedAt           | DateTime     | updatedAt, timestamptz(3)   | 수정 시간                 |

관계:

- `partner`
- `user`
- `deposits`
- `withdrawals`
- `assetsReclaimJobs`

인덱스:

- `@@index([partnerId])`
- `@@index([userId])`
- `@@index([status])`

특징:

- privateKey 평문 저장 금지.
- Deposit Wallet 역할을 수행한다.
- refill 관련 필드는 Gas 전략 안정화 과정에서 사용된다.

---

## 5.6 Deposit

블록체인 입금 트랜잭션.

| 컬럼          | 타입          | 제약/기본값                 | 설명             |
| ------------- | ------------- | --------------------------- | ---------------- |
| id            | String UUID   | PK, default uuid            | 식별자           |
| partnerId     | String UUID   | FK Partner                  | 파트너           |
| userId        | String UUID   | FK User                     | 사용자           |
| walletId      | String UUID   | FK Wallet                   | 입금 지갑        |
| tokenSymbol   | String        |                             | 토큰 심볼        |
| tokenContract | String        |                             | 토큰 컨트랙트    |
| txHash        | String        | unique                      | 체인 트랜잭션    |
| fromAddress   | String        |                             | 송신 주소        |
| toAddress     | String        |                             | 수신 주소        |
| amount        | Decimal       |                             | 입금 수량        |
| blockNumber   | Int           |                             | 감지 블록 번호   |
| status        | DepositStatus |                             | 상태             |
| reason        | String?       |                             | 실패/스킵 사유   |
| detectedAt    | DateTime      | timestamptz(3)              | 감지 시간        |
| confirmedAt   | DateTime?     | timestamptz(3)              | 확정 시간        |
| writer        | String(50)?   |                             | 처리 주체/서버명 |
| createdAt     | DateTime      | default now, timestamptz(3) | 생성 시간        |

관계:

- `partner`
- `user`
- `wallet`
- `callbackLogs`
- `sweepJob`
- `sweepLogs`

제약:

- `txHash @unique`

처리 흐름:

```text
DETECTED -> CONFIRMED
DETECTED -> FAILED
```

후속 작업:

- ConfirmWorker가 CONFIRMED 전환
- CallbackLog 생성
- SweepJob 생성

---

## 5.7 Withdrawal

출금 요청 및 브로드캐스트 기록.

| 컬럼          | 타입             | 제약/기본값                 | 설명              |
| ------------- | ---------------- | --------------------------- | ----------------- |
| id            | String UUID      | PK, default uuid            | 식별자            |
| partnerId     | String UUID      | FK Partner                  | 파트너            |
| userId        | String UUID      | FK User                     | 사용자            |
| walletId      | String UUID      | FK Wallet                   | 기준 지갑         |
| tokenSymbol   | String           |                             | 토큰 심볼         |
| tokenContract | String           |                             | 토큰 컨트랙트     |
| toAddress     | String           |                             | 수신 주소         |
| amount        | Decimal(36, 18)  |                             | 출금 수량         |
| status        | WithdrawalStatus | default REQUESTED           | 상태              |
| reason        | String?          |                             | 실패/처리 사유    |
| txHash        | String?          | unique                      | 체인 트랜잭션     |
| blockNumber   | BigInt?          |                             | 브로드캐스트 블록 |
| requestedAt   | DateTime?        | timestamptz(3)              | 요청 시간         |
| approvedAt    | DateTime?        | timestamptz(3)              | 승인 시간         |
| broadcastedAt | DateTime?        | timestamptz(3)              | 브로드캐스트 시간 |
| failReason    | String?          |                             | 실패 사유         |
| writer        | String(50)?      |                             | 처리 주체/서버명  |
| createdAt     | DateTime         | default now, timestamptz(3) | 생성 시간         |
| updatedAt     | DateTime         | updatedAt, timestamptz(3)   | 수정 시간         |

관계:

- `partner`
- `user`
- `wallet`

인덱스:

- `@@index([partnerId])`
- `@@index([userId])`
- `@@index([walletId])`
- `@@index([status])`
- `@@index([createdAt])`

제약:

- `txHash @unique`

상태 모델:

```text
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                              \-> FAILED
```

주의:

- 현재 문서 기준으로는 출금 lifecycle 고도화가 Phase3/Phase4 보완 대상이다.
- 상태 전이 제한과 double broadcast 방지는 코드 레벨 검증이 필요하다.

---

## 5.8 CallbackLog

파트너 콜백 로그.

| 컬럼             | 타입           | 제약/기본값                 | 설명             |
| ---------------- | -------------- | --------------------------- | ---------------- |
| id               | String UUID    | PK, default uuid            | 식별자           |
| partnerId        | String UUID    | FK Partner                  | 파트너           |
| depositId        | String UUID    | FK Deposit                  | 입금             |
| txHash           | String         | unique                      | 입금 txHash      |
| eventType        | String         |                             | 이벤트 타입      |
| callbackUrl      | String         |                             | 호출 URL         |
| requestBody      | String         |                             | JSON string body |
| requestSignature | String         |                             | HMAC 서명        |
| attemptCount     | Int            |                             | 시도 횟수        |
| maxAttempts      | Int            |                             | 최대 시도 횟수   |
| lastStatusCode   | Int?           |                             | 마지막 응답 코드 |
| status           | CallbackStatus |                             | 상태             |
| reason           | String?        |                             | 실패 사유        |
| lastAttemptAt    | DateTime?      | timestamptz(3)              | 마지막 시도 시간 |
| writer           | String(50)?    |                             | 처리 주체/서버명 |
| createdAt        | DateTime       | default now, timestamptz(3) | 생성 시간        |
| updatedAt        | DateTime       | updatedAt, timestamptz(3)   | 수정 시간        |

관계:

- `partner`
- `deposit`

인덱스:

- `@@index([txHash])`
- `@@index([partnerId])`
- `@@index([depositId])`
- `@@index([eventType])`
- `@@index([status])`
- `@@index([lastAttemptAt])`
- `@@map("callback_logs")`

제약:

- `txHash @unique`

특징:

- 하나의 Deposit txHash에 대해 하나의 callback log만 생성되는 구조이다.
- CallbackWorker가 retry와 final status를 갱신한다.

---

## 5.9 CallbackTestLog

콜백 테스트용 로그.

| 컬럼      | 타입        | 제약/기본값                 | 설명      |
| --------- | ----------- | --------------------------- | --------- |
| id        | String UUID | PK, default uuid            | 식별자    |
| headers   | Json        |                             | 요청 헤더 |
| body      | Json        |                             | 요청 바디 |
| signature | String?     |                             | 서명      |
| createdAt | DateTime    | default now, timestamptz(3) | 생성 시간 |

매핑:

- `@@map("callback_test_logs")`

---

## 5.10 SweepJob

Confirmed Deposit을 Sweep 대상으로 큐잉하기 위한 테이블.

| 컬럼      | 타입           | 제약/기본값                 | 설명             |
| --------- | -------------- | --------------------------- | ---------------- |
| id        | String UUID    | PK, default uuid            | 식별자           |
| depositId | String UUID    | unique, FK Deposit          | 대상 Deposit     |
| status    | SweepJobStatus |                             | 처리 상태        |
| writer    | String(50)?    |                             | 처리 주체/서버명 |
| createdAt | DateTime       | default now, timestamptz(3) | 생성 시간        |

관계:

- `deposit`

인덱스:

- `@@index([createdAt])`

제약:

- `depositId @unique`

특징:

- Queue 역할을 한다.
- 실제 실행 결과는 SweepLog에 기록한다.
- Deposit 1건당 중복 SweepJob 생성을 막는다.

---

## 5.11 SweepLog

Sweep 실행 결과 로그.

| 컬럼         | 타입          | 제약/기본값                 | 설명             |
| ------------ | ------------- | --------------------------- | ---------------- |
| id           | String UUID   | PK, default uuid            | 식별자           |
| partnerId    | String UUID   | FK Partner                  | 파트너           |
| depositId    | String UUID   | FK Deposit                  | 대상 Deposit     |
| txHash       | String?       | unique                      | sweep txHash     |
| fromAddress  | String?       |                             | 송신 주소        |
| toAddress    | String?       |                             | 수신 주소        |
| amount       | Decimal(30,6) |                             | Sweep 수량       |
| feeAmount    | Decimal(30,6) |                             | 수수료 수량      |
| feeSymbol    | String(20)?   |                             | 수수료 심볼      |
| status       | SweepStatus   |                             | 처리 결과 상태   |
| reason       | String?       |                             | 처리 사유        |
| errorMessage | String?       |                             | 실패 상세 메시지 |
| writer       | String(50)?   |                             | 처리 주체/서버명 |
| createdAt    | DateTime      | default now, timestamptz(3) | 생성 시간        |

관계:

- `deposit`
- `partner`

인덱스:

- `@@index([depositId])`
- `@@index([status])`
- `@@index([partnerId])`

제약:

- `txHash @unique`

상태 모델:

```text
PENDING -> BROADCASTED -> CONFIRMED
        \-> FAILED
        \-> SKIPPED
```

특징:

- 모든 Sweep 시도를 추적하기 위한 audit log이다.
- SweepWorker가 BROADCASTED 로그를 만들고, ConfirmWorker가 CONFIRMED / FAILED로 마무리한다.

---

## 5.12 AssetsReclaimJob

Wallet의 token/TRX 자산 회수 작업 queue.

| 컬럼       | 타입                   | 제약/기본값                 | 설명             |
| ---------- | ---------------------- | --------------------------- | ---------------- |
| id         | String UUID            | PK, default uuid            | 식별자           |
| walletId   | String UUID            | FK Wallet                   | 대상 Wallet      |
| status     | AssetsReclaimJobStatus | default PENDING             | 상태             |
| reason     | String?                |                             | 실패/처리 사유   |
| retryCount | Int                    | default 0                   | 재시도 횟수      |
| writer     | String(50)?            |                             | 처리 주체/서버명 |
| createdAt  | DateTime               | default now, timestamptz(3) | 생성 시간        |
| startedAt  | DateTime?              | timestamptz(3)              | 시작 시간        |
| finishedAt | DateTime?              | timestamptz(3)              | 종료 시간        |

관계:

- `wallet`

인덱스:

- `@@index([status])`

특징:

- ReclaimWorker가 처리한다.
- Wallet의 token을 Hot Wallet로 회수하고, 남은 TRX를 Gas Tank로 회수하는 운영 보조 작업이다.

---

# 6. State Transition Rules

## 6.1 Deposit

```text
DETECTED -> CONFIRMED
DETECTED -> FAILED
```

규칙:

- DETECTED 상태에서는 잔액에 반영하지 않는다.
- CONFIRMED 상태에서만 balance 계산에 포함한다.
- 동일 txHash는 중복 저장하지 않는다.

## 6.2 Withdrawal

```text
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                              \-> FAILED
```

규칙:

- REQUESTED 상태에서는 체인 전송이 발생하지 않는다.
- APPROVED 이후에만 broadcast 가능하다.
- 현재 balance 계산은 BROADCASTED withdrawal을 차감한다.
- CONFIRMED 추적은 운영 고도화 대상이다.

## 6.3 CallbackLog

```text
PENDING -> SUCCESS
PENDING -> FAILED
```

규칙:

- `attemptCount < maxAttempts` 동안 retry 가능하다.
- 최종 실패 시 FAILED로 남긴다.

## 6.4 SweepJob

```text
PENDING -> PROCESSING
PROCESSING -> PENDING
PROCESSING -> 삭제
```

규칙:

- PROCESSING은 worker lock 성격이다.
- terminal SweepLog가 있으면 job을 제거한다.
- TRX 부족 등 재시도 필요 시 PENDING으로 되돌린다.

## 6.5 SweepLog

```text
PENDING -> BROADCASTED -> CONFIRMED
        \-> FAILED
        \-> SKIPPED
```

규칙:

- BROADCASTED는 txHash가 있는 체인 제출 상태이다.
- CONFIRMED는 chain receipt와 confirmation 수를 만족한 상태이다.
- SKIPPED는 Hot Wallet 주소 일치, zero balance 등 정책상 처리 제외를 의미한다.

---

# 7. Idempotency Strategy

멱등성은 DB 제약과 상태 전이로 보장한다.

- `Deposit.txHash @unique`
- `Withdrawal.txHash @unique`
- `CallbackLog.txHash @unique`
- `SweepJob.depositId @unique`
- `SweepLog.txHash @unique`
- 상태 조건부 update
- Worker 처리 시 PROCESSING lock 또는 terminal log 확인

주의:

- `txHash`가 nullable인 테이블은 DB별 unique-null 동작을 이해하고 사용해야 한다.
- Withdrawal과 SweepLog는 txHash가 생성되기 전 상태가 있을 수 있다.

---

# 8. Balance Calculation Rule

현재 코드 기준 단순 계산:

```text
balance = sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

주의:

- DETECTED Deposit은 계산에서 제외한다.
- REQUESTED / APPROVED Withdrawal은 계산에서 제외한다.
- Withdrawal CONFIRMED 상태까지의 정산 정책은 추후 문서와 코드에서 재정의가 필요하다.
- Double-entry Ledger는 아직 schema에 없다.

---

# 9. Index Strategy

현재 schema에 명시된 주요 인덱스:

- `Partner.isActive`
- `User.partnerId`
- `User.isActive`
- `Wallet.partnerId`
- `Wallet.userId`
- `Wallet.status`
- `Withdrawal.partnerId`
- `Withdrawal.userId`
- `Withdrawal.walletId`
- `Withdrawal.status`
- `Withdrawal.createdAt`
- `CallbackLog.txHash`
- `CallbackLog.partnerId`
- `CallbackLog.depositId`
- `CallbackLog.eventType`
- `CallbackLog.status`
- `CallbackLog.lastAttemptAt`
- `SweepJob.createdAt`
- `SweepLog.depositId`
- `SweepLog.status`
- `SweepLog.partnerId`
- `AssetsReclaimJob.status`

현재 문서상 필요하지만 schema에 직접 index가 없는 후보:

- `Deposit.partnerId`
- `Deposit.userId`
- `Deposit.walletId`
- `Deposit.status`
- `Deposit.blockNumber`
- `Deposit.createdAt`
- `SweepJob.status`

위 후보는 조회 패턴과 실제 쿼리 성능을 확인한 뒤 migration으로 추가 여부를 결정한다.

---

# 10. Data Integrity Rules

- 모든 정산 데이터는 Partner를 기준으로 추적 가능해야 한다.
- privateKey는 평문 저장하지 않는다.
- API Key 원문은 저장하지 않는다.
- Deposit은 txHash unique로 중복 반영을 막는다.
- Confirmation 전 Deposit은 balance에 반영하지 않는다.
- Sweep은 SweepJob과 SweepLog를 분리하여 queue와 audit log를 구분한다.
- 상태 변경은 가능한 한 timestamp와 writer를 함께 기록한다.
- Partner / User / Wallet 관계는 임의 삭제보다 비활성화 정책을 우선한다.

---

# 11. Current Gaps

현재 schema와 운영 목표 사이에서 정리할 부분:

- Double-entry Ledger 테이블은 아직 없다.
- chain checkpoint 테이블은 아직 없다.
- callback queue / DLQ 테이블은 아직 없다.
- Deposit 조회용 인덱스가 운영 규모 대비 추가 필요할 수 있다.
- Withdrawal CONFIRMED 기반 정산 정책은 아직 문서/코드 정합화가 필요하다.
- `SweepJobStatus.PROCESSING` 주석에 오탈자성 표현이 있다.
- `AssetsReclaimJobStatus`에는 CONFIRMED가 있으나 현재 ReclaimWorker는 성공 시 job 삭제 흐름을 사용한다.

이 항목들은 다음 Phase 문서 또는 migration 정책 문서에서 별도 작업으로 다룬다.
