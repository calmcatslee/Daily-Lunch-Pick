import { useState, useRef } from 'react'
import s from '../styles/RouletteView.module.css'

export default function RouletteView({ conditions, restaurants, onReset }) {
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef(null)

  const items = restaurants.slice(0, 8)
  const segAngle = 360 / items.length

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const extraSpins = 5 + Math.floor(Math.random() * 5)
    const winIndex = Math.floor(Math.random() * items.length)
    const targetAngle = rotation + extraSpins * 360 + (360 - winIndex * segAngle - segAngle / 2)
    setRotation(targetAngle)
    setTimeout(() => { setResult(items[winIndex]); setSpinning(false) }, 4200)
  }

  const cx = 150, cy = 150, radius = 140

  return (
    <div className={s.wrap}>
      <div className={s.wheelArea}>
        {/* 포인터 — 좌측 중앙 (Random_Sequence 참고) */}
        <div className={s.pointer}>
          <img src="/result-assets/random/triangle.png" alt="pointer" className={s.pointerImg} draggable={false} />
        </div>

        <svg
          ref={wheelRef} width="300" height="300" viewBox="0 0 300 300"
          className={s.wheel}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {items.map((item, i) => {
            const startAngle = (i * segAngle - 90) * (Math.PI / 180)
            const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180)
            const x1 = cx + radius * Math.cos(startAngle)
            const y1 = cy + radius * Math.sin(startAngle)
            const x2 = cx + radius * Math.cos(endAngle)
            const y2 = cy + radius * Math.sin(endAngle)
            const largeArc = segAngle > 180 ? 1 : 0
            const midAngle = ((i + 0.5) * segAngle - 90) * (Math.PI / 180)
            const tx = cx + (radius * 0.6) * Math.cos(midAngle)
            const ty = cy + (radius * 0.6) * Math.sin(midAngle)
            const name = item.place_name.length > 5 ? item.place_name.slice(0, 5) + '..' : item.place_name
            const textRotation = (i + 0.5) * segAngle
            const isWinner = result && result.id === item.id

            return (
              <g key={item.id || i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={isWinner ? '#d4ff00' : '#faf5e4'}
                  stroke="#1a1a1a" strokeWidth="2"
                />
                <text
                  x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fill="#1a1a1a" fontSize="11" fontWeight="700"
                  fontFamily="'PyeojinGothic', 'Noto Sans KR', sans-serif"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                >{name}</text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r="12" fill={result ? '#d4ff00' : '#84eeda'} stroke="#1a1a1a" strokeWidth="2" />
        </svg>
      </div>

      {/* 결과 오버레이 */}
      {result && (
        <div className={s.resultOverlay}>
          <div className={s.resultTags}>
            {result.category_name && (
              <span className={s.tagFood}>
                <img src="/result-assets/recommend/tag_food.png" alt="" className={s.tagBgImg} draggable={false} />
                <span className={s.tagText}>{result.category_name.split('>').pop()?.trim()}</span>
              </span>
            )}
            <span className={s.tagForwho}>
              <img src="/result-assets/recommend/tag_forwho.png" alt="" className={s.tagBgImg} draggable={false} />
              <span className={s.tagTextW}>모두에게 추천</span>
            </span>
          </div>
          <h2 className={s.resultName}>{result.place_name}</h2>
          {result.road_address_name && <p className={s.resultAddr}>{result.road_address_name}</p>}
        </div>
      )}

      {/* 버튼 — PNG 이미지 */}
      <div className={s.actions}>
        <button className={s.imgBtn} onClick={spin} disabled={spinning}>
          <img src="/result-assets/random/btn_retry.png" alt="다시 돌리기" className={s.actionImg} draggable={false} />
        </button>
        <button className={s.imgBtn} onClick={onReset}>
          <img src="/result-assets/random/btn_home.png" alt="처음으로" className={s.actionImg} draggable={false} />
        </button>
      </div>
    </div>
  )
}
