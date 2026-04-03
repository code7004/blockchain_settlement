## Architecture

### High-Level Structure

이 시스템은 Partner 서비스가 API를 통해 Wallet 시스템과 통신하고, 블록체인 네트워크와 연결되어 입금 정산을 수행하는 구조입니다.

```
[Partner Service]
        ↓ REST API
[Wallet API]
        ↓
[Tron Network]
```

Partner는 API를 통해 지갑을 생성하고 입금 주소를 발급받으며,

실제 자산 이동은 Tron 네트워크에서 발생합니다.

---

### Full System Flow

전체 흐름은 다음과 같습니다.

```
User → Deposit Wallet
        ↓
Deposit Watcher
        ↓
DETECTED
        ↓
CONFIRMED
        ↓
Callback
        ↓
Sweep
        ↓
Hot Wallet(THOT)

```

이 구조는 다음 원칙을 기반으로 합니다:

- 입금은 블록 스캔 기반으로 감지
- Confirmation 이후만 확정 처리
- 자금은 중앙 Hot Wallet으로 집계

---

### Core Components

#### 1. Deposit Wallet

- 사용자별로 생성되는 입금 전용 주소
- 자산 보관이 아닌 **입금 식별 목적**

```
User → Deposit Wallet
```

---

#### 2. Deposit Watcher

- 블록을 스캔하여 입금을 감지하는 백그라운드 작업
- Wallet을 조회하지 않고 블록을 읽어서 트랜잭션을 분석

```
Block → Transaction → Address Match
```

이 구조는 확장성과 안정성을 위해 선택되었습니다.

---

#### 3. Confirmation Layer

- 블록 수 기준으로 입금 확정 여부 판단
- 상태 전이:

```
DETECTED → CONFIRMED
```

확정 이후에만 잔액 및 콜백이 발생합니다.

---

#### 4. Sweep Worker

- Deposit Wallet에 있는 자금을 Hot Wallet으로 이동

```
Deposit Wallet → Hot Wallet
```

목적:

- 자산 중앙 집중 관리
- 보안 강화

---

#### 5. Hot Wallet (THOT)

- 실제 자산을 보관하는 중앙 지갑
- 모든 출금 트랜잭션의 송신 주체

```
Hot Wallet → User
```

---

#### 6. Callback System

- 입금 확정 후 파트너 시스템으로 이벤트 전달
- HMAC 서명 기반 보안 적용

---

### Key Design Decisions

이 시스템은 다음과 같은 설계 결정을 기반으로 구성되었습니다.

---

#### 1. Wallet Polling이 아닌 Block Scanning

일반적인 방식:

```
Wallet → Balance 조회
```

이 시스템:

```
Block → Transaction → Address 매칭
```

이 방식은 다음 장점이 있습니다:

- 대량 트랜잭션 처리에 유리
- 확장성 확보
- 멱등성 보장 용이

---

#### 2. Confirmation 기반 정산

- 즉시 반영하지 않음
- 일정 블록 이후 확정

이유:

- 체인 안정성 확보
- Reorg 리스크 방지

---

#### 3. Hot Wallet 구조

- 모든 자산을 중앙 지갑으로 집계
- Deposit Wallet은 보관 용도가 아님

이유:

- 출금 통제 가능
- 키 관리 단순화
- 보안 강화

---

#### 4. State Transition 기반 처리

모든 흐름은 상태 전이를 통해 관리됩니다.

예:

```
DETECTED → CONFIRMED
REQUESTED → APPROVED → BROADCASTED
```

이 구조는 정합성과 멱등성을 보장합니다.

---
