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
                    href={`https://map.naver.com/p/search/${encodeURIComponent((r.place_name || '') + ' ' + (r.road_address_name || r.address_name || ''))}`}
                    target="_blank" rel="noopener noreferrer">
                    <img src="/result-assets/recommend/btn_map.png" alt="지도 보기" className={s.btnImg} draggable={false} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className={s.actions}>
            <button className={s.imgBtn} onClick={refreshCandidates}>
              <img src="/result-assets/vote/btn_retry.png" alt="다시 추천해" className={s.actionImg} draggable={false} />
            </button>
            <button className={s.imgBtn} onClick={createVote} disabled={creating}>
              <img src="/result-assets/vote/btn_makelink.png" alt="투표 링크 만들기" className={s.actionImg} draggable={false} />
            </button>
          </div>
        </>
      ) : (
        <div className={s.shareWrap}>
          <h2 className={s.shareTitle}>투표 링크 생성 완료!</h2>
          <p className={s.shareSub}>팀원들에게 링크를 공유해보세요<br />24시간 동안 유효합니다</p>
          <div className={s.linkBox}>
            <span className={s.linkText}>{voteUrl}</span>
            <button className={s.copyImgBtn} onClick={copyLink}>
              <img src="/result-assets/vote/btn_copy.png" alt={copied ? '복사됨' : '복사'} className={s.copyImg} draggable={false} />
            </button>
          </div>
          <a className={s.seeResultImgBtn} href={voteUrl} target="_blank" rel="noreferrer">
            <img src="/result-assets/vote/btn_see_result.png" alt="실시간 결과 보기" className={s.actionImg} draggable={false} />
          </a>
          <button className={s.imgBtn} onClick={onReset}>
            <img src="/result-assets/vote/btn_retry.png" alt="다시 추천해" className={s.actionImg} draggable={false} />
          </button>
        </div>
      )}
    </div>
  )
}
