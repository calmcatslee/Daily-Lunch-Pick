import { useState, useCallback } from 'react'
import s from '../styles/VoteView.module.css'

const VOTE_NUM_IMGS = [
  '/result-assets/vote/num1.png', '/result-assets/vote/num2.png',
  '/result-assets/vote/num3.png', '/result-assets/vote/num4.png',
  '/result-assets/vote/num5.png', '/result-assets/vote/num6.png',
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function VoteView({ conditions, restaurants, onReset }) {
  const [creating, setCreating] = useState(false)
  const [voteId, setVoteId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [candidates, setCandidates] = useState(() => shuffle(restaurants).slice(0, 6))

  const refreshCandidates = useCallback(() => {
    setCandidates(shuffle(restaurants).slice(0, 6))
  }, [restaurants])

  const createVote = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions, restaurants: candidates })
      })
      const data = await res.json()
      setVoteId(data.id)
    } catch { alert('투표 생성 중 오류가 발생했어요.') }
    setCreating(false)
  }

  const voteUrl = voteId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${voteId}` : ''
  const copyLink = () => {
    navigator.clipboard.writeText(voteUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={s.wrap}>
      {!voteId ? (
        <>
          <div className={s.list}>
            {candidates.map((r, i) => (
              <div key={r.id} className={s.card}>
                <div className={s.cardInner}>
                  <img src={VOTE_NUM_IMGS[i] || VOTE_NUM_IMGS[0]} alt={`${i+1}`} className={s.numImg} draggable={false} />
                  <div className={s.info}>
                    <span className={s.name}>{r.place_name}</span>
                    <span className={s.addr}>{r.road_address_name || r.address_name || ''}</span>
                  </div>
                  <a className={s.mapBtn}
                    href={`https://map.naver.com/p/search/${encodeURIComponent(r.place_name || '')}`}
                    target="_blank" rel="noopener noreferrer"><span className={s.mapFull}>지도 보기</span><span className={s.mapShort}>지도</span></a>
                </div>
              </div>
            ))}
          </div>
          <div className={s.actions}>
            <button className={`${s.actionBtn} ${s.retryBtn}`} onClick={refreshCandidates}>다시 추천해</button>
            <button className={`${s.actionBtn} ${s.primaryBtn}`} onClick={createVote} disabled={creating}>{creating ? '생성 중...' : '투표 링크 만들기'}</button>
          </div>
        </>
      ) : (
        <div className={s.shareWrap}>
          <h2 className={s.shareTitle}>투표 링크 생성 완료!</h2>
          <p className={s.shareSub}>팀원들에게 링크를 공유해보세요<br />24시간 동안 유효합니다</p>
          <div className={s.linkBox}>
            <span className={s.linkText}>{voteUrl}</span>
            <button className={s.copyBtn} onClick={copyLink}>{copied ? '복사됨 ✓' : '복사'}</button>
          </div>
          <a className={`${s.actionBtn} ${s.primaryBtn} ${s.seeResultBtn}`} href={`${voteUrl}?view=results`} target="_blank" rel="noreferrer">실시간 결과 보기</a>
          <button className={`${s.actionBtn} ${s.homeBtn}`} onClick={onReset}>처음으로</button>
        </div>
      )}
    </div>
  )
}
