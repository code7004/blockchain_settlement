# Operation Policy

> 현재 상태 기준 운영 정책
>
> Phase3에서는 운영 가능한 배포/로그/복구 기준을 수립하고, Phase4에서 자동화와 고도화를 진행한다.

---

## 1. Operating Scope

현재 운영 대상 구성:

- NestJS API
- Background Workers
- React Portal
- PostgreSQL
- TronGrid / Tron Node endpoint
- Hot Wallet
- Gas Tank Wallet

현재 worker:

```text
DepositWorker
ConfirmWorker
CallbackWorker
SweepWorker
ReclaimWorker
```

---

## 2. Environment Policy

환경은 Dev / Live를 분리한다.

Dev:

- Testnet / Nile 기준
- MockUSDT 또는 테스트 token
- 개발 DB
- 개발 API Key/JWT secret

Live:

- Mainnet 기준
- TRC20 USDT
- 운영 DB
- 운영 API Key/JWT secret
- 운영 Hot Wallet / Gas Tank

원칙:

- Dev token contract와 Live token contract를 혼용하지 않는다.
- Dev DB와 Live DB를 물리적으로 분리한다.
- Hot Wallet / Gas Tank는 환경별로 분리한다.
- 운영 서버에서 개발용 API Key 자동 주입을 금지한다.

보완 필요:

- ENV Guard
- chain/token mapping
- Admin Portal env 표시
- 배포 전 env checklist

---

## 3. Deployment Policy

현재 상태:

- Portal build/deploy script 일부 존재
- API PM2/restart 정책은 미정

Phase3 목표:

- API 실행 방식 표준화
- Worker 포함 실행 정책 명확화
- Portal build/deploy 절차 정리
- rollback 기준 정의

권장 배포 절차:

```text
1. 문서/코드 변경 확인
2. typecheck / lint / build
3. migration 필요 여부 확인
4. dev 배포
5. smoke test
6. live migration 수동 적용
7. live 배포
8. health check
9. worker log 확인
```

배포 전 체크:

- DATABASE_URL 환경 확인
- TRON_FULL_HOST 환경 확인
- TRON_USDT_CONTRACT 환경 확인
- HOT_WALLET_ADDRESS 환경 확인
- GAS_TANK_ADDRESS 환경 확인
- JWT_SECRET / WALLET_MASTER_KEY_BASE64 환경 확인

---

## 4. Worker Operation Policy

### 4.1 DepositWorker

역할:

- block polling
- TRC20 Transfer event 감지
- Deposit 생성

현재 cursor:

- `runtime/watcher-state.json`
- `USE_WATCHER_POLLING_CURSOR=true`일 때 사용

운영 주의:

- 파일 cursor는 배포/서버 이동 시 유실될 수 있다.
- Phase4에서 DB checkpoint로 전환한다.

### 4.2 ConfirmWorker

역할:

- Deposit DETECTED -> CONFIRMED
- CallbackLog 생성
- SweepJob 생성
- SweepLog BROADCASTED -> CONFIRMED / FAILED

운영 주의:

- Tron transaction info 조회 실패와 pending 상태를 구분한다.
- receipt 실패는 SweepLog FAILED로 남긴다.

### 4.3 CallbackWorker

역할:

- PENDING callback 전송
- HMAC signature 생성
- retry / FAILED 처리

운영 주의:

- partner endpoint 장애는 시스템 장애와 구분한다.
- 최대 시도 초과 후 수동 재시도 정책이 필요하다.

### 4.4 SweepWorker

역할:

- PENDING SweepJob 처리
- Deposit Wallet balance 확인
- TRX 부족 시 refill
- token transfer broadcast
- SweepLog BROADCASTED 생성

운영 주의:

- refill 중복 방지와 cooldown이 필요하다.
- Gas Tank 잔액 모니터링이 필요하다.

### 4.5 ReclaimWorker

역할:

- AssetsReclaimJob 처리
- Wallet token 회수
- Wallet TRX 회수

운영 주의:

- 성공 시 job 삭제 흐름이므로 audit 요구사항이 있으면 log 테이블이 필요하다.

---

## 5. Database Operation Policy

현재:

- Prisma migration history 존재
- dev/prod 분리 방향 확정

운영 원칙:

- 운영 migration은 수동 승인 후 적용한다.
- 운영 DB 직접 수정은 금지한다.
- prod DB 계정은 최소 권한을 사용한다.
- backup / snapshot 정책을 둔다.

Phase3 남은 작업:

- RDS 구축 여부 확정
- migration 적용 절차 검증
- rollback SQL 또는 restore 전략
- index 추가 정책

Phase4 목표:

- PITR
- restore test
- 대용량 테이블 archive
- query performance monitoring

---

## 6. Monitoring Policy

필수 지표:

- API health
- DB health
- latest block
- last scanned block
- block lag
- Deposit DETECTED count
- Deposit CONFIRMED count
- Callback FAILED count
- Sweep PENDING / BROADCASTED count
- Withdrawal FAILED count
- Gas Tank TRX balance
- Hot Wallet token/TRX balance

현재 상태:

- MonitorModule 초기 구조 존재
- Portal monitoring 일부 placeholder

Phase3 목표:

- txHash lifecycle 조회
- worker lag 조회
- callback/sweep 실패 조회

Phase4 목표:

- dashboard
- alert
- Slack 또는 운영 채널 연동

---

## 7. Incident Response Policy

장애 등급:

```text
P0: 자산 손실 가능성, 잘못된 출금, privateKey 노출
P1: 입금 감지/확정 중단, sweep 전체 중단, DB 장애
P2: callback 실패 증가, 특정 partner 장애, portal 조회 장애
P3: 문서/UX/비핵심 기능 장애
```

기본 대응:

- P0: 즉시 worker 중지, Hot Wallet/Gas Tank 상태 확인, 키 노출 여부 확인
- P1: worker log와 DB 상태 확인, 재시작/복구
- P2: 실패 queue/log 확인, partner 통지 여부 판단
- P3: 이슈 등록 후 정기 배포

기록해야 할 정보:

- 발생 시간
- env
- txHash
- partnerId
- depositId / withdrawalId / sweepLogId
- 영향 범위
- 조치 내용
- 재발 방지

---

## 8. Partner Communication Policy

파트너에게 알려야 하는 상황:

- callback 장기 실패
- 입금 confirmation 지연
- withdrawal 지연/실패
- 점검/배포로 인한 API 영향
- API Key 교체 필요

파트너에게 제공할 정보:

- txHash
- event type
- current status
- expected retry
- 필요한 partner action

제공 금지:

- 내부 privateKey
- raw API Key
- callbackSecret
- DB 내부 오류 전문

---

## 9. Restart & Recovery Policy

API restart 전:

- 진행 중 migration 여부 확인
- worker 처리 중인 job 상태 확인
- Deposit cursor 확인

API restart 후:

- health check
- worker start log 확인
- latest block / scanned block 확인
- callback retry 정상 여부 확인
- sweep pending 처리 여부 확인

현재 한계:

- Deposit cursor가 파일 기반이다.
- queue 시스템이 없다.
- PM2 policy가 미정이다.

Phase4에서 checkpoint / queue 기반 복구로 전환한다.
