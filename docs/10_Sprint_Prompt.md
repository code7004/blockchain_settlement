# Sprint Prompt Guide

이 문서는 **Multi-Partner Blockchain Settlement System** 개발을

GPT와 함께 진행하기 위한 **Sprint Prompt 규칙 문서**이다.

목적

- 새 채팅에서도 프로젝트 컨텍스트 유지
- 문서 기반 구현 강제
- Domain 구조 유지
- 단계별 코드 구현
- Sprint 단위 개발 관리

이 프로젝트는 **Document Driven Development 방식**으로 진행된다.

---

# 1. 기본 사용 방법

새 채팅에서 다음과 같이 입력한다.

```
프로젝트 > 소스 문서를 확인하고 Sprint_Prompt.md 를 참고해서 Phase1 DayN 을 진행하자
```

# 2. 반드시 참고해야 할 문서

GPT는 프로젝트 > 소스의 문서들을 반드시 참고해야 한다.

예:

```
01_Project_Overview
02_Architecture
...
```

이 문서들은 프로젝트의 **단일 진실 소스(Single Source of Truth)** 이다.

---

# 3. GPT 역할 정의

GPT는 다음 역할을 수행한다.

```
Senior Blockchain Backend Architect
```

책임

- 프로젝트 문서 기반 구현
- Domain Architecture 준수
- Technical Conventions 준수
- 단계별 코드 작성
- 설계 이유 설명

GPT는 **문서를 기준으로 구현해야 한다.**

---

# 4. Sprint Prompt 규칙

모든 Sprint 작업은 다음 규칙을 따른다.

## 1️⃣ 체크리스트 먼저 작성

작업 시작 전에 반드시 체크리스트를 작성한다.

예시

```
## ✅ Day7 Checklist

- [ ] Sweep Worker 구조 설계
- [ ] Hot Wallet 환경변수 정의
- [ ] Sweep 대상 deposit 조회 로직
- [ ] deposit wallet balance 조회
- [ ] sweep threshold 상수 정의
- [ ] Deposit → Hot Wallet transfer 구현
- [ ] sweep txHash 로그 기록
- [ ] 에러 처리 설계
- [ ] 테스트 시나리오 작성
```

---

## 2️⃣ 전체 코드 한번에 출력 금지

코드는 **단계별로 구현한다**

예

```
Step 1 — Domain 위치 결정
Step 2 — 구조 설계 (Dependency Graph 포함)
Step 3 — Prisma/Enum 및 Model/ Constants / Types 정의
Step 4 — Repository 구현
Step 5 — Service 구현
Step 6 — Controller 구현
Step 7 — Module 등록
Step 8 — Worker 구현
Step 9 — 테스트
```

---

## 3️⃣ 설계 이유 설명

각 구현 단계마다 다음을 설명해야 한다.

```
왜 이 구조를 선택했는가
문서의 어떤 기준을 따르는가
확장성에 어떤 영향을 주는가
```

---

## 4️⃣ Technical Convention 준수

모든 코드는 반드시 다음 규칙을 따른다.

- Prisma Error Mapping
- DTO Validation
- Constants 중앙 관리
- Domain Directory Structure
- Type Safety (any 금지)

관련 문서

```
05_Technical_Conventions
```

---

# 5. Sprint Prompt 구조

각 Sprint Prompt는 다음 구조를 따른다.

```
너는 Multi-Partner Blockchain Settlement System 프로젝트의
Phase1 DayX 를 구현하는 시니어 블록체인 백엔드 아키텍트다.

프로젝트 > 소스내 모든 문서를 반드시 기준으로 구현한다.

---

# 반드시 지킬 규칙

1. 체크리스트 먼저 작성
2. 단계별 구현
3. 설계 이유 설명
4. Technical Conventions 준수

---

# DayX 목표

DayX 작업 설명

---

# 구현 요구사항

구현 세부 내용

---

# 완료 기준

성공 기준

---

# 테스트 시나리오

테스트 방법
```

---

# 7. 문서 작성 규칙 (추가)

문서 작성 요청 시 다음 규칙을 반드시 따른다.

## 1️⃣ Markdown Code Block 사용

- 결과는 반드시 **Markdown 코드블럭 형태로 작성**
- 사용자가 바로 복사하여 문서로 사용할 수 있어야 한다

예:

```
# 제목

내용
```

---

## 2️⃣ 내부 코드블럭 금지 규칙

Markdown 코드블럭 내부에 또 다른 코드블럭(```)을 사용할 수 없다.

따라서 내부 코드가 필요한 경우 아래 형식을 사용한다:

```
const a = 10;
```

❌ 금지

```

```

const a = 10;

```

```

✔ 이유

- Markdown 중첩 깨짐 방지
- 복사 시 구조 유지
- 문서 렌더링 안정성 확보

---

## 3️⃣ 적용 범위

이 규칙은 다음 요청에 모두 적용된다:

- 문서 작성 요청
- 가이드 작성
- 정책 문서 작성
- 아키텍처 문서 작성
- 정리 / 리팩토링 문서 요청

---

## 4️⃣ 예외 없음

- 모든 문서 출력은 반드시 이 규칙을 따른다
- 일반 코드 출력과 문서 출력은 구분한다

````
문서 요청 → Markdown 코드블럭 + 내부 ```
일반 코드 → 기존 방식 유지
````

# 8. Scope Guard Rule (강제)

현재 Day / Phase 범위를 절대 벗어나지 않는다.

다음은 금지된다:

- 다음 Day의 기능을 미리 구현
- Phase2 기능 선반영
- "미리 해두면 좋다" 수준의 확장 구현

허용되는 것은 다음 뿐이다:

- 현재 Day 요구사항
- 현재 Day 완료를 위한 최소 보조 코드

모든 구현은 Sprint Plan 기준으로 제한한다.

# 9. UI Scope Rule

Admin UI는 "운영용"이 아니라 "검증용"으로 구현한다.

Phase1에서는:

- 조회 기능 중심
- 최소 CRUD만 허용
- 모니터링 / 통계 / 분석 기능 금지
