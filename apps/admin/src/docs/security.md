# Security

## Overview

본 시스템은 블록체인 자산을 다루기 때문에

데이터 무결성과 인증, 키 보호를 최우선으로 설계되었습니다.

보안은 다음 3가지 영역을 중심으로 구성됩니다:

- API 인증
- Callback 검증
- Key 및 데이터 보호

---

## 1. API Authentication

모든 API 요청은 API Key 기반으로 인증됩니다.

### Header

```
Authorization: Bearer {API_KEY}
```

---

### 규칙

- API Key는 파트너 단위로 발급됩니다.
- 인증 실패 시 요청은 거부됩니다.
- API Key는 외부에 노출되지 않도록 관리해야 합니다.

---

## 2. Callback Security (HMAC)

Callback 요청은 위변조 방지를 위해 HMAC 서명을 포함합니다.

---

### Header

```
X-Signature: {HMAC_SIGNATURE}
```

---

### Signature 생성 방식

```
HMAC_SHA256(secret, requestBody)
```

---

### 검증 절차

1. 요청 body를 그대로 사용
2. partner secret으로 HMAC 생성
3. Header의 서명과 비교

---

### 검증 실패 시

- 요청을 무시해야 합니다
- 200 OK를 반환하지 않아야 합니다

---

## 3. Idempotency (중복 방지)

시스템은 동일 트랜잭션의 중복 처리를 방지합니다.

---

### 기준

```
txHash = unique
```

---

### 동작

- 동일 txHash는 한 번만 처리됩니다.
- 중복 요청은 무시됩니다.

---

## 4. Confirmation Rule

입금은 즉시 확정되지 않습니다.

---

### 규칙

```
DETECTED → CONFIRMED 이후 반영
```

---

### 이유

- 블록체인 reorg 대응
- 잘못된 트랜잭션 방지
- 데이터 정합성 유지

---

## 5. Key Management

Wallet의 privateKey는 다음 방식으로 보호됩니다.

---

### 원칙

- privateKey는 평문으로 저장되지 않습니다
- 암호화된 형태로 저장됩니다
- 외부 API로 제공되지 않습니다

---

### 운영 기준

- 키 접근은 최소 권한으로 제한됩니다
- 키는 서버 내부에서만 사용됩니다

---

## 6. Data Isolation

모든 데이터는 Partner 단위로 분리됩니다.

---

### 보장 사항

- 다른 Partner의 데이터 접근 불가
- 모든 요청은 Partner 기준으로 필터링
- Wallet / Deposit / Withdrawal 모두 동일 적용

---

## 7. Transport Security

모든 통신은 HTTPS를 사용해야 합니다.

---

### 규칙

- HTTP 요청은 허용되지 않습니다
- Callback endpoint 또한 HTTPS를 권장합니다

---

## 8. Callback Reliability

Callback은 안정적인 전달을 위해 재시도 정책을 가집니다.

---

### 동작

- 실패 시 재시도 수행
- 일정 횟수 이후 중단

---

### 파트너 요구사항

- 반드시 200 OK 응답
- 처리 실패 시 재시도 고려

---

## 9. Sensitive Data Handling

다음 정보는 외부에 노출되지 않습니다:

- privateKey 및 암호화 데이터
- 내부 시스템 상태값
- callback 내부 로그
- 보안 관련 내부 설정

---

## 10. Best Practices (Partner)

파트너는 다음을 준수해야 합니다.

---

### 필수

- API Key 안전하게 보관
- Callback HMAC 검증 구현
- HTTPS endpoint 사용

---

### 권장

- Callback 재처리 로직 구현
- 중복 이벤트 처리 대비
- 로그 및 감사 기록 유지

---

## Summary

- API는 API Key로 보호됩니다
- Callback은 HMAC으로 검증됩니다
- 입금은 Confirmation 이후 확정됩니다
- privateKey는 외부에 노출되지 않습니다
- 모든 데이터는 Partner 단위로 분리됩니다
