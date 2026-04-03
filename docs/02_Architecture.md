# Architecture

## 1. High-Level

### 1-1. Project Architecture

```
[Partner Service]
        ↓ REST API
[Wallet API (NestJS)]
        ↓
[TronGrid / Tron Node]
        ↓
[Tron Network]
```

이 시스템은 Partner 서비스가 REST API를 통해 Wallet API와 통신하며, 체인 상태 조회 및 트랜잭션 브로드캐스트는 TronGrid 또는 직접 노드를 통해 수행된다.

### 1-2. Full Architecure

```
             +------------------+
             |   Partner API    |
             +--------+---------+
                      |
                Wallet 생성
                      ↓
               Deposit Wallet
                      ↑
User Wallet -----------+
   (입금)
        ↓
+----------------------+
|   DepositWatcher     |
| block scan           |
+----------+-----------+
           ↓
        Deposit DB
           ↓
     confirmation check
           ↓
        User Balance
           ↓
        Sweep Worker
           ↓
        Hot Wallet
           ↓
        Withdraw API
           ↓
        User Wallet
```

## 2. System Concepts

이 시스템을 이해하기 위해서는 다음 핵심 개념들을 먼저 이해해야 한다.

### 2.1 User Wallet

사용자가 실제로 자산을 보관하고 있는 개인 지갑이다.

사용자는 자신의 지갑에서 **Partner가 제공한 Deposit Address로 토큰을 전송한다.**

```
User Wallet → Deposit Wallet
```

### 2-2 Deposit Wallet

Deposit Wallet은 사용자 입금을 식별하기 위해 시스템이 생성하는 지갑 주소이다.
특징

- 사용자별로 하나의 Deposit Address를 할당
- 해당 주소로 들어온 트랜잭션을 기반으로 입금을 식별
- 실제 자산 보관 목적이 아니라 입금 식별 목적

```
user1 → TAAA
user2 → TBBB
user3 → TCCC
```

사용자는 이 주소로 토큰을 전송한다.

```
User Wallet → Deposit Wallet
```

### 2-3. Hot Wallet

[THOT] Hot Wallet은 **시스템이 실제 자산을 관리하는 중앙 지갑**이다.

특징

- 시스템 출금 트랜잭션의 송신 지갑
- Sweep 작업을 통해 Deposit Wallet의 자금을 집계
- 항상 온라인 상태

구조

```
Deposit Wallet → Hot Wallet
```

Hot Wallet은 **출금 트랜잭션을 브로드캐스트하는 역할**을 수행한다.

### 2-4. Deposit Watcher

Deposit Watcher는 블록체인을 스캔하여 입금을 감지하는 백그라운드 작업이다.

중요한 특징

- Wallet을 순회하지 않음
- 블록을 스캔하여 트랜잭션을 검사

동작 흐름

```
latest block 조회
↓
block transactions 조회
↓
TRC20 transfer decode
↓
toAddress 확인
↓
내부 wallet 매칭
↓
Deposit 생성
```

즉 시스템은

```
Block → Transaction → Address Match
```

방식으로 입금을 감지한다.

### 2-5. Confirmation

블록체인 트랜젝션은 즉시 확정되지 않는다.
일정수의 블록이 추가된 이후에만 확정된 트랜잭션으로 처리한다.
상태전이

```
DETECTED → CONFIRMED
```

원칙

- Detected 상태에서는 잔액이 반영하지 않음
- Conirmed 이후에만 잔액 반영

### 2-6. Sweep

Sweep은 Deposit Wallet에 들어온 자금을 Hot Wallet으로 이동시키는 작업이다.
목적

- 자금을 중앙 지갑으로 집계
- Deposit Wallet에 자금을 장기간 보관하지 않기 위함
  동작

```
Deposit Wallet → Hot Wallet
```

Sweep은 Background Worker에 의해 자동 수행될 수 있다.

### 2.7 Token Policy

본 시스템은 TRC20 토큰 기반으로 동작한다.

운영 환경

- Token: USDT
- Standard: TRC20
- decimals: 6

개발 환경

- Token: MockUSDT
- symbol: mUSDT
- decimals: 6

개발 단계에서는 실제 자산 사용을 방지하고
입금 감지, confirmation, sweep, withdrawal 흐름을 테스트하기 위해
MockUSDT 토큰을 사용한다.

운영 환경에서는 실제 TRC20 USDT를 사용한다.

### 2.8 Gas Strategy

