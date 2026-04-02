// @vercel/kv 서비스 종료로 인해 in-memory 저장소로 대체
// 서버리스 환경에서 같은 인스턴스 내 세션 유지 (소규모 팀용 충분)
if (!global._voteSessions) global._voteSessions = new Map()
const sessions = global._voteSessions

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { conditions, restaurants } = req.body
  const id = Math.random().toString(36).slice(2, 9)
  const session = {
    id,
    conditions,
    restaurants,
    votes: {},
    createdAt: Date.now(),
  }
  sessions.set(id, session)
  return res.json({ id })
}
