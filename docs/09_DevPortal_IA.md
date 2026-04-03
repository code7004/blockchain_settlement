# Admin 전체 IA

## 1. 최상위 구조

```
Login

Main
├─ Dashboard
├─ Partners
├─ Users
├─ Wallets
├─ Deposits
├─ Withdrawals
├─ Balances
├─ Callbacks
├─ Blockchain
│  ├─ THOT Wallet
│  └─ Watcher Status
├─ Documents
│  ├─ Swagger
│  └─ API Documents
└─ System
   ├─ Error Reports
   ├─ Monitoring
   └─ Audit Logs
```

이 구조가 맞는 이유는,

데이터의 핵심 축이 Partner / User / Wallet / Deposit / Withdrawal / Balance 이고, 운영 축이 Callback / Watcher / THOT / Monitoring 이기 때문이다.

DB 구조상 Partner → User → Wallet → Deposit/Withdrawal 관계가 중심이며 03_Database_Schema

아키텍처 문서에서도 Wallet, Deposit Watcher, Withdrawal, Callback, Ledger, Admin 이 내부 모듈로 분리되어 있다 02_Architecture

---

# 2. 메뉴별 상세 IA

## 2-1. Login

### 목적

운영자 인증 진입점

### 화면

- Login Page
- 로그인 실패 안내
- 로그아웃

### 최소 기능

- 아이디 / 비밀번호 입력
- 세션 저장
- 권한별 메뉴 노출 제어

### 비고

문서상 RBAC는 Phase2 강화 예정이지만, Phase1도 최소한 로그인과 권한 분리는 두는 편이 좋다 04_Sprint_Plan

---

## 2-2. Member

### 하위 화면

- Partner List
- Partner Detail
- Partner Create
- Partner Edit

### 주요 액션

- Member 생성
- Member 생성시 apiKey 화면에 알림
- 활성/비활성 변경

---

## 2-3. MyPage

### 하위 화면

- Password 변경 Modal
- ApiKey 재발급 Modal

### 주요 액션

- 화면 최상단 username 클릭시 팝업 형태로 하위매뉴 표현(Modal)

---

## 2-4. Dashboard

### 목적

운영자가 첫 화면에서 전체 상태를 빠르게 파악

### 카드 영역

- 총 Partner 수
- 총 User 수
- 활성 Wallet 수
- 오늘 감지된 Deposit 수
- 오늘 Confirmed Deposit 수
- 오늘 Withdrawal 수
- Callback 실패 건수
- Watcher block lag

### 테이블 / 위젯

- 최근 Deposit 10건
- 최근 Withdrawal 10건
- 최근 Callback 실패 10건
- 시스템 알림

### 핵심 지표 근거

Confirmation 이후만 잔액 반영, Callback 실패율, 출금 실패율 모니터링이 운영 핵심이다 06_Security_Principles

07_Operation_Policy

---

## 2-5. Partners

### 하위 화면

- Partner List
- Partner Detail
- Partner Create
- Partner Edit

### List 컬럼

- id
- name
- callbackUrl
- isActive
- createdAt

### Detail 탭

- 기본 정보
- 소속 Users
- 최근 Deposits
- 최근 Withdrawals
- 최근 Callback Logs
- Balance Snapshot

### 주요 액션

- 파트너 생성
- 활성/비활성 변경
- callbackUrl 수정
- callbackSecret 교체

### 이유

partners 테이블은 callbackUrl, callbackSecret, isActive를 핵심 필드로 가진다 03_Database_Schema

---

## 2-6. Users

### 하위 화면

- User List
- User Detail
- User Create
- User Edit

### List 컬럼

- id
- partnerId
- externalUserId
- isActive
- createdAt

### Detail 탭

- 기본 정보
- Wallet 목록
- Deposit 내역
- Withdrawal 내역
- Balance 요약

### 필터

- partnerId
- externalUserId
- isActive

### 이유

User는 독립 개체가 아니라 Partner 소속이며, 운영상 Partner 기준 필터가 매우 중요하다 03_Database_Schema

---

## 2-7. Wallets

### 하위 화면

- Wallet List
- Wallet Detail

### List 컬럼

- id
- partnerId
- userId
- address
- status
- createdAt

### Detail 탭

- 기본 정보
- 해당 주소 잔액 조회
- 관련 Deposits
- 관련 Withdrawals

### 주요 액션

- 체인 잔액 조회
- 상태 변경(ACTIVE / SUSPENDED)

### 이유

Wallet은 입금 식별의 기준 주소이며 status 관리가 필요하다 03_Database_Schema

또한 Admin 구조 예시에도 WalletList가 포함되어 있다 02_Architecture

---

## 2-8. Deposits

### 하위 화면

- Deposit List
- Deposit Detail

### List 컬럼

- id
- partnerId
- userId
- walletId
- tokenSymbol
- txHash
- fromAddress
- toAddress
- amount
- blockNumber
- status
- detectedAt
- confirmedAt

### 필터

- partnerId
- userId
- walletId
- tokenSymbol
- txHash
- status(DETECTED / CONFIRMED)
- blockNumber range
- date range

### Detail 탭

- 기본 정보
- 상태 전이 이력
- 관련 Callback Logs
- 체인 링크
- 원본 tx 정보