TRC20 토큰 전송은 스마트 컨트랙트 실행이기 때문에
트랜잭션 실행을 위해 일정량의 **TRX Gas**가 필요하다.

Deposit Wallet은 사용자 입금 식별을 위한 지갑이기 때문에
일반적으로 토큰만 존재하고 TRX 잔액이 없는 상황이 자주 발생한다.

이 경우 Sweep 작업이 실패할 수 있기 때문에
시스템은 Gas 관리 전략을 사용한다.

#### Phase1 전략 (Gas Tank 기반)

Phase1에서는 단순한 Gas Tank 전략을 사용한다.

구조

```
GasTank Wallet
↓
Deposit Wallet
↓
Sweep Worker
↓
Hot Wallet
```

운영 규칙

- 시스템은 GasTank Wallet을 하나 운영한다
- GasTank Wallet은 Deposit Wallet의 가스를 보충하는 역할을 한다
- Sweep Worker는 sweep 실행 전 Deposit Wallet의 TRX 잔액을 확인한다
- TRX 잔액이 기준값 미만일 경우 sweep을 수행하지 않는다
- 해당 이벤트는 warn 로그로 기록된다

Gas 기준값 예 > MIN_TRX_FOR_SWEEP = 0.1 TRX

가스 보충 방식

- 운영자가 GasTank Wallet에 TRX를 충전
- Worker가 Deposit Wallet의 TRX 부족을 감지
- GasTank → Deposit Wallet으로 TRX 전송

목적

- Sweep 실패 방지
- Deposit Wallet 가스 부족 문제 해결

#### Phase2 확장

Phase2에서는 보다 고도화된 Gas 관리 전략이 도입된다.

예

- TRX Staking 기반 Energy 생성
- Resource Delegation
- 자동 Gas refill 로직
- Gas 사용량 모니터링

### 2.9 Portal 인증 (JWT)

```
Portal → /auth/login
        ↓
JWT 발급
        ↓
Authorization: Bearer <token>
        ↓
JwtAuthGuard
```

### 2.10. Partner 인증 (API Key)

```
Partner → x-api-key
        ↓
ApiKeyGuard
        ↓
partnerId 추출
```

flow:

```
[생성 단계]
서버:
  rawKey 생성
  ↓
  bcrypt.hash(rawKey)
  ↓
  DB 저장
    - apiKeyHash
    - apiKeyPrefix

  ↓
  rawKey를 파트너에게 1회 전달

-----------------------------------
[요청 단계]
파트너:
  x-api-key: rawKey
-----------------------------------

[서버 인증]

1. apiKey 받기
2. prefix 추출
3. prefix로 DB 조회 (1건 찾기)
4. bcrypt.compare(apiKey, hash)
5. 성공 → partnerId 주입
```

## 3. System Flow

### 3-1. Deposit Flow

```
User → Deposit Wallet
        ↓
DepositWatcher가 블록 스캔
        ↓
Deposit row 생성 (status = DETECTED)
        ↓
confirmation 확인
        ↓
status = CONFIRMED
        ↓
user balance 증가
        ↓
Partner Callback (HMAC)
        ↓
Sweep (Deposit Wallet → Hot Wallet)
```

- Tron Network에서 TRC20 전송 발생
- Deposit Watcher가 주기적으로 블록 스캔 (Polling 기반)
- 수신 주소 기준으로 내부 Wallet 매칭
- txHash 기준으로 중복 여부 확인 (UNIQUE)
- DETECTED 상태 저장
- 지정 Confirmation 블록 수 충족 시 CONFIRMED 전환
- Ledger에 입금 반영
- Callback Module이 파트너에 HMAC 서명과 함께 통지

Deposit 처리의 핵심 원칙:

- Confirmation 이전에는 잔액에 반영하지 않음
- txHash 기반 멱등성 보장
- 상태 기반 전이 (DETECTED → CONFIRMED)

---

### 3-2. Withdrawal Flow

`체인 broadcast`

```
User 출금 요청
     ↓
Withdraw row 생성 (REQUESTED)
     ↓
관리자 승인 (APPROVED)   ← Phase1에서는 단순화 가능
     ↓
Hot Wallet → User Wallet 전송
     ↓
txHash 저장
     ↓
status = BROADCASTED

```

