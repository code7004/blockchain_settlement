# Phase 4 - Production Hardening

> 현재 판정: 예정
>
> 목표: 실제 운영 안정성, 보안, 정산 신뢰성을 확보한다.

---

## 1. Phase Definition

Phase4는 Phase3에서 운영 가능한 구조가 정리된 이후, 장애 복구/정산 신뢰성/보안/모니터링을 서비스 수준으로 끌어올리는 단계이다.

Phase4 전제:

- Phase3 상태 전이 정책 완료
- Sweep broadcast -> confirm 흐름 안정화
- Dev / Live 환경 분리 완료
- 배포/restart/log 정책 수립

---

## 2. Week Plan

### Week 1. Deposit Worker Hardening

목표:

- 파일 cursor 기반 watcher를 운영 복구 가능한 checkpoint 구조로 전환한다.

작업:

- `chain_checkpoint` 테이블 설계
- last scanned block DB 저장
- 서버 재시작 시 checkpoint 기반 재시작
- 블록 누락 복구 로직
- 동일 블록 재처리 멱등성 검증

완료 기준:

- watcher 중단/재시작 후 누락 없이 재개된다.
- 동일 block 재처리 시 중복 Deposit이 생성되지 않는다.

### Week 2. Callback Queue System

목표:

- CallbackWorker의 DB polling 구조를 queue 기반으로 고도화한다.

작업:

- BullMQ 또는 대체 queue 도입 여부 결정
- callback_job / DLQ 설계
- exponential backoff
- timeout / response validation
- callback 중복 전송 방지

완료 기준:

- callback retry 정책이 queue 기준으로 추적된다.
- DLQ 적재와 재처리가 가능하다.

### Week 3. Withdrawal State Machine

목표:

- 출금 lifecycle을 chain confirmation까지 안정적으로 추적한다.

작업:

- 상태 전이 guard 강화
- double broadcast 방지
- Hot Wallet transfer confirm 추적
- 실패 재처리 정책
- txHash 기반 상태 동기화

완료 기준:

- REQUESTED -> APPROVED -> BROADCASTED -> CONFIRMED 흐름이 검증된다.
- 실패/지연/중복 broadcast 케이스를 추적할 수 있다.

### Week 4. Sweep Strategy

목표:

- Sweep 자동화와 운영 제어를 고도화한다.

작업:

- threshold / cooldown 정책
- partner별 sweep 정책
- refill log
- failed sweep retry
- sweep pending lag monitoring

완료 기준:

- Deposit Wallet 잔액이 정책에 따라 안정적으로 Hot Wallet에 집계된다.
- gas 부족/chain 실패 케이스가 추적된다.

### Week 5. Ledger Upgrade

목표:

- 단순 합산 balance를 double-entry ledger로 전환한다.

작업:

- ledger_entry 테이블 설계
- CREDIT / DEBIT 구조
- refType / refId 연결
- deposit / withdrawal / sweep 연동
- balance 계산 교체
- ledger 재생성/검증 도구

완료 기준:

- 모든 정산 이벤트가 ledger에 기록된다.
- balance는 ledger 기반으로 계산된다.
- 체인 잔액과 DB 잔액 대사가 가능하다.

### Week 6. Gas & Resource Management

목표:

- TRX / Energy 부족으로 인한 전송 실패를 줄인다.

작업:

- Gas Tank balance monitoring
- wallet refill cooldown
- Resource delegation 검토
- gas usage log
- low balance alert

완료 기준:

- gas 부족을 사전에 탐지한다.
- refill 중복이 방지된다.
- 출금/sweep 실패율이 감소한다.

### Week 7. Security Hardening

목표:

- 키 관리와 관리자 권한을 운영 수준으로 강화한다.

작업:

- KMS / Vault 도입 검토 및 적용
- privateKey 접근 audit log
- RBAC 강화
- 민감 정보 redaction 검증
- 운영자 권한 분리

완료 기준:

- privateKey 접근 경로가 추적된다.
- 관리자 권한이 역할별로 제한된다.
- 민감 정보가 로그에 노출되지 않는다.

### Week 8. Monitoring & Risk Management

목표:

- 운영자가 장애와 이상 패턴을 빠르게 파악할 수 있게 한다.

작업:

- txHash lifecycle dashboard
- callback failure rate
- withdrawal failure rate
- sweep lag
- block lag
- alert channel
- incident template

완료 기준:

- 주요 실패율과 지연 상태를 dashboard에서 확인할 수 있다.
- 장애 발생 시 알림과 대응 기준이 존재한다.

---

## 3. Completion Checklist

안정성:

- [ ] watcher checkpoint 복구
- [ ] 동일 tx 재처리 멱등성 검증
- [ ] double broadcast 방지
- [ ] queue retry / DLQ

정합성:

- [ ] double-entry ledger
- [ ] ledger 기반 balance
- [ ] 체인 잔액 대사
- [ ] Sweep 이후 DB/chain 흐름 검증

보안:

- [ ] KMS / Vault
- [ ] privateKey audit
- [ ] RBAC
- [ ] log redaction

운영:

- [ ] dashboard
- [ ] alert
- [ ] incident response
- [ ] backup / restore

성능:

- [ ] 월 150,000건 기준 조회 성능 검증
- [ ] Deposit / Withdrawal / Sweep 인덱스 최적화
- [ ] balance 계산 지연 제거

---

## 4. Risk Management

체인 리스크:

- confirmation 지연
- chain reorg
- gas 부족
- TronGrid rate limit

대응:

- confirmation 기준 유지
- retry/backoff
- checkpoint 재처리
- gas monitoring

정합성 리스크:

- 중복 tx 반영
- 중복 broadcast
- callback 중복 전송

대응:

- txHash unique
- 상태 전이 guard
- idempotency key
- event log

운영 리스크:

- 서버 다운
- queue 적체
- DB 장애
- 배포 실패

대응:

- PM2/restart policy
- DLQ
- backup/restore
- rollback policy

보안 리스크:

- privateKey 노출
- 내부자 오남용
- 로그 민감정보 노출

대응:

- KMS/Vault
- audit log
- RBAC
- redaction
