export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { conditions, restaurants } = req.body
  const geminiKey = process.env.GEMINI_API_KEY

  // 1. 날씨 조회 (Open-Meteo — API 키 불필요)
  let weatherDesc = '알 수 없음'
  let temp = null
  try {
    const { lat, lon } = conditions
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=Asia%2FSeoul`
    )
    const weather = await weatherRes.json()
    if (weather.current) {
      temp = Math.round(weather.current.temperature_2m)
      const code = weather.current.weathercode
      const desc =
        code === 0 ? '맑음' :
        code <= 3 ? '구름 조금' :
        code <= 48 ? '안개' :
        code <= 55 ? '이슬비' :
        code <= 65 ? '비' :
        code <= 75 ? '눈' :
        code <= 82 ? '소나기' :
        code <= 99 ? '천둥번개' : '흐림'
      weatherDesc = `${desc}, 기온 ${temp}°C`
    }
  } catch (e) {}

  // 2. Gemini로 추천
  const prompt = `당신은 직장인 점심 메뉴를 추천하는 AI입니다.
사용자는 팀 내 막내로, 빠르고 눈치 보지 않고 메뉴를 결정해야 하는 상황입니다.

[입력값]
- 위치: ${conditions.location}
- 인원 수: ${conditions.count}
- 식사 스타일: ${conditions.style}
- 현재 날씨: ${weatherDesc}

[후보 음식점 목록]
${restaurants.map((r, i) => `${i + 1}. ${r.place_name} (${r.category_name?.split('>').pop()?.trim() || ''}) - ${r.road_address_name || r.address_name}`).join('\n')}

[식사 스타일별 추천 가이드]
- 트렌디: 샐러드/포케/타코/파스타/햄버거/마라탕 등 2030 트렌드 메뉴. 전통 한식/국밥 제외.
- 무난: 제육볶음/분식/찌개/일식/베트남식 등 호불호 없는 메뉴. 빠르게 먹고 복귀 가능.
- 든든: 고기집/국밥/해장국/한정식 등 양 많고 포만감 높은 메뉴. 샐러드/가벼운 음식 제외.
- 눈치: 분식/한식/무난한 일식 등 다양한 취향 만족. 마라/향신료 강한 음식 제외.

[인원 수별 추천 기준]
- 혼밥(1명): 바 좌석/1인석 가능 식당, 분식/국밥/덮밥/샌드위치 등 패스트한 메뉴 우선. 고기집/대형 테이블 중심 식당 제외. 기준: "눈치 없이 빠르게 먹을 수 있는지"
- 2~3명: 대부분 가능. 각자 메뉴 선택 가능한 곳 우선. 코스형/회전율 낮은 식당 제외. 기준: "빠른 입장 + 메뉴 다양성"
- 4~6명: 테이블 여유 있는 식당, 한식/중식/고기류/찌개류 등 공유 식사 가능한 곳. 좌석 적은 맛집/웨이팅 긴 곳 제외. 기준: "한 번에 앉을 수 있는지 + 서빙 빠른지"
- 단체(7+): 단체석/룸 있는 식당, 고기집/한정식/대형 식당 우선. 소형 매장/웨이팅 필수 식당 제외. 기준: "단체 수용 가능 여부 + 빠른 대응"
- 인원이 많을수록 웨이팅 리스크/메뉴 단순성/빠른 서빙 강하게 고려. 인원이 적을수록 다양성/트렌디함 허용.

[날씨 반영]
- 추운 날: 국물류/따뜻한 음식 우선
- 더운 날: 냉면/샐러드/가벼운 음식 우선
- 비 오는 날: 전/국물/해장류 가산점

위 조건에 맞는 음식점을 3~5개 골라 추천하세요.
반드시 아래 JSON만 출력하세요 (마크다운 코드블록 없이):

{
  "recommendations": [
    {
      "index": 후보 목록 번호 (1부터 시작),
      "menu": "대표 메뉴 (1~2가지)",
      "reason": "추천 이유 한 줄 (날씨/조건 반영, 30자 이내, 위트 있게)",
      "team_fit": "이런 팀에 추천 (15자 이내)"
    }
  ],
  "weather_comment": "오늘 날씨 한 줄 코멘트 (20자 이내, 가볍고 재치있게)"
}`

  try {
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 800 }
        })
      }
    )
    const aiData = await aiRes.json()
    const raw = aiData.candidates[0].content.parts[0].text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const recommendations = parsed.recommendations.map(rec => ({
      ...restaurants[rec.index - 1],
      menu: rec.menu,
      reason: rec.reason,
      team_fit: rec.team_fit,
    })).filter(Boolean)

    return res.json({
      recommendations,
      weatherComment: parsed.weather_comment,
      weather: weatherDesc,
      temp,
    })
  } catch (e) {
    console.error('[recommend] error:', e)
    // AI 실패 시 랜덤 3개 추천
    const shuffled = [...restaurants].sort(() => Math.random() - 0.5).slice(0, 3)
    return res.json({
      recommendations: shuffled.map(r => ({
        ...r,
        menu: r.category_name?.split('>').pop()?.trim() || '',
        reason: '오늘의 랜덤 추천이에요!',
        team_fit: '모두에게 추천',
      })),
      weatherComment: '오늘도 맛있는 하루',
      weather: weatherDesc,
      temp,
    })
  }
}
