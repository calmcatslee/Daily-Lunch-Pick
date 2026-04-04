// 스타일별 선호/제외 카테고리 키워드
const STYLE_PREFER = {
  '트렌디한': ['양식', '파스타', '피자', '버거', '브런치', '멕시칸', '아시안', '퓨전', '마라', '포케', '샐러드', '타코', '샌드위치'],
  '무난무난': ['한식', '분식', '일식', '베트남', '중식', '찌개', '제육', '김밥', '덮밥', '우동', '돈까스', '쌀국수', '냉면', '칼국수', '순두부', '비빔밥', '백반', '정식', '카레', '라멘', '초밥', '회전초밥'],
  '든든하게': ['고기', '구이', '국밥', '해장', '한정식', '갈비', '삼겹', '보쌈', '족발', '칼국수', '설렁탕', '곰탕', '감자탕', '순대'],
  '취향존중': ['한식', '분식', '일식', '돈까스', '김밥', '덮밥', '우동', '백반', '정식'],
}
// 고기집/치킨 등 든든한 메뉴는 '든든하게'에서만 표시
const HEARTY_ONLY = ['고기', '구이', '갈비', '삼겹', '보쌈', '족발', '치킨', '닭', '닭갈비', '곱창', '대패', '숯불', '화로', '육류', '양꼬치', 'BBQ', 'bhc', 'BHC', '교촌', '굽네', '네네', '또래오래', '맘스터치']
const STYLE_EXCLUDE = {
  '트렌디한': ['국밥', '해장', '설렁탕', '곰탕', '백반', '감자탕', ...HEARTY_ONLY],
  '무난무난': [...HEARTY_ONLY],
  '든든하게': ['샐러드', '포케', '샌드위치', '브런치'],
  '취향존중': ['마라', '마라탕', '양꼬치', '커리', ...HEARTY_ONLY],
}

const EXCLUDE_CAT = ['카페', '커피', '디저트', '베이커리', '아이스크림', '브런치카페', '패스트푸드', '술집', '호프', '바', '와인', '위스키', '칵테일', '이자카야', '포차', '주점', '펍']
const EXCLUDE_ANY = ['구내식당', '사원식당', '직원식당', '교직원식당', '구내', '기숙사식당', '와인바', '위스키바', '이자카야', '사케', '소주방', '호프집', '맥주집']

function baseFilter(d) {
  const cat = d.category_name || ''
  const name = d.place_name || ''
  const combined = cat + ' ' + name
  if (EXCLUDE_CAT.some(kw => cat.includes(kw))) return false
  if (EXCLUDE_ANY.some(kw => combined.includes(kw))) return false
  if (!d.place_url) return false
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { q, lat, lon, name, style } = req.query

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

    // 3페이지(최대 45개) 카테고리 검색으로 더 넓은 후보군 확보
    const pages = [1, 2, 3]
    const fetches = pages.map(page =>
      fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${placeLon}&y=${placeLat}&radius=1000&size=15&sort=distance&page=${page}`,
        { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
      ).then(r => r.json())
    )
    const results = await Promise.all(fetches)
    const allDocs = results.flatMap(r => r.documents || [])

    // 중복 제거 (같은 id)
    const seen = new Set()
    const unique = allDocs.filter(d => {
      if (seen.has(d.id)) return false
      seen.add(d.id)
      return true
    })

    // 기본 필터 (카페, 구내식당 등 제외)
    const baseFiltered = unique.filter(baseFilter)

    // 스타일별 필터링
    const prefer = STYLE_PREFER[style] || []
    const exclude = STYLE_EXCLUDE[style] || []

    let styleFiltered
    if (prefer.length > 0) {
      // 선호 카테고리에 해당하는 음식점
      const preferred = baseFiltered.filter(d => {
        const cat = d.category_name || ''
        const pname = d.place_name || ''
        const combined = cat + ' ' + pname
        // 제외 키워드에 해당하면 빼기
        if (exclude.some(kw => combined.includes(kw))) return false
        // 선호 키워드에 하나라도 해당하면 포함
        return prefer.some(kw => combined.includes(kw))
      })

      if (preferred.length >= 5) {
        // 선호 카테고리 결과가 충분하면 그것만 사용
        styleFiltered = preferred
      } else {
        // 부족하면 선호 카테고리 우선 + 나머지로 채움
        const rest = baseFiltered.filter(d => {
          const cat = d.category_name || ''
          const pname = d.place_name || ''
          const combined = cat + ' ' + pname
          if (exclude.some(kw => combined.includes(kw))) return false
          return !prefer.some(kw => combined.includes(kw))
        })
        styleFiltered = [...preferred, ...rest]
      }
    } else {
      styleFiltered = baseFiltered
    }

    // 최대 15개 반환
    const final = styleFiltered.slice(0, 15)

    return res.json({
      documents: final,
      total_count: final.length,
      baseLocation: { name: placeName || q, lat: placeLat, lon: placeLon }
    })
  } catch (e) {
    return res.status(500).json({ error: '검색 중 오류가 발생했어요.' })
  }
}
