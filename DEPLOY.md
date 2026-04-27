# 네컷모아 랜딩 배포

## 실행

```bash
npm start
```

기본 포트는 `4173`입니다. 배포 플랫폼이 `PORT` 환경변수를 주면 그 값을 사용합니다.

## 이메일 데이터

출시 알림 폼으로 입력된 이메일은 서버 실행 환경의 아래 파일에 누적됩니다.

```text
data/leads.json
```

주의: Vercel/Netlify 같은 서버리스 환경은 파일 저장이 영구 유지되지 않을 수 있습니다. 실제 운영에서는 Render/Railway/Fly.io처럼 디스크가 유지되는 서버 환경을 쓰거나, Supabase/Firebase/DB로 저장소를 바꾸는 편이 안전합니다.

## API

```text
POST /api/notify
GET /api/leads
```

`POST /api/notify` body:

```json
{
  "email": "email@email.com",
  "page": "landing-page-url",
  "createdAt": "ISO date"
}
```
