# 🔵 Phase 2 — Usability & Operation Enhancement

> 목표: “운영자/개발자가 실제로 사용 가능한 테스트·검증 환경 구축”

---

🎯 Phase2 핵심 정의

✔ 기능 추가 ❌
✔ 운영 편의성 ⭕
✔ 테스트 자동화 ⭕
✔ 외부 개발자 사용성 ⭕

---

# ✅ Phase2 Scope

## 1. Test Console (Wallet → Deposit Test)

### 목적

- Admin에서 직접 체인 테스트 수행
- 입금 → 확정 → 콜백 → 스윕 전체 흐름 검증

---

### 기능

- From Wallet 입력 (테스트 지갑)
- To Wallet 선택 (Deposit Address)
- Token 선택 (mUSDT)
- Amount 입력
- Send 버튼

---

### 동작 구조

Admin → API → TronService.transfer()

※ privateKey 보호를 위해 서버 proxy 방식 사용

---

### 결과 표시

- txHash 출력
- 트랜잭션 링크 (Tronscan)
- 처리 상태 추적

```
DETECTED → CONFIRMED → CALLBACK → SWEEP
```

---

## 2. Process Monitor (Transaction Flow)

### 목적

- 단일 트랜잭션 기준 전체 처리 흐름 시각화

---

### 표시 항목

```

1. Transfer 발생
2. Watcher 감지
3. Deposit 생성
4. Confirmation 완료
5. Callback 전송
6. Sweep 완료
```

---

### 기능

- txHash 기반 조회
- 단계별 상태 표시
- 시간 정보 표시
- 실패 단계 강조 표시

---

## 3. Deposit Worker 분리

목적

- 안정적인 테스트 서비스 제공을 위해 Worker 분리 작업을 한다.

기존 :

```
DepositWatcher
private async tick() {
  await this.detectTransfers();
  await this.confirmService.processConfirmations();
}


export class ConfirmService {
  ...
  async processConfirmations(): Promise<void> {
    ...

    await this.callbackService.sendDepositConfirmed(deposit);
    ...
  }
}
```

수정 :

```
// DepositWatcher
tick() {
  detectTransfers()
}

// ConfirmWorker
tick() {
  processConfirmations()
}

// CallbackWorker
tick() {
  retryCallbacks()
}
```

## 4. Developer Guide (문서 보완)

### 목적

- 외부 개발자가 바로 연동 가능하도록 문서 강화

---

### 추가 내용

#### 1. JavaScript 예제

```

- 로그인
- Wallet 생성
- Deposit 주소 조회
- Deposit 조회
- Callback 검증
- Withdrawal 요청
```

---

#### 2. API 요청/응답 예제

```
POST /auth/login
POST /wallets
GET /deposits
POST /withdrawals
```

---

#### 3. Callback 검증 예제 (Node.js)

```
HMAC-SHA256 검증 코드
```

---

## 5. Public Admin UI (Operator / Developer)

### 목적

- 제한된 권한 사용자에게 조회 기능 제공

---

### 권한 정의

#### Developer

- 조회 전용
- Swagger / Docs 접근
- Deposit / Withdrawal 조회

---

#### Operator

- 조회 + 일부 액션
- Callback 재시도
- Withdrawal 승인

---

### 구현 방식

- route.meta.permissions 기반 제어
- 메뉴 필터링
- 접근 제어

---

### 구조

```
/admin   → 전체 기능
/public  → 제한 기능
```

또는

```
role 기반 메뉴 필터
```

---

## 6. Admin UX 개선

### 추가 기능

- 필터 상태 URL 동기화
- 자동 refresh (polling)
- 상태 색상 표시
- txHash copy 기능
- 외부 링크 연결 (Tronscan)

---

## 7. Watcher Status 강화

### 표시 항목

- running 여부
- last scanned block
- latest block
- block lag
- last scan time
- 최근 에러 로그

---

## 8. Manual Control 기능

### 기능

- confirm 강제 실행
- callback 재시도
- sweep 실행

---

# 🚀 Phase2 우선순위

## Tier 1 (필수)

- Test Console
- Process Monitor
- Public Admin UI
- worker 분리

---

## Tier 2

- Developer Guide

---

## Tier 3

- UX 개선
- Watcher 상태 강화
- Manual Control 기능

---

# 🧠 핵심 요약

```
Phase1   = 시스템 동작 검증
Phase2 = 운영 및 테스트 가능 상태
```
