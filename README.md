# 🍱 LunchPick — AI 점심 추천 서비스

## 기능
- **AI 추천**: 날씨·조건 반영해서 1곳 콕 집어 추천
- **랜덤 룰렛**: 후보 음식점 중 랜덤 스핀
- **팀 투표**: 링크 공유 → 팀원 함께 투표

---

## Vercel 배포 가이드

### 1단계 — GitHub에 올리기
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/본인계정/lunch-pick.git
git push -u origin main
```

### 2단계 — Vercel에 배포
1. vercel.com 접속 → GitHub 연동
2. lunch-pick 레포 선택 → Import
3. Framework: Next.js (자동 감지)
4. Deploy 클릭

### 3단계 — Vercel KV 연결 (투표 기능)
1. Vercel 대시보드 → Storage → Create Database
2. KV 선택 → 프로젝트 연결
3. 환경 변수 자동 설정됨

### 4단계 — 환경 변수 추가
Vercel 대시보드 → Settings → Environment Variables:
- `OPENWEATHER_KEY`: openweathermap.org 무료 가입 후 API Keys 탭에서 발급

---

## API 키 준비 목록

| 키 | 발급처 | 비용 |
|---|---|---|
| Kakao REST API 키 | developers.kakao.com | 무료 |
| Gemini API 키 | aistudio.google.com | 무료 |
| OpenWeatherMap 키 | openweathermap.org | 무료 |
| Vercel KV | vercel.com/storage | 무료 (256MB) |

---

## 사용 방법
1. 추천 방식 선택 (AI 추천 / 룰렛 / 투표)
2. Kakao·Gemini API 키 입력
3. 위치 검색 (예: 강남역, 판교 등)
4. 조건 선택 (인원·연령대·성별)
5. 결과 확인 및 공유
