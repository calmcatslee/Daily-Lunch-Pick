import s from '../styles/ModeSelect.module.css'

const modes = [
  {
    id: 'recommend',
    icon: '✦',
    label: 'AI 추천',
    desc: '날씨·조건 반영해서 AI가 1곳 콕 집어줘요',
    color: 'cyan',
  },
  {
    id: 'roulette',
    icon: '◎',
    label: '랜덤 룰렛',
    desc: '운명에 맡겨보세요, 돌리면 나와요',
    color: 'yellow',
  },
  {
    id: 'vote-create',
    icon: '◈',
    label: '팀 투표',
    desc: '링크 공유하면 팀원이 함께 골라요',
    color: 'green',
  },
]

export default function ModeSelect({ onSelect, onBack }) {
  return (
    <div className={s.wrap}>
      {onBack && (
        <button className={s.backBtn} onClick={onBack}>← 조건 다시 입력</button>
      )}
      <p className={s.label}>추천 방식 선택</p>
      <div className={s.grid}>
        {modes.map((m, i) => (
          <button
            key={m.id}
            className={`${s.card} ${s[m.color]}`}
            onClick={() => onSelect(m.id)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className={s.icon}>{m.icon}</span>
            <span className={s.textWrap}>
              <span className={s.cardLabel}>{m.label}</span>
              <span className={s.cardDesc}>{m.desc}</span>
            </span>
            <span className={s.arrow}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
