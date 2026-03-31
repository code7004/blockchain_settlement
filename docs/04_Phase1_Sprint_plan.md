# 🔵 Phase 1 — Functional MVP (현재 상태 기준)

> 목표: “입금 감지 → 확정 → 콜백 → 조회” 흐름이 **안정적으로 검증 가능**

---

## 🎯 Phase1 핵심 정의

```
✔ 구조 증명
✔ 데이터 정합성 유지
✔ 파트너 분리
✔ Admin UI로 상태 검증 가능

❌ 운영 안정성
❌ 고급 보안
❌ 자동화 완성
```

---

## ✅ Phase1 Scope (재정의)

### 1. Multi-Partner

- Partner / User / Wallet 구조
- Partner 단위 데이터 격리

---

### 2. Wallet

- Tron createAccount()
- privateKey AES256 저장

---

### 3. Deposit Detection

- Block polling watcher
- TRC20 transfer decode
- txHash UNIQUE
- 상태: DETECTED

---

### 4. Confirmation

- blockNumber 기반
- 상태: CONFIRMED 전환
- CONFIRMED 이후만 반영

---

### 5. Callback

- CONFIRMED 이후 호출
- HMAC 서명
- retry (3회)
- callback_logs 저장

---

### 6. Ledger (Simple)

```
balance = sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)
```

---

### 7. Admin UI (검증용)

- Partner / User / Wallet 조회
- Deposit 상태 확인
- Callback 상태 확인
- Withdrawal 조회
- Balance 확인

👉 운영툴 ❌

👉 검증툴 ⭕

---

### 8. Authentication (Minimal)

- Admin Login (JWT)
- Admin Guard

👉 Role / Scope ❌

👉 단일 관리자 기준 ⭕

---

### 9. Sweep (Partial)

- Deposit → Hot Wallet 이동
- Worker 존재
- 실패 처리 단순

👉 자동화 완성 ❌

👉 구조 검증 ⭕

---

## ❌ Phase1에서 제외 (강제)

```
- Withdrawal broadcast 완성
- Gas 자동 refill 완성
- Monitoring 시스템
- Queue 기반 callback
- Rate limit
- RBAC 고도화
- KMS / Vault
```

---

# 📅 Phase1 Sprint (현실 기준)

## Day 1 ~ 3 — Core Setup

- 프로젝트 세팅
- DB / Prisma
- Partner / User

---

## Day 4 — Wallet

- Tron 연결
- wallet 생성
- 암호화 저장

---

## Day 5 — Deposit Watcher

- block scan
- deposit 생성 (DETECTED)

---

## Day 6 — Confirmation

- CONFIRMED 전환
- blockNumber 기준

---

## Day 7 — Callback

- HMAC 생성
- retry
- callback_logs

---

## Day 8 — Admin UI (기본)

- Partner / User / Deposit 조회

---

## Day 9 — Balance

- simple ledger 계산

---

## Day 10 — Sweep (구조만)

- deposit → hot wallet

---

## Day 11 — Auth (Minimal)

- login
- JWT
- guard

---

# ✅ Phase1 완료 기준 (Revised)

```
- 테스트넷 입금 → DB DETECTED 생성
- Confirmation → CONFIRMED 전환
- Callback 전송 확인
- Admin UI에서 전체 흐름 확인 가능
- JWT 로그인 가능
- Partner/User/Wallet 구조 정상 동작
```

---
