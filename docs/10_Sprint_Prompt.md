# Sprint Prompt Guide

> GPT/Codex와 함께 이 프로젝트를 진행하기 위한 작업 규칙
>
> 현재 기준: Phase3 Step3 진행 중

---

# 1. Purpose

이 문서는 새 작업을 시작할 때 프로젝트 컨텍스트를 유지하고, 문서 기반 개발 방식을 강제하기 위한 가이드이다.

목적:

- 문서 기반 구현 유지
- 현재 Phase 범위 준수
- Domain Architecture 유지
- Worker 구조 임의 변경 방지
- 상태 전이 규칙 문서 기준 유지
- 작업 전 관련 문서 확인

---

# 2. Required Reading

작업 전 반드시 다음 문서를 먼저 확인한다.

```text
docs/01_Project_Overview.md
docs/02_Architecture.md
docs/03_Database_Schema.md
docs/04_Sprint_RoadMap.md
docs/04_Sprint_Phase1.md
docs/04_sprint_Phase2.md
docs/04_Sprint_Phase3.md
docs/04_Sprint_Phase4.md
docs/05_Technical_Conventions.md
docs/06_Security_Principles.md
docs/07_Operation_Policy.md
docs/08_MockUSDT.md
docs/09_DevPortal_IA.md
docs/11_Git_Workflow_Guide.md
```

작업 종류에 따라 특히 봐야 할 문서:

- DB 변경: `03_Database_Schema.md`
- Worker 변경: `02_Architecture.md`, `04_Sprint_Phase3.md`
- 보안 변경: `06_Security_Principles.md`
- Portal 변경: `09_DevPortal_IA.md`
- 배포/운영 변경: `07_Operation_Policy.md`

---

# 3. Current Phase Rule

현재 Phase:

```text
Phase3 Step3 - Idempotency & State Transition
```

현재 우선순위:

1. 상태 전이 guard
2. txHash unique 정책 검증
3. Withdrawal double broadcast 방지
4. Gas refill 중복 방지
5. txHash lifecycle logging

규칙:

- Phase3 범위를 벗어난 기능은 먼저 문서에 예정 범위로 기록한다.
- Phase4 항목을 구현하려면 사용자에게 범위 변경을 확인한다.
- 문서보다 소스가 앞선 경우 문서를 먼저 현재화한다.

---

# 4. Work Prompt Template

새 작업 요청 예시:

```text
프로젝트 문서를 기준으로 현재 Phase3 Step3 범위에서
{작업명}을 진행하자.

관련 문서:
- docs/02_Architecture.md
- docs/03_Database_Schema.md
- docs/04_Sprint_Phase3.md
- docs/05_Technical_Conventions.md

요구사항:
- ...

완료 기준:
- ...
```

---

# 5. Implementation Checklist Rule

코드 변경 전 간단한 체크리스트를 만든다.

예:

```text
Checklist
- [ ] 관련 문서 확인
- [ ] 현재 구현 위치 확인
- [ ] DB/schema 영향 확인
- [ ] 상태 전이 영향 확인
- [ ] 최소 수정 범위 결정
- [ ] 구현
- [ ] 검증
- [ ] 문서 갱신
```

---

# 6. Step-by-Step Rule

복잡한 작업은 단계별로 진행한다.

권장 순서:

```text
Step 1. 관련 문서 확인
Step 2. 현재 코드 구조 확인
Step 3. 변경 범위 결정
Step 4. DB/enum/state 영향 확인
Step 5. 구현
Step 6. 테스트/빌드/타입체크
Step 7. 문서 갱신
Step 8. 결과 요약
```

---

# 7. Scope Guard

금지:

- 문서에 없는 상태 전이 추가
- Worker 역할 임의 변경
- Phase4 기능 선반영
- privateKey/API Key 노출
- Partner 데이터 격리 우회
- unrelated refactor
- 기존 오탈자 경로를 별도 합의 없이 대규모 rename

허용:

- 현재 Phase 완료를 위한 최소 수정
- 버그 수정
- 문서와 소스 정합화
- 테스트/검증 코드 추가
- 작은 naming/comment 정리

---

# 8. Coding Rules

반드시 준수:

- `05_Technical_Conventions.md`
- `06_Security_Principles.md`
- Controller -> Service -> Repository 책임 분리
- Prisma error mapping
- DTO validation
- Type safety
- Constants/env 중앙 관리
- Worker idempotency

상태 전이 변경 시:

- Prisma enum 확인
- DB unique 제약 확인
- Service update 조건 확인
- Worker 재시도 흐름 확인
- 문서 갱신

---

# 9. Documentation Rule

문서 변경 시:

- 현재 소스 기준으로 작성한다.
- 완료/진행/예정을 구분한다.
- Phase 범위를 명확히 표시한다.
- 오래된 Phase1 표현을 그대로 두지 않는다.
- 실제 경로명과 실제 route를 우선한다.
- 오탈자성 경로는 현재 상태로 기록하고, rename은 별도 작업으로 둔다.

문서 출력 요청 시:

- 사용자가 파일 수정을 원하면 직접 파일을 수정한다.
- 사용자가 초안만 원하면 Markdown으로 답변한다.

---

# 10. Verification Rule

권장 검증:

```text
pnpm typecheck
pnpm lint
pnpm build:api
pnpm build:portal
```

현재 환경에서 `node`/`pnpm` PATH가 없을 수 있다.

검증을 못 한 경우:

- 실패 명령
- 실패 이유
- 남은 위험

을 결과에 명확히 남긴다.

---

# 11. GPT Role

GPT/Codex의 역할:

```text
Senior Blockchain Backend Architect
```

책임:

- 문서 먼저 확인
- 현재 소스 구조 존중
- 최소 수정
- 상태 전이와 Worker 구조 보호
- 보안 원칙 준수
- 구현 후 검증과 문서 갱신
