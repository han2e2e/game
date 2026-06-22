# 화살베기

날아오는 화살을 타이밍에 맞게 패리하는 HTML5 게임입니다.

## 플레이

- **프로덕션**: https://arrowslash.vercel.app
- **로컬**: `index.html`을 브라우저에서 열기

## 연동 구조

| 서비스 | 역할 |
|--------|------|
| **GitHub** | 소스 코드 저장, push 시 자동 배포 트리거 |
| **Vercel** | 정적 호스팅 (HTML + PNG 에셋) |
| **Supabase** | 랭킹 DB (`rankings` 테이블) |

## Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard/project/hneozwrttqvurhexpofe) → **SQL Editor**
2. [`supabase/schema.sql`](supabase/schema.sql) 내용 실행
3. **Settings → API**에서 Project URL / anon key 확인  
   (게임 코드: `index.html` 상단 `SUPABASE_URL`, `SUPABASE_ANON_KEY`)

## 배포

### GitHub push → Vercel 자동 배포 (권장)

GitHub 저장소와 Vercel 프로젝트가 연결되어 있으면 `main` 브랜치 push 시 자동 배포됩니다.

### 수동 배포

```powershell
cd c:\Users\Admin\Desktop\game
npm run deploy
```

## 저장소

```powershell
git remote add origin https://github.com/han2e2e/game.git
git push -u origin main
```
