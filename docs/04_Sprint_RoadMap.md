# Development Roadmap

> 현재 기준: Phase3 Step3 진행 중
>
> 본 문서는 Phase별 목표와 현재 완료/진행/예정 범위를 요약한다. 세부 체크리스트는 각 `04_Sprint_Phase*.md` 문서에서 관리한다.

---

## 1. Phase Summary

```text
Phase1 = Functional MVP
  입금 감지 -> 확정 -> 콜백 -> 조회 흐름 검증

Phase2 = Usability & Operation Enhancement
  Portal, Worker 분리, 테스트/운영 보조 기능 강화

Phase3 = Production Readiness
  Sweep confirm 구조, 상태 정합성, 환경 분리, 배포/로그/안전성 확보

Phase4 = Production Hardening
  checkpoint, queue, ledger, KMS, monitoring, alert 등 운영 고도화
```

---

## 2. Current Status

현재 소스는 Phase1/Phase2 범위를 넘어 Phase3 일부까지 구현되어 있다.

완료 또는 구현됨:

- Partner / User / Wallet / Deposit / Withdrawal / Callback / Balance / Sweep 도메인
- Admin API와 Partner API 분리
- Portal JWT 인증
- Partner API Key 인증
- Swagger 분리: `/docs/api`, `/docs/partner`
- DepositWorker / ConfirmWorker / CallbackWorker / SweepWorker / ReclaimWorker
- Deposit confirm 이후 CallbackLog / SweepJob 생성
- SweepJob / SweepLog 기반 broadcast -> confirm 구조
- Callback retry 구조
- Public / Admin Portal 라우트 분리
- Prisma schema 확장: SweepJob, SweepLog, AssetsReclaimJob

진행 중:

- Phase3 Step3: Idempotency & 상태 전이 정리
- txHash unique 정책의 전체 도메인 검증
- 상태 전이 guard의 코드 레벨 일관성 확보

미완료 또는 예정:

- Gas refill 중복 방지와 wallet cooldown
- 운영 로그 구조화 및 txHash lifecycle 추적
- Dev / Live 환경 완전 분리 검증
- chain/token/env Safety Guard
- PM2 / 배포 스크립트 / restart 전략
- DB checkpoint 기반 watcher 복구
- BullMQ / DLQ 기반 callback queue
- Double-entry ledger
- KMS / Vault
- 운영 monitoring / alert

---

## 3. Phase 1 - Functional MVP

목표:

- 테스트넷 입금이 DB에 DETECTED로 생성된다.
- confirmation 이후 CONFIRMED로 전환된다.
- callback log가 생성되고 파트너 callback을 호출한다.
- Admin UI에서 Partner / User / Wallet / Deposit / Callback 상태를 확인한다.

현재 판정:

- 완료
- 이후 문서에서는 유지보수 기준으로만 관리한다.

포함 범위:

- Wallet 생성
- privateKey 암호화 저장
- Deposit detection
- Confirmation
- Callback HMAC + retry
- Simple balance
- 최소 Admin Portal
- Portal JWT 인증

---

## 4. Phase 2 - Usability & Operation Enhancement

목표:

- 개발자/운영자가 Portal에서 흐름을 조회하고 테스트할 수 있다.
- Worker가 역할별로 분리된다.
- Public / Admin 메뉴가 역할 기준으로 분리된다.
- Swagger와 문서가 Portal에서 접근 가능하다.

현재 판정:

- 대부분 구현됨
- 일부 메뉴는 placeholder 또는 disabled 상태

구현됨:

- Worker 분리
- Public / Admin Portal 라우트 분리
- Dashboard / Partner / User / Wallet / Deposit / Callback / Sweep 조회
- Dev console 성격의 blockchain test API와 화면
- Swagger / 문서 라우트
- Callback retry API

보완 필요:

- Process monitor의 txHash lifecycle 추적 고도화
- Watcher status 화면의 실제 데이터 연결
- Manual control 정책 정리
- Developer guide 예제 보강

---

## 5. Phase 3 - Production Readiness

목표:

- 운영 가능한 트랜잭션 엔진으로 정리한다.
- Sweep은 broadcast와 confirm을 분리해 체인 결과를 추적한다.
- 상태 전이와 멱등성 정책을 명확히 한다.
- Dev / Live 환경 혼용을 방지한다.
- 배포와 로그 기반 장애 추적이 가능해진다.

현재 판정:

- Step1 완료
- Step2 완료
- Step3 진행 중

핵심 구현:

- TxStatus 기준 상태 모델 도입
- SweepLog 중심 상태 관리
- ConfirmWorker가 Deposit confirm과 Sweep confirm을 함께 처리
- SweepWorker는 BROADCASTED 로그 생성까지 담당
- CallbackWorker는 DB polling 기반 retry 담당

남은 핵심:

- 상태 전이 제한
- txHash unique 전체 검증
- Gas refill 안정화
- structured logging
- environment guard
- deployment policy
- monitoring bootstrap

---

## 6. Phase 4 - Production Hardening

목표:

- 실제 운영 안정성, 보안, 정산 신뢰성을 확보한다.

예정 범위:

- chain checkpoint 기반 watcher 복구
- Callback queue / DLQ
- Withdrawal state machine 고도화
- Double-entry ledger
- Gas / resource 자동 관리
- KMS / Vault
- RBAC 고도화
- Monitoring / dashboard / alert
- SLA / incident response

현재 판정:

- 예정
- Phase3 완료 후 착수한다.

---

## 7. Development Rules

- 문서 기반 개발을 유지한다.
- 상태 전이는 문서와 Prisma enum 기준으로 판단한다.
- Worker 구조는 문서 기준으로 유지한다.
- 임의 구조 변경은 금지한다.
- 구현보다 문서가 뒤처진 경우, 먼저 문서를 현재 소스 기준으로 갱신한다.
- Phase 범위를 넘어서는 변경은 해당 Phase 문서에 먼저 기록한다.
