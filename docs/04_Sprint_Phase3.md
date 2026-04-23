# Phase 3 - Production Readiness

> 현재 판정: Step3 진행 중
>
> 목표: 운영 가능한 트랜잭션 엔진, 환경 분리, 로그/안전성 기반을 확보한다.

---

## 1. Phase Definition

Phase3는 기능 추가보다 운영 가능한 구조 정리를 우선한다.

핵심:

- Transaction lifecycle 정리
- Sweep broadcast -> confirm 구조 확립
- Worker 구조 단순화
- txHash 기반 멱등성 검증
- 상태 전이 제한
- Gas refill 안정화
- Dev / Live 환경 분리
- 로그와 배포 정책 정리
- Safety Guard 도입

---

## 2. Step Status

### Step1. Transaction Lifecycle

상태: 완료

- [x] TxStatus 기준 상태 개념 도입
- [x] Deposit / Withdrawal / Sweep 상태 매핑 정리
- [x] Sweep에서 단순 SUCCESS 표현 제거
- [x] BROADCASTED / CONFIRMED 구분

### Step2. Sweep & Confirm 구조

상태: 완료

Sweep:

- [x] SweepWorker는 token transfer broadcast 담당
- [x] SweepLog 중심 상태 관리
- [x] SweepJob은 queue 역할로 분리
- [x] terminal log 존재 시 job 제거
- [x] BROADCASTED 상태를 chain confirm 전 단계로 유지

Confirm:

- [x] ConfirmWorker가 deposit confirm 처리
- [x] ConfirmWorker가 sweep confirm 처리
- [x] receipt 기반 SweepLog CONFIRMED / FAILED 처리
- [x] chain fee 기록 기반 마련

### Step3. Idempotency & State Transition

상태: 진행 중

구현됨:

- [x] `Deposit.txHash @unique`
- [x] `Withdrawal.txHash @unique`
- [x] `CallbackLog.txHash @unique`
- [x] `SweepJob.depositId @unique`
- [x] `SweepLog.txHash @unique`
- [x] SweepJob PROCESSING lock
- [x] terminal SweepLog 확인
- [x] BROADCASTED 중복 확인

남은 작업:

- [ ] 도메인별 상태 전이 guard 명시화
- [ ] Withdrawal double broadcast 방지 검증
- [ ] Callback eventType 정책 정리
- [ ] nullable txHash unique 정책 검토
- [ ] Deposit / Sweep / Withdrawal transition test 작성

기준 전이:

```text
Deposit:
DETECTED -> CONFIRMED
DETECTED -> FAILED

Sweep:
PENDING -> BROADCASTED -> CONFIRMED
        \-> FAILED
        \-> SKIPPED

Withdrawal:
REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED
                              \-> FAILED
```

### Step4. Gas & Resource Stabilization

상태: 미완료

구현됨:

- [x] Sweep 전 Deposit Wallet TRX balance 확인
- [x] TRX 부족 시 Gas Tank refill 시도
- [x] Wallet에 `lastRefillAt`, `refillCount` 필드 존재

남은 작업:

- [ ] refill 중복 방지
- [ ] wallet cooldown 적용
- [ ] refill txHash 별도 로그 정책
- [ ] GasRefillWorker 등록 여부 결정
- [ ] Gas Tank balance monitoring

### Step5. Logging

상태: 일부 구현

구현됨:

- [x] AppLoggerService
- [x] HttpLoggingInterceptor
- [x] Worker logger
- [x] SweepLog / CallbackLog / writer 필드 일부 활용

남은 작업:

- [ ] txHash lifecycle log 통합
- [ ] structured error format
- [ ] env / worker name / chain 포함
- [ ] 민감 정보 redaction 검증
- [ ] operation log / audit log 정책

### Step6. Worker Structure

상태: 완료 + 정리 필요

현재 등록 worker:

```text
DepositWorker   -> detect
ConfirmWorker   -> deposit confirm + sweep confirm
CallbackWorker  -> callback retry
SweepWorker     -> sweep broadcast
ReclaimWorker   -> assets reclaim
```

정리 필요:

- [ ] `recalim.worker.ts` 파일명 오탈자 정리 여부 결정
- [ ] `GasRefillWorker` 등록 여부 결정

### Step7. Infrastructure

상태: 미완료

- [ ] Live server 구축
- [ ] Dev server 구축
- [ ] CloudFront
- [ ] Domain / HTTPS
- [ ] CORS 운영 정책 확정

현재 CORS:

- localhost
- `*.balletpay.net`
- `https://balletpay.net`

### Step8. Environment & Security

상태: 일부 구현

구현됨:

- [x] EnvService
- [x] required env 접근 시 missing env error
- [x] JWT secret 분리
- [x] wallet master key 기반 복호화
- [x] hot wallet / gas tank env 접근

남은 작업:

- [ ] Dev / Live env lock
- [ ] chain guard
- [ ] token contract guard
- [ ] endpoint 분리 정책
- [ ] API Key / JWT secret 환경별 분리 검증
- [ ] GAS_TANK 환경별 분리 검증

### Step9. Database Strategy

상태: 일부 완료

구현됨:

- [x] Prisma schema 확장
- [x] migration history 존재
- [x] dev/prod DB 분리 방향 문서화

남은 작업:

- [ ] dev DB / prod DB 물리 분리 확인
- [ ] prod RDS 구축
- [ ] migration 적용 정책
- [ ] prod 직접 접근 제한
- [ ] backup / snapshot / restore test
- [ ] Deposit 조회 인덱스 검토

### Step10. Monitoring

상태: 초기 구조

구현됨:

- [x] MonitorModule
- [x] txHash path 기반 monitor controller
- [x] Portal placeholder

남은 작업:

- [ ] txHash lifecycle view
- [ ] block lag
- [ ] callback failure rate
- [ ] sweep pending/broadcasted lag
- [ ] dashboard metric 연결

### Step11. Deployment

상태: 미완료

- [ ] PM2 실행 구조
- [ ] API restart strategy
- [ ] Portal build/deploy policy
- [ ] log rotation
- [ ] deploy script
- [ ] rollback policy

### Step12. Safety

상태: 미완료

- [ ] test/prod 환경 혼용 방지
- [ ] 잘못된 chain 요청 차단
- [ ] 잘못된 token 요청 차단
- [ ] ENV Guard
- [ ] Admin ENV 표시
- [ ] HealthCheck 강화
- [ ] 로그 ENV 포함

---

## 3. Completion Criteria

Phase3 완료 기준:

- Dev / Live가 독립적으로 동작한다.
- Deposit -> Confirm -> Callback -> Sweep -> Confirm 흐름이 정상 동작한다.
- Sweep은 chain confirmation 기준으로 완료된다.
- broadcast 실패/지연을 재처리하거나 추적할 수 있다.
- txHash 기준 lifecycle 추적이 가능하다.
- 상태 전이가 코드 레벨에서 제한된다.
- Gas refill 중복이 방지된다.
- 장애 발생 시 로그로 원인을 추적할 수 있다.
- 배포/restart 절차가 문서화되어 있다.

---

## 4. Current Focus

현재 우선순위:

1. Step3 상태 전이/멱등성 정리
2. Step4 gas refill 중복 방지
3. Step5 txHash lifecycle logging
4. Step10 monitor API/Portal 연결
5. Step11 deployment policy