### 이유

Deposit는 DETECTED → CONFIRMED 상태 전이의 중심이며, Confirmation 이후만 반영된다 03_Database_Schema

03_Database_Schema

---

## 2-9. Withdrawals

### 하위 화면

- Withdrawal List
- Withdrawal Detail
- Approval Queue

### List 컬럼

- id
- partnerId
- userId
- walletId
- tokenSymbol
- toAddress
- amount
- txHash
- blockNumber
- status
- failReason
- requestedAt
- approvedAt
- broadcastedAt

### 필터

- partnerId
- userId
- status
- txHash
- date range

### Approval Queue

- REQUESTED 목록
- 승인 버튼
- 반려 버튼
- 승인자 / 승인시각 기록

### Detail 액션

- 승인
- 실패 사유 확인
- 브로드캐스트 결과 확인

### 이유

출금은 REQUESTED → APPROVED → BROADCASTED 전이를 강제하는 구조다 03_Database_Schema

운영 UI에서 가장 중요한 수동 통제 지점 중 하나다.

---

## 2-10. Balances

### 하위 화면

- Balance Overview
- Partner Balance
- User Balance
- Settlement Snapshot

### 표시 항목

- partnerId
- userId
- tokenSymbol
- confirmedDepositSum
- broadcastedWithdrawalSum
- calculatedBalance
- asOf

### 근거 공식

Phase1 balance는 다음 규칙이다:

`sum(CONFIRMED deposits) - sum(BROADCASTED withdrawals)` 03_Database_Schema

### Snapshot 화면 컬럼

- id
- partnerId
- tokenSymbol
- balance
- asOf
- createdAt

### 이유

단순 조회용 잔액과 스냅샷 기준 시점 확인은 분리하는 것이 운영상 좋다.

---

## 2-11. Callbacks

### 하위 화면

- Callback Log List
- Callback Log Detail
- Callback Failure Queue

### List 컬럼

- id
- partnerId
- depositId
- eventType
- callbackUrl
- attemptCount
- maxAttempts
- lastStatusCode
- status
- lastAttemptAt
- createdAt

### Detail 탭

- requestBody
- requestSignature
- 응답 코드 이력
- 재시도 결과

### 필터

- partnerId
- depositId
- status(PENDING / SUCCESS / FAILED)
- eventType
- date range

### 이유

Callback은 HMAC-SHA256 서명과 최대 3회 재시도가 핵심이며 로그 저장이 필수다 06_Security_Principles

03_Database_Schema

운영자는 실패 건을 반드시 추적할 수 있어야 한다.

---

## 2-12. Blockchain

### 2-12-1. THOT Wallet

문서상 Hot Wallet은 실제 자산을 관리하는 중앙 지갑이며 출금 송신 주체다 02_Architecture

#### 화면

- THOT 정보
- THOT 잔액
- THOT 주소 변경
- THOT 상태 확인

#### 표시 항목

- wallet address
- token balances
- trx balance
- last checked at

#### 액션

- 잔액 새로고침
- 주소 수정
- 활성 상태 표시

### 2-12-2. Watcher Status

DepositWatcher는 블록을 스캔하여 입금을 감지하는 백그라운드 작업이다 02_Architecture

#### 표시 항목

- running 여부
- lastScannedBlock
- latestBlock
- block lag
- last scan time
- 최근 에러

#### 이유

이 화면이 없으면 DETECTED 미생성 원인을 운영자가 판단하기 어렵다.

---

## 2-13. Documents

### 2-13-1. Swagger

- iFrame 또는 새 탭
- `/api` 연결

### 2-13-2. API Documents

- 프로젝트 개요
- DB 스키마
- 보안 원칙
- 운영 정책
- 스프린트 문서 링크

### 이유

README에도 Swagger와 문서 연결이 명시되어 있다 ReadMe

---

## 2-14. System

### 2-14-1. Error Reports

- API 에러 로그
- Prisma 에러 매핑 결과
- 최근 500 에러
- 최근 callback 실패 에러

기술 규약상 Prisma 에러는 중앙 매핑 규칙을 따르므로 운영 화면에서도 유형별 분류가 가능하면 좋다 05_Technical_Conventions

### 2-14-2. Monitoring

- API status
- DB status
- watcher status
- callback failure rate
- withdrawal failure rate
- response time

운영 정책 문서에서도 모니터링과 알림 기준이 핵심 축으로 잡혀 있다 07_Operation_Policy

### 2-14-3. Audit Logs

- 로그인 기록
- 출금 승인 기록
- THOT 수정 기록
- 파트너 설정 수정 기록

보안 원칙상 상태 변경은 반드시 DB 기록이어야 하므로 Admin 변경 이력도 남기는 편이 맞다 06_Security_Principles

---

# 3. 권한 기준 IA

Phase1 최소 기준으로는 아래 정도면 충분하다.

## Owner

- 모든 메뉴 접근 가능
- THOT 수정 가능
- 출금 승인 가능
- 파트너 설정 수정 가능

## Operator

- 조회 가능
- 출금 승인 가능
- THOT 수정 불가
- 보안 설정 수정 불가

## Developer

- 조회 전용
- Swagger / Docs 열람 가능
- 승인 / 수정 불가