- Partner가 출금 요청 (REQUESTED 상태)
- 내부 승인 절차 후 APPROVED 전환
- Hot Wallet을 통해 TRC20 transfer 브로드캐스트
- txHash 저장 후 BROADCASTED 상태 전환
- 체인 Confirmation 추적 (Phase2에서 고도화 예정)
- Ledger에 출금 차감 반영

Withdrawal 처리의 핵심 원칙:

- User Wallet은 출금 키를 직접 보유하지 않음
- 모든 출금은 중앙 Hot Wallet에서 수행
- 상태 기반 전이 제한 (REQUESTED → APPROVED → BROADCASTED)

### 3-3. Wallet Flow

```
Partner → API 요청
           ↓
POST /wallets
           ↓
Tron createAccount()
           ↓
privateKey 암호화 저장
           ↓
wallet address DB 저장
           ↓
Partner에게 wallet address 반환
```

### 3-4. Watcher Flow

> 블록 → 트랜잭션 → 주소 매칭
> txHash UNIQUE check

```
Watcher
  ↓
최신 block 조회
  ↓
block transactions 조회
  ↓
TRC20 transfer decode
  ↓
toAddress 확인
  ↓
DB wallet lookup
  ↓
Deposit 생성
```

### 3-5 Sweep Flow

```
Sweep Worker
     ↓
Deposit Wallet balance 확인
     ↓
threshold 이상이면
     ↓
Deposit Wallet → Hot Wallet 전송[THOT]
```

> Sweep은 입금 정산과 독립적으로 수행될 수 있으며 CONFIRMED 이후 또는 별도 정책에 따라 실행된다.

## 4. Internal Modules

- Wallet Module
  지갑 생성 및 암호화 저장 담당
- Deposit Watcher
  블록 스캔 및 입금 감지 담당 (Background Worker)
  Deposit Detection Architecture는 Section 7 참고
- Withdrawal Module
  출금 요청 처리 및 브로드캐스트 담당
- Callback Module
  파트너 통지 및 재시도 관리
- Ledger Module
  입출금 기반 잔액 계산 및 정산 관리
- Member Module & Auth Module
  운영 관리 및 상태 조회 UI 지원

Watcher 및 Background Job은 API 요청 처리와 분리된 독립 실행 흐름으로 동작한다.

## 5. Monorepo Structure

```
chain-wallet-service/
 ├─ apps/
 │   ├─ api/     # NestJS Backend
 │   └─ portal/   # React Portal
 │
 ├─ packages/    # (공통 DTO / config 예정)
 │
 └─ infra/       # 배포 스크립트 / DB 설정
```

Monorepo 구조를 유지하여:

- api/ portal을 독립 실행 가능
- 공통 모듈 확장 가능
- 환경 설정 중앙화

## 6. Architectural Principles

- Domain 중심 구조
- Infrastructure Layer 분리
- 외부 시스템(Tron)은 infra 계층에서만 접근
- 비즈니스 로직은 domains 내부에서만 관리
- Controller는 Thin Layer 유지 (요청/응답 변환 역할)
- Transaction Boundary는 Service 계층에서 관리
- 상태 전이는 명시적 enum 기반으로 제한
- Background Job은 API 요청 흐름과 분리

이 원칙은 확장성과 정합성 유지를 위한 구조적 제약이다.

## 7. Backend Structure (apps/api)

```
apps/api/src
  ├─ core
    ├─ crypto
  ├─ domains/
    ├─ health/
    ├─ deposit/
    ├─ partner/
    ├─ settlement/
    ├─ user/
    ├─ wallet/
    ├─ withdraw/
  ├─ infra/
    ├─ tron/
      ├─ tron.client.ts
      ├─ tron.module.ts
      ├─ tron.service.ts
  ├─ prisma

```

- domains는 비즈니스 책임 단위로 분리
- infra는 외부 I/O 접근 전담
- core는 공통 유틸 및 암호화 모듈 보관

sss

### Domain Directory Structure

각 도메인은 다음과 같은 표준 디렉토리 구조를 따른다.

```
domains/
  domainName/
    dto/
      *.dto.ts
    domain.types.ts
    domain.controller.ts
    domain.service.ts
    domain.repository.ts
    domain.module.ts
```

#### 역할

**controller**

- HTTP API 진입점
- 요청 DTO 검증 및 Service 호출

**service**

- 도메인 비즈니스 로직 처리
- 여러 Repository 또는 외부 서비스 조합

**repository**

- Prisma를 이용한 DB 접근 계층
- 데이터 조회 및 저장 담당

**dto**

