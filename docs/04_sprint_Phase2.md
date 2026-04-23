# Phase 2 - Usability & Operation Enhancement

> 현재 판정: 대부분 구현됨, 일부 보완 필요
>
> 목표: 개발자/운영자가 실제로 흐름을 조회하고 테스트할 수 있는 환경을 만든다.

---

## 1. Phase Definition

Phase2는 신규 정산 로직을 크게 늘리는 단계가 아니라, Phase1에서 만든 흐름을 운영자/개발자가 사용할 수 있게 만드는 단계이다.

핵심:

- Worker 역할 분리
- Public / Admin Portal 분리
- Swagger / 문서 접근성
- 테스트/운영 보조 API
- 조회 UX 개선
- 수동 retry / control 기반 마련

---

## 2. Implemented Scope

### 2.1 Worker Split

현재 Worker 구조:

```text
DepositWorker   -> detect
ConfirmWorker   -> deposit confirm + sweep confirm
CallbackWorker  -> callback retry
SweepWorker     -> sweep broadcast
ReclaimWorker   -> wallet asset reclaim
```

구현 상태:

- 완료
- `BaseWorker` 공통 interval / 중복 실행 guard 사용

### 2.2 Public / Admin Portal

현재 라우트:

```text
/login
/                  Developer/Public 영역
/admin             Admin 영역
```

구현된 주요 화면:

- Dashboard
- Partners
- Users
- Wallets
- Deposits
- Callbacks
- Sweeps
- Documents / Swagger
- System Errors

비활성 또는 placeholder:

- Withdrawals 일부
- Balances 일부
- Blockchain THOT / Watcher 일부
- Monitoring
- Audit Logs
- Demo

### 2.3 Developer / Test Console

구현된 축:

- `portal/blockchain/test-transfer`
- wallet balance 조회
- callback test log
- DevConsolePage

보완 필요:

- txHash 입력 기반 full lifecycle view
- 테스트 지갑/토큰 선택 UX
- Tronscan link 표준화

### 2.4 Manual Control

구현된 축:

- callback retry ids
- failed callback retry
- wallet assets reclaim job 생성
- sweep list 조회

보완 필요:

- confirm 강제 실행 정책
- sweep 재시도 정책
- operator 권한 기준

### 2.5 Developer Guide

구현된 축:

- Portal 내 문서 viewer
- Swagger 연결

보완 필요:

- Partner API 사용 예제
- callback signature 검증 예제
- withdrawal 요청 예제

---

## 3. Remaining Work

우선순위 1:

- txHash 기반 Process Monitor 고도화
- Watcher status 실제 데이터 연결
- Manual control 권한/감사 정책 정리

우선순위 2:

- Developer Guide 보강
- Portal UX 일관화
- 상태 badge / copy / external link 정리

우선순위 3:

- disabled 메뉴의 구현 여부 결정
- placeholder 화면 정리

---

## 4. Completion Criteria

완료 기준:

- Portal에서 주요 도메인 조회가 가능하다.
- Worker가 역할별로 분리되어 있다.
- Swagger가 Partner API / Portal API로 분리되어 있다.
- 운영자가 callback 실패와 sweep 상태를 추적할 수 있다.
- 개발자가 문서와 Swagger로 연동 흐름을 이해할 수 있다.

현재 판정:

- 대부분 충족
- Phase3 작업과 병행해 보완한다.
