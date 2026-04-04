import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import s from '../../styles/Vote.module.css'

export default function VotePage() {
  const router = useRouter()
  const { id, view } = router.query
  const isResultsView = view === 'results'
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchSession = useCallback(() => {
    if (!id) return
    fetch(`/api/vote/${id}`)
      .then(r => r.json())
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  // 초기 로드
  useEffect(() => { fetchSession() }, [fetchSession])

  // 투표 후 또는 결과 보기 모드에서 5초마다 실시간 폴링
  useEffect(() => {
    if ((!voted && !isResultsView) || !id) return
    const interval = setInterval(fetchSession, 5000)
    return () => clearInterval(interval)
  }, [voted, isResultsView, id, fetchSession])

  const handleVote = async () => {
    if (!selected) return
    setSubmitting(true)
    const res = await fetch(`/api/vote/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: selected })
    })
    if (res.ok) {
      const data = await res.json()
      setSession(prev => ({ ...prev, votes: data.votes }))
      setVoted(true)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className={s.center}>
      <div className={s.spinner} />
    </div>
  )

  if (!session) return (
    <div className={s.center}>
      <p className={s.err}>투표 세션을 찾을 수 없어요.</p>
    </div>
  )

  const total = session.restaurants.reduce((acc, r) => acc + (session.votes?.[r.id] || 0), 0)

  return (
    <>
      <Head><title>점심 투표 — LunchPick</title></Head>
      <div className={s.wrap}>
        <div className={s.header}>
          <div className={s.logo}>LUNCH<span>·</span>PICK</div>
          <div className={s.badge}>투표</div>
        </div>

        <div className={s.card}>
          <div className={s.meta}>
            <span className={s.chip}>{session.conditions?.location || '우리 회사 근처'}</span>
            <span className={s.chip}>{session.conditions?.count}명</span>
          </div>
          <h1 className={s.title}>오늘 점심 어디 갈까요?</h1>
          <p className={s.sub}>팀원들과 함께 결정해요</p>

          {(voted || isResultsView) ? (
            <div className={s.resultWrap}>
              <p className={s.votedMsg}>{isResultsView ? '📊 실시간 투표 현황' : '✓ 투표 완료!'}</p>
              <p className={s.liveHint}>5초마다 자동 갱신 · 총 {total}표</p>
              <div className={s.resultList}>
                {[...session.restaurants]
                  .sort((a, b) => (session.votes?.[b.id] || 0) - (session.votes?.[a.id] || 0))
                  .map((r, i) => {
                    const voteCount = session.votes?.[r.id] || 0
                    const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0
                    return (
                      <div key={r.id} className={`${s.resultItem} ${i === 0 ? s.top : ''}`}>
                        <div className={s.resultInfo}>
                          <span className={s.rank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}</span>
                          <span className={s.rName}>{r.place_name}</span>
                          <span className={s.rCategory}>{r.category_name}</span>
                        </div>
                        <div className={s.barWrap}>
                          <div className={s.bar} style={{ width: `${pct}%` }} />
                          <span className={s.pct}>{pct}% ({voteCount}표)</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : (
            <div className={s.voteList}>
              {session.restaurants.map(r => (
                <button
                  key={r.id}
                  className={`${s.voteItem} ${selected === r.id ? s.sel : ''}`}
                  onClick={() => setSelected(r.id)}
                >
                  <div className={s.voteInfo}>
                    <span className={s.vName}>{r.place_name}</span>
                    <span className={s.vCat}>{r.category_name}</span>
                    {r.road_address_name && <span className={s.vAddr}>{r.road_address_name}</span>}
                  </div>
                  <div className={s.check}>{selected === r.id ? '✓' : ''}</div>
                </button>
              ))}
              <button
                className={s.voteBtn}
                onClick={handleVote}
                disabled={!selected || submitting}
              >
                {submitting ? '제출 중...' : '투표하기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
