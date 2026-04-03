## Phase4. Sprint Plan(8 Weeks)

### Week 1 – Deposit Watcher Hardening

**목표**

Watcher를 “운영 가능 수준”으로 개선

**작업**

- `chain_checkpoint` 테이블 생성
- 마지막 스캔 블록 저장
- 서버 재시작 시 checkpoint 기반 재시작
- 블록 누락 복구 로직
- 중복 처리 재검증

**완료 기준**

- 서버 재시작 후 누락 없이 재스캔
- 동일 블록 재처리 시 멱등성 유지
- watcher 중단 후 복구 가능

#### Week 2 – Callback Queue System

**목표**

콜백을 동기 처리 → 비동기 Queue 기반으로 전환

**작업**

- BullMQ 도입
- callback_job 테이블/queue 설계
- Exponential Backoff
- Dead-letter Queue
- 응답 검증 로직 추가
- timeout 처리

**완료 기준**

- API 응답과 콜백 처리 분리
- 콜백 실패 시 재시도 정책 정상 동작
- DLQ 적재 확인 가능

#### Week 3 – Withdrawal State Machine 고도화

**목표**

출금 상태 전이 안정화

**작업**

상태 확장:

```
REQUESTED
  → APPROVED
  → BROADCASTED
  → CONFIRMED
  → FAILED / RETRY
```

- 체인 confirmation 추적
- 실패 재시도 정책
- txHash 기반 상태 동기화
- double broadcast 방지 로직

**완료 기준**

- 체인 실패 시 자동 상태 전환
- 중복 broadcast 방지
- CONFIRMED까지 추적 가능

#### Week 4 – Sweep Strategy 도입

**목표**

User Wallet → Hot Wallet 집계 자동화

**작업**

- sweep_job 설계
- threshold 기반 sweep
- 파트너별 집계 전략
- sweep 로그 저장
- sweep 실패 처리

**완료 기준**

- 일정 기준 이상 잔액 자동 집계
- sweep 로그 추적 가능
- 수동 개입 없이 집계 가능

#### Week 5 – Ledger Upgrade (Double-Entry)

**목표**

정산 신뢰성 확보

**작업**

- ledger_entry 테이블 설계
- DEBIT / CREDIT 구조
- refType / refId 연결
- deposit / withdrawal 연동
- balance 계산 → ledger 기반으로 변경

**완료 기준**

- 모든 입출금이 ledger에 기록
- balance는 ledger 기반 계산
- 체인 잔액과 비교 가능

#### Week 6 – Gas & Resource Management

**목표**

TRX 에너지/수수료 관리 자동화

**작업**

- hot_wallet_trx_balance 추적
- 가스 부족 사전 감지
- 자동 TRX 충전 로직
- 가스 로그 저장

**완료 기준**

- 에너지 부족 시 사전 경고
- 자동 충전 가능
- 출금 실패 감소

#### Week 7 – Security Hardening

**목표**

키 관리 및 접근 제어 강화

**작업**

- AWS KMS 또는 Vault 연동
- privateKey 접근 Audit Log
- Role-Based Access Control
- Admin 권한 분리

**완료 기준**

- 키 접근 로그 추적 가능
- 관리자 권한 분리
- 키 직접 노출 차단

#### Week 8 – Monitoring & Risk Management

**목표**

운영 가시성 확보

**작업**

- 파트너별 입금 통계
- 콜백 실패율 모니터링
- 출금 실패율 모니터링
- Rate Limiting
- 대시보드 구성
- 알림 시스템 연동 (Slack 등)

**완료 기준**

- 이상 패턴 감지 가능
- 파트너 SLA 관리 가능
- 운영자가 시스템 상태 실시간 확인 가능

## Phase4. Completion Checklist

### 안정성

- [ ] 서버 재시작 후 watcher 정상 복구
- [ ] 블록 누락 복구 가능
- [ ] 동일 tx 재처리 시 중복 반영 없음
- [ ] double broadcast 방지 로직 검증 완료

### 정합성

- [ ] 모든 입출금이 double-entry ledger에 기록
- [ ] balance는 ledger 기반 계산
- [ ] 체인 잔액과 DB 잔액 대사 가능
- [ ] Sweep 후 잔액 일치 확인

### 콜백 신뢰성

- [ ] Queue 기반 처리 전환 완료
- [ ] Exponential Backoff 동작 확인
- [ ] Dead-letter Queue 적재 확인
- [ ] 콜백 실패율 통계 확인 가능

### 보안

- [ ] privateKey는 KMS/Vault에서만 접근
- [ ] Key 접근 로그 추적 가능
- [ ] 관리자 권한 분리 완료
- [ ] 민감 데이터 로그 노출 없음

### 운영 가시성

- [ ] 파트너별 입금/출금 통계 확인 가능
- [ ] 실패율 대시보드 확인 가능
- [ ] 이상 패턴 탐지 가능
- [ ] 알림 시스템 연동 완료

### 성능

- [ ] 월 150,000건 기준 인덱스 최적화 확인
- [ ] 주요 테이블(Deposit, Withdrawal, Ledger) 조회 성능 검증
- [ ] 대량 데이터에서 balance 계산 지연 없음

## Phase4. Risk Management

### 체인 리스크

- Confirmation 지연
- 체인 reorg 가능성
- Gas 부족으로 인한 출금 실패

대응:

- 최소 블록 확정 기준 유지
- blockNumber 재검증
- 가스 사전 감지

### 멱등성 리스크

- 중복 tx 반영
- 중복 broadcast
- 콜백 중복 수신

대응:

- txHash UNIQUE
- 상태 기반 전이 제한
- 콜백 eventType UNIQUE 제약

### 운영 리스크

- 서버 다운
- watcher 중단
- queue 적체
- sweep 실패

대응:

- checkpoint 기반 재시작
- DLQ 도입
- 모니터링 및 알림

### 보안 리스크

- privateKey 노출
- 내부자 접근
- 로그에 민감 정보 포함

대응:

- KMS/Vault
- Key Access Audit
- 로그 필터링
