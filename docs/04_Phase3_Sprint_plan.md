# 🚀 Phase3 — Production Environment Setup

## 🎯 목표

- Live / Dev 환경 완전 분리
- 실제 운영 가능한 안정적인 인프라 구축
- Admin Portal에서 환경 선택 기반 운영 지원

---

## Step 1. Infrastructure

- [ ] Live Server 구축 (Mainnet + USDT)
- [ ] Dev Server 구축 (Nile + mUSDT)
- [ ] CloudFront (Live Admin UI)
- [ ] Domain 및 HTTPS 구성
- [ ] CORS 정책 확정

---

## Step2. Environment & Security

- [ ] ENV 분리 (dev / prod)
- [ ] CHAIN 고정 및 검증 로직 추가
- [ ] Token ↔ Chain 매칭 검증
- [ ] Secret 분리 (JWT / PrivateKey / API Key)
- [ ] GAS_TANK 환경별 분리

---

## Step3. Database

- [ ] dev_db / prod_db 분리 운영 확인
- [ ] Prisma schema 동기화 전략 정의
- [ ] Migration 정책 수립 (manual or script)
- [ ] prod DB 접근 제한 (보안 설정)

---

## Step4. Backend

- [ ] sweep log 테이블 or 로깅 구현
- [ ] error/event log 시스템 구축
- [ ] worker 상태 로그 강화
- [ ] health check endpoint 추가

---

## Step5. Admin Portal

- [ ] Environment 선택 드롭다운 (TEST / PROD)
- [ ] API baseURL 동적 변경
- [ ] ENV 시각적 표시 (색상 / 배너)
- [ ] PROD 액션 confirm UI
- [ ] Token 자동 필터링

---

## Step6. Dev Portal / Guide

- [ ] DevConsole ENV 선택 기능 추가
- [ ] mUSDT / USDT 테스트 가능
- [ ] 문서 업데이트 (환경 선택 설명)
- [ ] Callback retry 가이드 포함

---

## Step7. Monitoring & Logging

- [ ] 서버 로그 구조 정리 (error / event)
- [ ] 트랜잭션 로그 기록
- [ ] watcher 상태 로깅
- [ ] block lag 확인 로그

---

## Step8. Deployment

- [ ] 서버 실행 구조 정리 (PM2 or Docker)
- [ ] 배포 스크립트 작성
- [ ] restart 전략 정의
- [ ] 로그 파일 관리 정책

---

## Step9. Safety

- [ ] test ↔ prod 환경 혼용 방지 로직
- [ ] 잘못된 chain 요청 차단
- [ ] 잘못된 token 요청 차단
- [ ] Chain/Token 강제 매핑
- [ ] ENV Guard (서버)
- [ ] EnvService 통합
- [ ] Endpoint 분리
- [ ] Admin ENV Lock
- [ ] Key / JWT 분리
- [ ] DB 접근 제한
- [ ] HealthCheck 강화
- [ ] UI ENV 표시
- [ ] 로그 ENV 포함

---

## Step10. Database Strategy

- [ ] dev DB (EC2 PostgreSQL) 구축
- [ ] prod DB (RDS PostgreSQL) 구축
- [ ] dev / prod DB 물리적 분리 확인
- [ ] DB 계정 및 권한 환경별 분리
- [ ] RDS 보안 설정 (Private Subnet / SG 제한)
- [ ] prod DB 외부 직접 접근 차단
- [ ] Prisma env 분리 (DATABASE_URL_DEV / PROD)
- [ ] migration 정책 수립 (dev → prod 수동 반영)
- [ ] migration 적용 프로세스 검증
- [ ] RDS 자동 백업 활성화
- [ ] snapshot 및 복구 테스트
- [ ] DB 연결 HealthCheck 구성
- [ ] DB 장애 대응 전략 정의

※ prod DB는 안정성을 위해 RDS 사용, dev는 비용 절감을 위해 EC2 유지

### RDS선택 이유

1. 운영 부담 제거(장애복구 자동화)
1. 백업, 복구 기본 제공 및 특정시점 복구 가능 (PITR)
1. 고가용성, 장애발생시 자동 failover, 다운타임 최소화
1. 보안
1. 성능 튜닝 자동화 (storage auto scaling, IOPS 관리, 성능 인사이트 제공)
1. 1인 개발 환경에서 현실적 장애 대응
1. 비용관점 EC2 + Postgre 보다 1.5~ 2배 비용 증가 하지만 예측 비용 (약 100USD / M)

---

# 🧪 완료 기준

- Dev / Live 각각 독립적으로 정상 동작
- Deposit → Confirm → Callback → Sweep 정상 흐름
- Admin Portal에서 환경 전환 가능
- 실제 Mainnet 트랜잭션 정상 처리
- 장애 발생 시 로그 기반 추적 가능

---

# 🧠 핵심 요약

```
Phase2는 기능 개발이 아니라

"운영 가능한 시스템을 만드는 단계"

핵심은
- 환경 분리
- 안전성
- 로그
- 배포 구조
```
