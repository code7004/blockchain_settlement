# Git Workflow Guide

> 현재 프로젝트 Git 작업 규칙
>
> Husky + lint-staged 기반 hook을 사용하므로 커밋은 CLI 기준으로 수행한다.

---

## 1. Branch Policy

기준 브랜치:

```text
main     -> 운영 기준
develop  -> 개발 기준
```

작업 브랜치:

```text
feature/{name}
fix/{name}
docs/{name}
chore/{name}
```

Codex 작업 브랜치 권장 prefix:

```text
codex/{name}
```

---

## 2. Basic Flow

```bash
git status
git checkout -b docs/update-project-docs
git add -A
git commit -m "docs: update project documentation"
git push -u origin docs/update-project-docs
```

주의:

- VSCode Source Control보다 CLI를 우선한다.
- hook skip 금지: `--no-verify` 사용 금지
- 커밋 전 변경 파일을 확인한다.

---

## 3. Commit Message

Conventional Commit을 사용한다.

형식:

```text
type: subject
```

type:

```text
feat      기능 추가
fix       버그 수정
docs      문서 수정
refactor  리팩터링
test      테스트
chore     설정/빌드/기타
style     포맷 변경
```

예:

```bash
git commit -m "docs: align architecture with current workers"
git commit -m "fix: prevent duplicate sweep broadcast"
git commit -m "feat: add tx lifecycle monitor"
```

---

## 4. Pre-Commit Checks

권장:

```bash
pnpm typecheck
pnpm lint
pnpm build:api
pnpm build:portal
```

DB 변경 시 추가:

```bash
pnpm db:format
pnpm db:generate
pnpm db:migrate
```

현재 환경에서 `node` 또는 `pnpm`이 PATH에 없을 수 있다.

검증 실패 시:

- 실패한 명령을 기록한다.
- PATH 문제인지 코드 문제인지 구분한다.
- 검증하지 못한 상태로 커밋할 경우 위험을 명시한다.

---

## 5. Safe Directory Issue

Windows 환경에서 repository ownership 문제로 다음 오류가 발생할 수 있다.

```text
fatal: detected dubious ownership in repository
```

해결:

```bash
git config --global --add safe.directory C:/work/sources/chain-wallet-service
```

주의:

- 이 설정은 사용자 환경에 적용된다.
- 자동으로 실행하지 말고, 필요한 경우 사용자가 명시적으로 수행한다.

---

## 6. Working Tree Safety

규칙:

- 내가 만들지 않은 변경을 되돌리지 않는다.
- unrelated 변경은 건드리지 않는다.
- 같은 파일에 사용자 변경이 있으면 먼저 읽고 함께 반영한다.
- `git reset --hard` 금지
- `git checkout -- file` 금지
- 대량 rename은 별도 합의 후 진행한다.

문서 작업 시:

- 변경 대상 문서 목록을 명확히 한다.
- code와 docs를 한 커밋에 섞을 경우 이유를 남긴다.

---

## 7. Pull Request Policy

PR에는 다음을 포함한다.

```text
Summary
- 변경 요약

Verification
- 실행한 검증 명령
- 실패/미실행 사유

Docs
- 갱신한 문서

Risk
- 남은 위험
```

문서 정합화 PR 예:

```text
Summary
- Align docs/01-11 with current Phase3 source state
- Document SweepJob/SweepLog and Worker architecture

Verification
- Read updated markdown files with UTF-8
- pnpm not run: node/pnpm unavailable in PATH

Risk
- No runtime code changed
```

---

## 8. Release / Deploy Notes

운영 배포 전:

- migration 여부 확인
- env 확인
- worker 영향 확인
- rollback 방법 확인
- Portal build 확인

운영 배포 후:

- API health
- DB health
- worker start log
- DepositWorker cursor
- callback retry
- sweep pending/broadcasted 상태

---

## 9. Summary

```text
CLI 기반 커밋
Conventional Commit
hook skip 금지
사용자 변경 보호
검증 결과 기록
문서와 소스 정합성 유지
```
