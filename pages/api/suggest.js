export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { q } = req.query
  if (!q || q.length < 1) return res.json({ places: [] })

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Naver API keys not configured' })
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(q)}&display=10&sort=random`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[suggest] Naver API error:', data)
      return res.status(502).json({ places: [], error: data.errorMessage || `HTTP ${response.status}` })
    }

    const stripHtml = (str) => str.replace(/<[^>]*>/g, '')

    const places = (data.items || []).map((item, i) => ({
      id: String(i) + '_' + item.mapx,
      name: stripHtml(item.title),
      address: item.roadAddress || item.address,
      category: item.category || '',
      lat: String(parseInt(item.mapy) / 10000000),
      lon: String(parseInt(item.mapx) / 10000000),
    }))

    return res.json({ places })
  } catch (e) {
    console.error('[suggest] fetch error:', e)
    return res.status(500).json({ places: [], error: e.message })
  }
}
