# Security Principles

> 현재 소스 기준 보안 원칙
>
> Phase3 기준으로 이미 적용된 최소 보안선과 운영 전 보완해야 할 보안 항목을 구분한다.

---

## 1. Security Baseline

본 프로젝트의 보안 기본 원칙:

- privateKey 평문 저장 금지
- API Key 원문 저장 금지
- Partner 데이터 격리
- Confirmation 이전 잔액 반영 금지
- txHash 기반 멱등성
- Callback HMAC 서명
- 민감 정보 로그 출력 금지
- Dev / Live 환경 혼용 방지

---

## 2. Key Management

현재 적용:

- Wallet privateKey는 AES-256 기반으로 암호화 저장한다.
- 복호화에는 `WALLET_MASTER_KEY_BASE64`를 사용한다.
- Hot Wallet privateKey와 Gas Tank privateKey는 env에서 읽는다.
- EnvService는 필수 env 누락 시 fail-fast 한다.

금지:

- privateKey 평문 DB 저장
- privateKey 로그 출력
- API 응답에 privateKey 포함
- callbackSecret 로그 출력
- API Key 원문 재조회 기능

보완 필요:

- KMS / Vault 도입
- privateKey 접근 audit log
- hot wallet key 접근 권한 분리
- env 파일 접근 통제
- 운영 키 rotation 정책

---

## 3. API Key Security

현재 적용:

- Partner API는 `x-api-key` 기반 인증을 사용한다.
- API Key 원문은 1회만 반환한다.
- DB에는 `apiKeyPrefix`, `apiKeyHash`만 저장한다.
- 인증 시 prefix 조회 후 bcrypt compare를 수행한다.

원칙:

- API Key 원문은 저장하지 않는다.
- API Key 재발급 시 이전 key 폐기 정책을 명확히 한다.
- Swagger 개발 편의값은 운영에서 사용하지 않는다.

보완 필요:

- API Key rotation audit
- API Key 사용 로그
- rate limit
- IP allowlist 또는 partner별 access policy

---

## 4. Portal Authentication

현재 적용:

- Portal은 JWT 인증을 사용한다.
- 인증 주체는 `Member`이다.
- 역할은 `OWNER`, `OPERATOR`, `DEVELOPER`로 구분한다.
- Portal route meta에 permissions가 존재한다.

보완 필요:

- 서버 API 레벨 역할 검증 일관화
- access token 만료/갱신 정책
- 로그인 실패 제한
- password policy
- audit log

---

## 5. Transaction Integrity

현재 적용:

- `Deposit.txHash @unique`
- `Withdrawal.txHash @unique`
- `CallbackLog.txHash @unique`
- `SweepLog.txHash @unique`
- `SweepJob.depositId @unique`
- Confirmation 이후 Deposit만 balance 반영
- Sweep은 BROADCASTED와 CONFIRMED를 분리

원칙:

- 동일 txHash는 중복 반영하지 않는다.
- 상태 전이는 역방향으로 허용하지 않는다.
- 체인 receipt 확인 전 terminal success로 처리하지 않는다.

보완 필요:

- 상태 전이 guard 코드 일관화
- double broadcast 방지
- nullable txHash unique 정책 검토
- chain reorg 대응

---

## 6. Callback Security

현재 적용:

- Callback은 HMAC-SHA256 서명을 사용한다.
- partner별 callbackSecret을 사용한다.
- CallbackLog에 requestBody와 requestSignature를 저장한다.
- 최대 시도 횟수는 현재 3회 기준이다.

원칙:

- callbackSecret은 파트너별로 분리한다.
- requestBody 기준 서명 검증이 가능해야 한다.
- 실패는 추적 가능한 상태로 남긴다.

보완 필요:

- timestamp / nonce 기반 replay 방지
- eventType unique 또는 idempotency key
- callback timeout 표준화
- DLQ
- partner callback endpoint allowlist

---

## 7. Data Isolation

현재 적용:

- Partner가 정산 데이터의 최상위 기준이다.
- User는 Partner에 종속된다.
- Wallet / Deposit / Withdrawal / Callback / SweepLog는 Partner 추적이 가능하다.
- Partner API는 인증된 partnerId 기준으로 데이터를 제한해야 한다.

원칙:

- Partner 간 데이터 조회는 절대 섞이면 안 된다.
- Admin Portal 조회와 Partner API 조회 조건은 분리한다.
- Partner 삭제보다 비활성화를 우선한다.

보완 필요:

- 모든 Partner API repository query의 partnerId 조건 점검
- 테스트 케이스 추가
- 운영 DB 계정 권한 최소화

---

## 8. Environment Safety

현재 적용:

- EnvService로 주요 env를 관리한다.
- Tron host, token contract, hot wallet, gas tank, JWT secret, DB URL을 env에서 읽는다.

보완 필요:

- `NODE_ENV`, chain, token contract 강제 매핑
- Dev / Live env lock
- Mainnet/Testnet endpoint 혼용 방지
- Admin UI에 현재 env 표시
- 로그에 env 포함
- 운영에서 DEV_API_KEY 자동 주입 금지

---

## 9. Logging Policy

원칙:

- 민감 정보는 로그에 남기지 않는다.
- txHash, depositId, sweepLogId 등 추적 가능한 식별자는 남긴다.
- error는 구조화해서 원인 추적이 가능해야 한다.
- 상태 변경은 DB 로그 또는 상태 테이블에 남긴다.

민감 정보:

- privateKey
- WALLET_MASTER_KEY_BASE64
- HOT_WALLET_PRIVATE_KEY
- GAS_TANK_PRIVATE_KEY
- JWT_SECRET
- raw API Key
- callbackSecret

보완 필요:

- redaction 유틸
- audit log 테이블
- key access log
- callback body 내 민감정보 검토

---

## 10. Security Roadmap

Phase3:

- 상태 전이 guard
- env safety guard
- gas refill 중복 방지
- txHash lifecycle log
- DB 접근 제한 정책

Phase4:

- KMS / Vault
- RBAC 고도화
- audit log
- rate limit
- callback replay 방지
- monitoring / alert
