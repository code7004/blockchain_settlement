# CheckList

## ✅ Day5 Checklist

- [x] Confirmation 설계
- [x] CONFIRMATION_COUNT 상수화
- [x] DETECTED → CONFIRMED 전환 로직
- [x] HMAC-SHA256 구현
- [x] CallbackService 작성
- [x] callback_logs 테이블 저장
- [x] 3회 retry 로직
- [x] Prisma 에러 매핑 적용
- [x] 테스트 시나리오 작성

Day5는 **입금 감지 이후의 후속 파이프라인**을 붙이는 작업이다.

문서 기준으로 핵심은 다음 2개다.

1. `Deposit.status = DETECTED` 인 row를 블록 기준으로 `CONFIRMED` 로 전환
2. `CONFIRMED` 직후에만 파트너 콜백을 HMAC 서명과 함께 전송

이 흐름은 아키텍처 문서의 `DepositWatcher → ConfirmService → CallbackService` 분리 원칙과 일치하고, Confirmation 이후만 잔액 반영/후속 처리한다는 규칙도 그대로 따른다. 02_Architecture

03_Database_Schema

또한 운영 숫자는 상수화하고 Prisma 예외는 `mapPrismaError(error: unknown)` 로 중앙 처리해야 한다.

## ✅ Day4 Deposit Watcher Checklist

- [x] Deposit Watcher 구조 설계
- [x] Tron block polling 구현
- [x] TRC20 transfer 필터링
- [x] Wallet address 매칭
- [x] txHash 멱등성 처리
- [x] deposits 테이블 DETECTED 저장
- [x] 중복 tx 저장 방지
- [x] 테스트 시나리오 작성

## ✅ Day3 Checklist

- [x] `WALLET_MASTER_KEY`(환경변수) 세팅 + 로컬 실행 확인
- [x] `core/crypto/aes256.ts` (AES-256-GCM) 구현 + 단위 테스트(간단)로 검증
- [x] `infra/tron` 모듈 구성 (Tron 접근은 infra에서만) 02_Architecture
- [x] `TronService.createAccount()` 구현 (privateKey 로그/응답 노출 금지)
- [x] Prisma `Wallet` 스키마 반영 (address UNIQUE, status 기본 ACTIVE) 03_Database_Schema
- [x] `domains/wallet` 생성 API 구현 (User 종속, Transaction boundary는 Service) 02_Architecture
- [x] DB에 `encryptedPrivateKey` 저장 및 평문 저장/노출 없음 확인 06_Security_Principles
- [x] Swagger에서 `POST /wallets` 호출로 end-to-end 확인 04_Sprint_Plan

## ✅ Day2 Partner / User 도메인

- [x] Partner / User 테이블 설계 검토
- [x] Prisma schema 수정
- [x] FK 및 복합 UNIQUE 설정 확인
- [x] partnerId 인덱스 적용
- [x] createdAt / updatedAt 자동 처리 설정
- [x] Prisma migrate 실행
- [x] Partner 도메인 생성 (module / service / controller / dto)
- [x] User 도메인 생성 (Partner 종속 구조 강제)
- [x] Swagger 정상 동작 확인
- [x] Vite + React + tailwind 세팅
- [x] Admin에서 목록 조회 가능 상태 확인

## ✅ Day1 Project Booting

- [x] Monorepo 구조 생성
- [x] NestJS API 부팅
- [x] PostgreSQL 연결
- [x] Prisma migrate 성공
- [x] Swagger 접속 가능
- [x] health endpoint 정상
