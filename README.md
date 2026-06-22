# 화살베기 (Arrow Slash)

날아오는 화살을 타이밍에 맞게 패리하는 HTML5 게임입니다.

## 플레이

- **프로덕션**: https://arrowslash.vercel.app
- **GitHub**: https://github.com/han2e2e/game
- **로컬**: `index.html`을 브라우저에서 열기

## 프로젝트 구조

```
index.html              게임 본체
캐릭터*.png             캐릭터 스프라이트 (8장)
favicon*.png            파비콘
og-preview.png          카카오·트위터 등 링크 미리보기
instagram-preview.png   인스타용 미리보기 (별도)
tools/icon-source.jpg   파비콘 원본
tools/instagram-source.jpg  인스타 미리보기 원본
supabase/schema.sql     랭킹 DB 스키마
tools/process-favicon.js  파비콘 재생성 스크립트 (선택)
```

## 연동

| 서비스 | 역할 |
|--------|------|
| **GitHub** | 소스 저장, push 시 Vercel 자동 배포 |
| **Vercel** | https://arrowslash.vercel.app 호스팅 |
| **Supabase** | 랭킹 DB (`rankings` 테이블) |

## 배포

`main` 브랜치에 push하면 Vercel이 자동 배포합니다.

```powershell
git add .
git commit -m "변경 내용"
git push origin main
```

수동 배포: `npm run deploy`