- API 요청/응답 데이터 구조 정의
- `class-validator`, `Swagger` 사용
- Controller 계층에서만 사용

**domain.types.ts**

- 도메인 내부에서 사용하는 TypeScript 타입 정의
- Service ↔ Repository ↔ Worker 간 데이터 구조 표현
- Prisma 모델 타입을 직접 외부로 노출하지 않기 위한 목적

## 8. Portal Structure (apps/portal)

```
apps/portal/src
  ├─ assets
  ├─ lib
  ├     api.ts
  ├─ domains/
  	│   BalancePage.tsx
    │   CallbackList.tsx
    │   Dashboard.tsx
    │   DepositList.tsx
    │   PartnerList.tsx
    │   UserList.tsx
    │   WalletList.tsx
    │   WithdrawalList.tsx
    │
    ├───blockchain
    │       ThotPage.tsx
    │       WatcherStatusPage.tsx
    │
    ├───documents
    │   │   DocApiPage.tsx
    │   │   SwaggerPage.tsx
    │   │
    │   └───DocSystem
    │           index.tsx
    │
    └───system
            ErrorReportPage.tsx
  ├─ styles
    ├─ index.css
    ├─ tailwind.css

```

Portal은 상태 조회 및 운영 관리 목적이며, 정산 로직은 모두 Backend에 존재한다.

## 8. Deposit Detection Pipeline

---

### Deposit Detection Architecture

이 시스템은 **Tron 네트워크의 TRC20 Transfer 이벤트를 감지하여 입금을 처리하는 구조**로 설계되어 있다.

핵심 설계 목표

- 실시간에 가까운 입금 감지
- 지갑 매칭 기반 입금 처리
- 확장 가능한 이벤트 파이프라인

---

### 전체 흐름

```
Tron Blockchain
      │
      │  (new block polling)
      ▼
DepositWatcher
      │
      │ TRC20 Transfer decode
      ▼
DepositService
      │
      │ wallet lookup
      ▼
WalletRepository
      │
      │ deposit create
      ▼
DepositRepository
      │
      ▼
PostgreSQL
```

---

### 구성 요소 설명

#### DepositWatcher

역할

- Tron 블록을 주기적으로 스캔
- TRC20 Transfer 이벤트 추출
- DepositService 호출

동작

```
10초마다 최신 블록 조회
    ↓
트랜잭션 목록 가져오기
    ↓
TRC20 contract 이벤트 필터
    ↓
transfer decode
    ↓
DepositService 전달
```

로그 예시

```
[scan] block=80674073 tx=342
TRC20 transfer detected tx=xxxx to=Txxxx amount=1130000000
```

---

#### DepositService

역할

- 블록체인 이벤트를 **비즈니스 로직으로 처리**

처리 과정

```
transfer detected
      ↓
wallet 조회
      ↓
wallet 존재 여부 확인
      ↓
deposit 생성
```

구조

```
DepositService
   ├ WalletRepository
   └ DepositRepository
```

---

#### WalletRepository

역할

```
address → user wallet 조회
```

예시

```
SELECT * FROM wallets WHERE address = ?
```

---

#### DepositRepository

역할

`deposit row 생성`

저장 데이터

```
txHash
walletId
amount
status
blockNumber
```

초기 상태

```
DETECTED
```

---

### 데이터 흐름 예시

실제 입금 발생

```
User sends USDT
    ↓
TRON blockchain
    ↓
DepositWatcher detects
    ↓
wallet address match
    ↓
deposit row created
```

DB 저장 예시

```
deposit

id
walletId
txHash
amount
status
blockNumber
createdAt
```

---

### Deposit 상태 정의

```
DETECTED
CONFIRMED
FAILED
```

설명

| 상태      | 의미      |
| --------- | --------- |
| DETECTED  | 블록 감지 |
| CONFIRMED | 컨펌 완료 |
| FAILED    | 처리 실패 |

---

### Polling 설계 이유

Tron은 Webhook 기반 이벤트가 없어 **Polling 방식으로 블록을 스캔**한다.

설정

```
SCAN_INTERVAL = 10s
```

장점

- 안정적
- 구현 단순
- 장애 복구 가능

---

### 확장 계획

향후 추가될 기능

```
Confirmations
Hot wallet sweep
Partner callback
Withdraw system
```

최종 구조

```
DepositWatcher
   ↓
DepositService
   ↓
ConfirmService
   ↓
CallbackService
```
