## Overview

### Multi-Partner Blockchain Settlement System

Tron 기반 멀티 파트너 입금 정산 시스템입니다.

기존 현금 운영 환경에 체인 정산 인프라를 연결하기 위해 설계된 백엔드 중심 플랫폼이며,

입금 감지부터 확정 처리, 파트너 콜백, 자금 집계, 잔액 조회까지 전체 흐름을 지원합니다.

---

### What this system solves

블록체인 입금 정산을 운영 환경에 연결할 때는 다음과 같은 문제가 발생합니다.

- 입금 시점을 언제 확정으로 볼 것인지
- 여러 파트너의 데이터를 어떻게 분리할 것인지
- 중복 트랜잭션을 어떻게 방지할 것인지
- 정산 잔액의 정합성을 어떻게 유지할 것인지

이 시스템은 이러한 문제를 해결하기 위해

**상태 전이 기반 처리, 파트너 단위 데이터 분리, Hot Wallet 중심 운영 구조**를 채택했습니다.

---

### Core goals

- Partner별 데이터 완전 분리
- Confirmation 이후만 잔액 반영
- HMAC 기반 파트너 콜백
- 중앙 Hot Wallet 기반 자금 운영
- 확장 가능한 Ledger 구조 확보

이 원칙은 프로젝트의 핵심 설계 기준이며,

Phase1에서도 최소 보안과 정합성 원칙은 유지하도록 구성되어 있습니다.

---

### Current scope in Phase 1

현재 Phase1에서는 다음 범위를 지원합니다.

- Wallet 생성 및 privateKey 암호화 저장
- TRC20 입금 감지
- DETECTED → CONFIRMED 상태 전이
- CONFIRMED 이후 파트너 콜백 전송
- Deposit Wallet → Hot Wallet Sweep
- 단순 Ledger 기반 잔액 조회
- Admin UI를 통한 기본 운영 조회

즉, **테스트넷 기준으로 전체 입금 흐름을 검증할 수 있는 MVP 수준**입니다.

---

### Operational principles

이 시스템은 다음 원칙을 기반으로 동작합니다.

- 동일 txHash는 중복 반영하지 않습니다.
- Confirmation 이전 입금은 잔액에 반영하지 않습니다.
- privateKey는 평문이 아닌 암호화된 형태로 저장됩니다.
- 모든 정산 데이터는 Partner 단위로 분리됩니다.
- 자금 집계는 상태 기반으로 통제됩니다.

---

### Phase 1 note

Phase1은 **구조 증명과 연동 검증을 위한 단계**입니다.

기본 입금 흐름과 운영 조회는 가능하지만, 운영 안정성 강화 항목은 아직 제한적입니다.

예를 들어 다음 항목은 Phase2에서 고도화 예정입니다.

- checkpoint 기반 watcher 복구
- queue 기반 callback 처리
- 고도화된 withdrawal state machine
- double-entry ledger
- KMS / Vault 기반 키 관리
- 운영 모니터링 및 알림 체계 강화

---
