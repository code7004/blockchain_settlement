## Data Flow

### 1. Deposit Flow

입금은 블록체인 트랜잭션을 기반으로 감지되며,

확정(Confirmation) 이후에만 시스템에 반영됩니다.

```
User
  ↓ transfer (TRC20)
Deposit Wallet
  ↓
Deposit Watcher (block scan)
  ↓
DETECTED
  ↓ (confirmation N blocks)
CONFIRMED
  ↓
Callback (to Partner)
  ↓
Ledger 반영
```

---

### Deposit Flow 설명

- 사용자는 Deposit Wallet으로 토큰을 전송합니다.
- Watcher가 블록을 스캔하여 해당 트랜잭션을 감지합니다.
- 감지 시 상태는 `DETECTED`로 기록됩니다.
- 일정 블록 수 이후 `CONFIRMED`로 전이됩니다.
- 확정 이후에만:
  - Partner Callback 발생
  - Ledger 반영

👉 핵심 규칙:

- Confirmation 이전 금액은 잔액에 포함되지 않음
- 동일 txHash는 중복 처리되지 않음

---

### 2. Sweep Flow

Deposit Wallet에 들어온 자금은

Hot Wallet로 자동 집계됩니다.

```
Deposit Wallet
  ↓
Sweep Worker
  ↓
Hot Wallet
```

---

### Sweep Flow 설명

- Sweep Worker가 Deposit Wallet 잔액을 확인합니다.
- 일정 기준 이상일 경우 Hot Wallet로 전송합니다.
- 이 과정은 백그라운드 작업으로 수행됩니다.

👉 목적:

- 자산 중앙 집중화
- Deposit Wallet 리스크 제거
- 출금 준비 상태 유지

---

# 3. 상태 전이 요약 (핵심 블록)

```
Deposit:
DETECTED → CONFIRMED

Withdrawal (future):
REQUESTED → APPROVED → BROADCASTED → CONFIRMED
```

👉 모든 흐름은 상태 기반으로 관리됨

---

# 4. 이벤트 타이밍 (중요)

| 이벤트       | 발생 시점      |
| ------------ | -------------- |
| Deposit 감지 | DETECTED       |
| Callback     | CONFIRMED 이후 |
| Ledger 반영  | CONFIRMED 이후 |
| Sweep        | 별도 worker    |
