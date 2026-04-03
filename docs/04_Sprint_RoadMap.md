# Development Roadmap

---

## Phase 1 – Functional MVP (기능 증명)

> 목표: “입금 → 확정 → 콜백” 전체 흐름이 **정상 동작하는지 검증**

### 핵심

- Deposit Detection → Confirmation → Callback 흐름 완성
- Multi-Partner 구조 검증
- 데이터 정합성 확보 (txHash UNIQUE, 상태 전이)
- Admin UI를 통한 상태 확인

### 포함

- Wallet 생성 (암호화 저장)
- Deposit Watcher (block polling)
- Confirmation 처리
- Callback (HMAC + retry)
- Simple Ledger
- Admin UI (조회 중심)
- Admin JWT 인증 (최소 수준)
- Sweep (구조만)

### 제외

- 운영 자동화
- 고급 보안 (KMS 등)
- Queue 시스템
- Monitoring / 통계
- RBAC

### 완료 기준

- 테스트넷 입금 → CONFIRMED → Callback 확인
- Admin UI에서 전체 흐름 검증 가능

:contentReference[oaicite:0]{index=0}

---

## Phase 2 – Operation & Usability (운영/테스트 환경)

> 목표: “개발자/운영자가 실제로 사용할 수 있는 테스트 환경 구축”

### 핵심

- 기능 추가가 아니라 **사용성 + 테스트 환경 강화**
- 운영 편의성 확보
- 외부 개발자 연동 가능 상태

### 포함

- Test Console (입금 테스트 UI)
- Process Monitor (트랜잭션 흐름 시각화)
- Worker 분리 (Watcher / Confirm / Callback)
- Public Admin UI (Developer / Operator)
- Developer Guide 보완
- Admin UX 개선
- Manual Control 기능 (재시도 / 강제 실행)

### 완료 기준

- Admin에서 전체 흐름 테스트 가능
- 외부 개발자가 문서만으로 연동 가능

:contentReference[oaicite:1]{index=1}

---

## Phase 3 – Production Environment Setup (환경 분리)

> 목표: “Dev / Live 완전 분리 + 실제 운영 가능한 인프라 구축”

### 핵심

- Dev / Live 환경 완전 분리
- 실 운영 가능한 배포 구조 확보
- 환경 혼용 방지

### 포함

- Live / Dev 서버 분리 (Mainnet / Testnet)
- DB 분리 (dev_db / prod_db)
- ENV 분리 및 Secret 관리
- CloudFront + HTTPS 구성
- Admin Portal 환경 선택 기능
- 로그 시스템 (error / event)
- 배포 스크립트 및 PM2 구조
- Health Check / Safety Guard

### 완료 기준

- Dev / Live 각각 독립 동작
- Mainnet 트랜잭션 정상 처리
- Admin에서 환경 선택 가능

:contentReference[oaicite:2]{index=2}

---

## Phase 4 – Production Hardening (운영 안정성 & 확장)

> 목표: “실제 서비스 수준의 안정성, 보안, 정산 신뢰성 확보”

### 핵심

- 완전한 운영 자동화
- 데이터 정합성 강화
- 보안 및 모니터링 체계 구축

### 포함

- Watcher 복구 (checkpoint 기반)
- Callback Queue (BullMQ + DLQ)
- Withdrawal State Machine 고도화
- Sweep 전략 자동화
- Double-entry Ledger 도입
- Gas / Resource 자동 관리
- KMS / Vault 기반 키 관리
- RBAC 권한 시스템
- Monitoring / Dashboard / Alert

### 완료 기준

- 장애 발생 시 자동 복구 가능
- Ledger 기반 정산 신뢰성 확보
- 운영자가 실시간 상태 확인 가능
- 보안 감사 및 추적 가능

:contentReference[oaicite:3]{index=3}

---

## 전체 흐름 요약

```

Phase1 = 시스템 동작 검증 (MVP)

Phase2 = 테스트 및 운영 사용 가능 상태

Phase3 = 실제 운영 환경 구축 (Dev / Live 분리)

Phase4 = 운영 안정성 / 보안 / 확장 완성

```

---

## 개발 방식

- Document Driven Development 기반
- Sprint 단위 구현
- Domain Architecture 준수
- 단계별 확장 (Phase별 Scope 엄격 제한)

:contentReference[oaicite:4]{index=4}
