## pnpm 설치

| 작업                | 실행 위치                 |
| ------------------- | ------------------------- |
| pnpm install        | 루트                      |
| pnpm add 공통패키지 | 루트                      |
| pnpm add api전용    | 루트 +`--filter @cws/api` |
| prisma generate     | apps/api                  |
| prisma migrate      | apps/api                  |
| nest 실행           | 루트 or apps/api          |

## Create Domain
