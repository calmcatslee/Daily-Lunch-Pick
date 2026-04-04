import { useState, useEffect, useRef, useCallback } from 'react'
import s from '../styles/ConditionForm.module.css'

const STYLES = [
  { id: '트렌디한', label: '트렌디한', desc: '요즘 애들은 뭐 좋아하나~?' },
  { id: '무난무난', label: '무난무난', desc: '오늘은 그냥 무난하게 가자~' },
  { id: '든든하게', label: '든든하게', desc: '한국인은 밥심이지~🍚' },
  { id: '취향존중', label: '취향존중', desc: '팀원마다 취향이 달라요😵‍💫' },
]
const COUNTS = ['혼밥', '2~3명', '4~6명', '단체(7+)']

function Highlight({ text, query }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className={s.highlight}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function ConditionForm({ onSubmit, onPlaceSelect }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestState, setSuggestState] = useState('idle')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [style, setStyle] = useState('')
  const [count, setCount] = useState('')

  const suggestTimer = useRef(null)
  const wrapRef = useRef(null)
  const justSelected = useRef(false)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    if (justSelected.current) { justSelected.current = false; return }
    if (query.length < 1) {
      setSuggestions([]); setShowDropdown(false); setSuggestState('idle'); return
    }
    setSuggestState('loading')
    setShowDropdown(true)
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.kakaoError) {
          setError(`검색 오류: ${data.kakaoError}`)
          setSuggestState('error')
          setShowDropdown(false)
          return
        }
        setSuggestions(data.places || [])
        setSuggestState('done')
        setShowDropdown(true)
      } catch {
        setSuggestions([]); setSuggestState('error')
        setError('API 연결 오류가 발생했어요.')
      }
    }, 150)
  }, [query])

  const handleSelectPlace = (place) => {
    justSelected.current = true
    setQuery(place.name)
    setSelectedPlace(place)
    setShowDropdown(false)
    setSuggestions([])
    setError('')
    onPlaceSelect?.({ lat: place.lat, lon: place.lon })
  }

  const canSubmit = selectedPlace && style && count && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(
        `/api/search?lat=${selectedPlace.lat}&lon=${selectedPlace.lon}&name=${encodeURIComponent(selectedPlace.name)}&style=${encodeURIComponent(style)}`
      )
      const data = await res.json()
      if (data.documents?.length > 0) {
        onSubmit({
          conditions: { location: selectedPlace.name, style, count, lat: selectedPlace.lat, lon: selectedPlace.lon },
          restaurants: data.documents,
        })
      } else {
        setError(data.message || '도보 15분 내 음식점을 찾지 못했어요.')
      }
    } catch {
      setError('검색 중 오류가 발생했어요.')
    }
    setSubmitting(false)
  }

  const selectedStyle = STYLES.find(st => st.id === style)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 430)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div className={s.outer}>

      {/* ── 디바이스 프레임 (모바일: Nokia, 그 외: iBook) ── */}
      <div className={isMobile ? s.nokiaWrap : s.ibookWrap}>
        <img
          src={isMobile ? '/devices/nokiaphone_375.png' : '/ibook.png'}
          alt={isMobile ? 'Nokia N80' : 'iBook'}
          className={isMobile ? s.nokiaImg : s.ibookImg}
          draggable={false}
        />

        <div className={isMobile ? s.nokiaScreen : s.ibookScreen}>

          {/* 위치 */}
          <div className={s.section}>
            <div className={s.sectionLabel}>우리 팀 위치 📍</div>
            <div className={s.searchWrap} ref={wrapRef}>
              <div className={s.searchRow}>
                <input
                  className={`${s.searchInput} ${selectedPlace ? s.searchInputFilled : ''}`}
                  type="text"
                  placeholder="건물명, 지하철역 등 주소를 입력하세요"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedPlace(null); setError('') }}
                  onFocus={() => (suggestions.length > 0 || suggestState === 'loading') && setShowDropdown(true)}
                  autoComplete="off"
                  spellCheck={false}
                />
                {suggestState === 'loading' && <div className={s.searchSpinner} />}
                {selectedPlace && <span className={s.searchCheck}>✓</span>}
              </div>
              {showDropdown && (
                <ul className={s.dropdown}>
                  {suggestState === 'loading' && (
                    <li className={s.dropdownLoading}><div className={s.dotSpinner} />검색 중...</li>
                  )}
                  {suggestState === 'done' && suggestions.length === 0 && (
                    <li className={s.dropdownEmpty}>일치하는 장소가 없어요</li>
                  )}
                  {suggestions.map(place => (
                    <li key={place.id} className={s.dropdownItem} onMouseDown={() => handleSelectPlace(place)}>
                      <div className={s.dropdownMain}>
                        <span className={s.dropdownName}><Highlight text={place.name} query={query} /></span>
                        {place.category && <span className={s.dropdownCat}>{place.category}</span>}
                      </div>
                      {place.address && <div className={s.dropdownAddr}>{place.address}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 인원 수 */}
          <div className={s.section}>
            <div className={s.sectionLabel}>인원 수</div>
            <div className={s.chips}>
              {COUNTS.map(c => (
                <button
                  key={c}
                  className={`${s.chip} ${count === c ? s.chipActive : ''}`}
                  onClick={() => setCount(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 식사 스타일 */}
          <div className={s.section}>
            <div className={s.sectionLabel}>식사 스타일</div>
            <div className={s.chips}>
              {STYLES.map(st => (
                <button
                  key={st.id}
                  className={`${s.chip} ${style === st.id ? s.chipActive : ''}`}
                  onClick={() => setStyle(st.id)}
                >
                  {st.label}
                </button>
              ))}
            </div>
            {selectedStyle && (
              <div className={s.styleSubtext}>🌟 {selectedStyle.desc}</div>
            )}
          </div>

          {error && <p className={s.error}>{error}</p>}

        </div>{/* /screen */}
      </div>{/* /deviceWrap */}

      {/* ── 제출 버튼 (iBook 하단) ── */}
      <button className={s.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
        {submitting ? '음식점 찾는 중...' : '다음 →'}
      </button>

    </div>
  )
}
