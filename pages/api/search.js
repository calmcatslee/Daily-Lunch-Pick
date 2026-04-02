export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { q, lat, lon, name } = req.query

  const kakaoKey = process.env.KAKAO_API_KEY
  if (!kakaoKey) return res.status(500).json({ error: 'Kakao API key not configured' })

  try {
    let placeLat = lat
    let placeLon = lon
    let placeName = name

    // 좌표가 없으면 장소명으로 좌표 검색
    if (!placeLat || !placeLon) {
      if (!q) return res.status(400).json({ error: 'q or lat/lon is required' })

      const locRes = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=1`,
        { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
      )
      const locData = await locRes.json()

      if (!locData.documents?.length) {
        return res.json({ documents: [], message: '위치를 찾지 못했어요. 다른 이름을 입력해보세요.' })
      }

      placeLon = locData.documents[0].x
      placeLat = locData.documents[0].y
      placeName = locData.documents[0].place_name
    }

    // 좌표 기준 반경 1000m(도보 15분) 내 음식점 검색
    const foodRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${placeLon}&y=${placeLat}&radius=1000&size=15&sort=distance`,
      { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
    )
    const foodData = await foodRes.json()

    const EXCLUDE_CAT = ['카페', '커피', '디저트', '베이커리', '아이스크림', '브런치카페', '패스트푸드']
    const EXCLUDE_ANY = ['구내식당', '사원식당', '직원식당', '교직원식당', '구내', '기숙사식당']
    const filtered = (foodData.documents || []).filter(d => {
      const cat = d.category_name || ''
      const placeName = d.place_name || ''
      const combined = cat + ' ' + placeName
      // 카페/커피류 제외
      if (EXCLUDE_CAT.some(kw => cat.includes(kw))) return false
      // 구내식당류 — 이름 또는 카테고리 어디든 포함되면 제외
      if (EXCLUDE_ANY.some(kw => combined.includes(kw))) return false
      // place_url 없으면 폐점 가능성 높음 → 제외
      if (!d.place_url) return false
      return true
    })

    return res.json({
      ...foodData,
      documents: filtered,
      baseLocation: { name: placeName || q, lat: placeLat, lon: placeLon }
    })
  } catch (e) {
    return res.status(500).json({ error: '검색 중 오류가 발생했어요.' })
  }
}
