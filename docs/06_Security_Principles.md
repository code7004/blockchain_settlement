# Security Principles (Phase 1)

## 1. Key Management

- privateKey 평문 저장 금지
- AES256 암호화 저장
- 환경변수 기반 master key 관리

## 2. Transaction Integrity

- txHash UNIQUE 필수
- Confirmation 이후만 잔액 반영
- 상태 전이 기반 처리

## 3. Idempotency

- txHash UNIQUE
- Withdrawal 상태 기반 전이 제한
- Callback eventType UNIQUE 설계 예정

## 4. Callback Security

- HMAC-SHA256 서명
- callbackSecret 파트너별 분리
- 재시도 최대 3회

## 5. Data Isolation

- Partner 간 데이터 완전 분리
- DB 계정 분리 (dev/prod)
- FK 강제

## 6. Logging Policy

- 상태 변경은 반드시 DB 기록
- 민감 정보 로그 출력 금지
