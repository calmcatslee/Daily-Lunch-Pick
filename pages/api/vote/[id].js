if (!global._voteSessions) global._voteSessions = new Map()
const sessions = global._voteSessions

const TTL = 1000 * 60 * 60 * 24 // 24시간

export default async function handler(req, res) {
  const { id } = req.query
  const session = sessions.get(id)

  // 세션 없거나 만료
  if (!session || Date.now() - session.createdAt > TTL) {
    return res.status(404).json({ error: 'not found' })
  }

  // GET — 투표 세션 조회
  if (req.method === 'GET') {
    return res.json(session)
  }

  // POST — 투표 등록
  if (req.method === 'POST') {
    const { restaurantId } = req.body
    session.votes[restaurantId] = (session.votes[restaurantId] || 0) + 1
    sessions.set(id, session)
    return res.json({ ok: true, votes: session.votes })
  }

  res.status(405).end()
}
