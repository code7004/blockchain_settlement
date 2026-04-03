# Domains

## Overview

이 시스템은 기능 단위가 아닌 **도메인 단위로 분리된 구조**를 기반으로 설계되었습니다.

각 도메인은 독립적인 책임을 가지며,

입금 감지 → 확정 → 정산 → 출금 흐름을 구성하는 핵심 단위입니다.

---

## Domain Structure

```
Partner
User
Wallet
Deposit
Withdrawal
Callback
Ledger
```

각 도메인은 서로 연결되어 하나의 정산 시스템을 구성합니다.

---

## 1. Partner

파트너는 시스템을 사용하는 외부 서비스 단위입니다.

### 역할

- API 인증 주체
- Callback 수신 주체
- 사용자 관리 단위

### 주요 속성

- apiKey
- callbackUrl
- status

---

## 2. User

User는 파트너 내부의 최종 사용자입니다.

### 역할

- Wallet 소유자
- 입금/출금의 실제 주체

### 주요 속성

- partnerId
- externalUserId

---

## 3. Wallet

Wallet은 블록체인 주소를 관리하는 도메인입니다.

### 역할

- Deposit Address 생성
- 사용자와 주소 매핑

### 특징

- 사용자당 1개 이상 생성 가능
- privateKey는 암호화되어 저장됨

---

## 4. Deposit

Deposit은 입금 트랜잭션을 관리하는 핵심 도메인입니다.

### 역할

- 블록체인 입금 기록 저장
- 상태 관리 (DETECTED / CONFIRMED)
- Ledger 반영 기준 데이터

---

### 상태 정의

```
DETECTED → CONFIRMED
```

---

### 특징

- txHash 기준 멱등 처리
- Confirmation 이후에만 유효

---

## 5. Withdrawal

Withdrawal은 출금 요청을 관리하는 도메인입니다.

### 역할

- 출금 요청 생성
- 상태 기반 처리

---

### 상태 흐름 (예정 구조)

```
REQUESTED → APPROVED → BROADCASTED → CONFIRMED
```

---

### Phase1 상태

- 기본 구조만 존재
- 실제 출금 로직은 제한적

---

## 6. Callback

Callback은 파트너 시스템과의 이벤트 통신을 담당합니다.

### 역할

- 입금 확정 이벤트 전달
- 재시도 관리

---

### 특징

- HMAC 서명 기반 보안
- 실패 시 재시도 수행

---

## 7. Ledger

Ledger는 정산 데이터를 계산하는 도메인입니다.

### 역할

- 입금/출금 기반 잔액 계산
- Admin 조회 데이터 제공

---

### Phase1 특징

- 단순 합산 구조

```
balance = depositSum - withdrawalSum
```

---

### Phase2 확장

- double-entry ledger 구조 예정

---

## Domain Relationships

```
Partner
  ↓
User
  ↓
Wallet
  ↓
Deposit
  ↓
Ledger
```

추가 흐름:

```
Deposit → Callback
Deposit → Sweep → Hot Wallet
Withdrawal → Hot Wallet
```

---

## Key Design Principles

### 1. Domain Separation

각 도메인은 독립적으로 관리되며,

책임이 명확히 분리됩니다.

---

### 2. State-driven Processing

모든 흐름은 상태 기반으로 처리됩니다.

- Deposit: DETECTED → CONFIRMED
- Withdrawal: REQUESTED → ...

---

### 3. Idempotency

- 동일 txHash는 한 번만 처리됩니다.
- 중복 처리 방지를 보장합니다.

---

### 4. Partner Isolation

- 모든 데이터는 Partner 단위로 분리됩니다.
- 데이터 혼합이 발생하지 않도록 설계되었습니다.

---

## Summary

- Domain 구조는 시스템 확장성과 안정성을 위한 핵심 설계입니다.
- 각 도메인은 독립적인 책임을 가지며 전체 정산 흐름을 구성합니다.
- 상태 기반 처리와 멱등성 보장을 통해 데이터 정합성을 유지합니다.
