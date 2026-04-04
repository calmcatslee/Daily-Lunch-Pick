import { useState, useEffect } from 'react'
import s from '../styles/ResultView.module.css'

const NUM_IMGS = [
  '/result-assets/recommend/num1.png',
  '/result-assets/recommend/num2.png',
  '/result-assets/recommend/num3.png',
]

export default function ResultView({ conditions, restaurants, onReset }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previousIds, setPreviousIds] = useState([])

  useEffect(() => { fetchRecommendation() }, [])

  const fetchRecommendation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions, restaurants, previousIds }),
      })
      const data = await res.json()
      setResult(data)
      // 다음 재추천 시 이번 결과를 제외할 수 있도록 ID 저장
      const newIds = (data.recommendations || []).map(r => r.id).filter(Boolean)
      setPreviousIds(prev => [...new Set([...prev, ...newIds])])
    } catch {
      setResult({
        recommendations: restaurants.slice(0, 3).map(r => ({
          ...r,
          menu: r.category_name?.split('>').pop()?.trim() || '',
          reason: '',
          team_fit: '모두에게 추천',
        })),
      })
    }
    setLoading(false)
  }

  if (loading) return (
    <div className={s.loadingWrap}>
      <div className={s.loadingRing} />
      <p className={s.loadingText}>AI가 최적의 점심을 찾고 있어요</p>
    </div>
  )
  if (!result) return null

  const { recommendations = [] } = result

  return (
    <div className={s.wrap}>
      <div className={s.recList}>
        {recommendations.map((r, i) => (
          <div key={r.id || i} className={s.recCard}>
            <div className={s.recHeader}>
              <img src={NUM_IMGS[i] || NUM_IMGS[0]} alt={`${i+1}`} className={s.recNumImg} draggable={false} />
              <div className={s.recInfo}>
                <span className={s.recName}>{r.place_name}</span>
                {r.road_address_name && <span className={s.recAddr}>{r.road_address_name}</span>}
              </div>
              {/* 지도보기 — CSS 버튼 */}
              <a
                className={s.mapBtn}
                href={`https://map.naver.com/p/search/${encodeURIComponent((r.place_name || '') + ' ' + (r.road_address_name || r.address_name || ''))}`}
                target="_blank" rel="noopener noreferrer"
              >지도보기</a>
            </div>
            <div className={s.recTags}>
              {r.menu && (
                <span className={s.tagFood}>{r.menu}</span>
              )}
              <span className={s.tagForwho}>{r.team_fit || '모두에게 추천'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 버튼 — CSS */}
      <div className={s.actions}>
        <button className={`${s.actionBtn} ${s.retryBtn}`} onClick={fetchRecommendation}>다시 추천해</button>
        <button className={`${s.actionBtn} ${s.homeBtn}`} onClick={onReset}>처음으로</button>
      </div>
    </div>
  )
}
