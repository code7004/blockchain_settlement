# Git Workflow Guide

본 프로젝트는 **Husky + lint-staged 기반 Git Hook**을 사용합니다.
반드시 CLI(Command Line)를 통해 커밋을 수행해야 합니다..

---

## 📌 기본 원칙

- VSCode Source Control 사용 ❌ (hook 미동작 가능)
- CLI 기반 git 사용 ⭕
- 커밋 시 Husky hook 자동 실행
- lint / format 실패 시 커밋 차단

---

## 🚀 기본 커밋 흐름

```
git status
git add .
git commit -m "type: message"
git push origin 브랜치명
```

---

## ✏️ 커밋 메시지 규칙 (Conventional Commit)

```
type: subject
```

### 타입 목록

- feat: 기능 추가
- fix: 버그 수정
- chore: 기타 작업 (빌드, 설정 등)
- refactor: 리팩토링
- docs: 문서 수정
- test: 테스트 코드
- style: 코드 스타일 (formatting)

---

## 📌 커밋 예시

```
git commit -m "feat: deposit watcher 구현"
git commit -m "fix: confirmation 처리 버그 수정"
git commit -m "chore: husky 설정 추가"
```

---

## 🌿 브랜치 전략

```
main        → 운영 (prod)
develop     → 개발 기준 브랜치
feature/*   → 기능 개발
```

### 브랜치 생성

```
git checkout -b feature/기능명
```

### 최초 푸쉬

```
git push -u origin feature/기능명
```

---

## ⚡ 자주 사용하는 명령어

```
# 전체 변경사항 추가
git add .

# 수정/삭제 자동 포함
git add -A

# add + commit
git commit -am "chore: minor fix"

# 현재 브랜치 확인
git branch
```

---

## 🧪 Husky Hook 동작 방식

커밋 시 자동 실행:

```
- eslint 검사
- prettier 포맷
- lint-staged 수행
```

### 실패 시

- 커밋 차단됨
- 에러 수정 후 다시 commit 필요

---

## ⚠️ 주의사항

- 반드시 `git commit` 명령어 사용
- hook skip 금지 (`--no-verify` 사용 금지)
- lint 에러 상태로 커밋 불가

---

## 🧠 권장 워크플로우

```
1. feature 브랜치 생성
2. 작업 진행
3. git add .
4. git commit
5. git push
6. PR → develop merge
```

---

## ✅ 요약

```
CLI로 commit 해야 Husky 동작
커밋 메시지는 규칙 준수
feature 브랜치 기반 작업
```
