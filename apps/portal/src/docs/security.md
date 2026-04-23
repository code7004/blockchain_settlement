# Security

## Overview

이 문서는 파트너/포털 개발자가 알아야 하는 보안 규칙을 설명합니다.

보안상 내부 privateKey, master key, 서버 배포 정보, 운영 지갑 privateKey는 공개하지 않습니다.

---

## 1. Partner API Authentication

Partner API는 API Key로 인증합니다.

Header:

```http
x-api-key: {PARTNER_API_KEY}
```

규칙:

- API Key는 Partner 단위로 발급됩니다.
- API Key 원문은 최초 발급 시에만 확인 가능합니다.
- API Key는 서버 환경변수 또는 secret manager에 보관하세요.
- 클라이언트 브라우저, 모바일 앱, public repository에 저장하면 안 됩니다.

유출 시:

- 즉시 운영자에게 API Key rotate를 요청하세요.
- 유출 가능성이 있는 기간의 API 호출 로그를 점검하세요.

---

## 2. Portal Authentication

Portal은 JWT 인증을 사용합니다.

Header:

```http
Authorization: Bearer {JWT}
```

권한:

```text
OWNER
OPERATOR
DEVELOPER
```

구분:

- Partner 서버 연동: `x-api-key`
- Portal 화면 접근: JWT

두 인증 방식을 혼동하면 안 됩니다.

---

## 3. Callback HMAC Verification

입금 확정 callback은 HMAC signature를 포함합니다.

Header:

```http
X-Signature: {HMAC_SHA256_SIGNATURE}
```

생성 개념:

```text
HMAC_SHA256(callbackSecret, rawRequestBody)
```

파트너 서버 검증 절차:

1. callback request raw body를 확보합니다.
2. partner callbackSecret으로 HMAC-SHA256을 계산합니다.
3. 계산한 값과 `X-Signature`를 비교합니다.
4. 일치하지 않으면 처리하지 않습니다.

주의:

- raw body 기준 검증을 권장합니다.
- JSON을 다시 stringify하면 공백/순서 차이로 서명이 달라질 수 있습니다.
- callbackSecret은 로그에 남기지 마세요.

---

## 4. Callback Idempotency

Callback은 네트워크 오류 또는 파트너 서버 오류로 재시도될 수 있습니다.

파트너 서버는 반드시 멱등 처리해야 합니다.

권장 key:

```text
txHash
callbackId
```

처리 예:

```text
1. txHash가 이미 처리되었는지 확인
2. 처리되지 않았다면 잔액 반영
3. 처리 완료 기록 저장
4. 2xx 응답 반환
```

중요:

- 같은 callback을 두 번 받아도 잔액은 한 번만 반영해야 합니다.
- callback 처리 중 내부 오류가 발생하면 2xx를 반환하지 않는 것이 안전합니다.

---

## 5. Confirmation Rule

입금은 즉시 확정되지 않습니다.

상태:

```text
DETECTED -> CONFIRMED
```

규칙:

- DETECTED는 체인 이벤트 감지 상태입니다.
- CONFIRMED는 지정 confirmation 수를 만족한 상태입니다.
- 파트너 서비스 잔액 반영은 CONFIRMED 이후에만 수행하세요.

이유:

- chain reorg 가능성
- 잘못된 선반영 방지
- 정산 정합성 유지

---

## 6. Data Isolation

모든 데이터는 Partner 단위로 분리됩니다.

Partner API 요청은 API Key 기준 Partner로 제한됩니다.

파트너 개발자는 다음을 가정할 수 있습니다.

- 자신의 API Key로 다른 Partner 데이터에 접근할 수 없습니다.
- User의 `externalUserId` unique 범위는 자신의 Partner 안입니다.
- Wallet / Deposit / Callback 조회는 자신의 Partner 범위로 제한됩니다.

---

## 7. Key & Wallet Safety

시스템은 Wallet privateKey를 외부에 제공하지 않습니다.

파트너에게 제공되는 값:

- Deposit Wallet address
- txHash
- callback payload
- API response data

제공되지 않는 값:

- privateKey
- encryptedPrivateKey
- master key
- Hot Wallet privateKey
- Gas Tank privateKey
- callbackSecret 재조회 값
- raw API Key 재조회 값

Partner가 관리해야 하는 secret:

- Partner API Key
- callbackSecret

---

## 8. Transport Security

권장:

- API 호출은 HTTPS를 사용하세요.
- callbackUrl도 HTTPS endpoint를 사용하세요.
- HTTP endpoint는 테스트 환경에서만 제한적으로 사용하세요.

운영 환경:

- public callback endpoint는 TLS를 적용해야 합니다.
- self-signed 인증서는 운영에서 사용하지 않는 것을 권장합니다.

---

## 9. Logging Rules for Partners

로그에 남겨도 되는 값:

- txHash
- callbackId
- externalUserId
- depositId
- status
- amount
- tokenSymbol

로그에 남기면 안 되는 값:

- API Key 원문
- callbackSecret
- Authorization token
- privateKey
- 개인식별정보 전체 원문

권장:

- callback 처리 결과를 audit log로 남기세요.
- txHash 기준으로 중복 처리 여부를 기록하세요.

---

## 10. Common Security Mistakes

피해야 할 실수:

- 브라우저 프론트엔드에서 Partner API Key 직접 호출
- callback HMAC 검증 생략
- DETECTED 상태에서 잔액 확정 처리
- callback 중복 수신 시 잔액 중복 반영
- API Key를 Git repository에 커밋
- callbackSecret을 로그에 출력
- 테스트넷 token과 운영 token 혼용

---

## 11. Partner Integration Checklist

- API Key를 서버에서만 사용한다.
- callbackSecret을 안전하게 보관한다.
- callback raw body 기반 HMAC 검증을 구현했다.
- txHash/callbackId 멱등 처리를 구현했다.
- CONFIRMED callback 이후 잔액을 반영한다.
- callback endpoint는 HTTPS를 사용한다.
- secret 값은 로그에 남기지 않는다.
- API Key 유출 시 rotate 절차를 준비했다.

---

## 12. Summary

- Partner API 인증은 `x-api-key`입니다.
- Portal 인증은 JWT입니다.
- callback은 HMAC으로 검증해야 합니다.
- callback은 중복 수신될 수 있습니다.
- privateKey는 외부에 제공되지 않습니다.
- CONFIRMED 이후에만 입금을 확정 처리하세요.
