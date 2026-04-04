import { useState } from 'react'
import Head from 'next/head'
import ConditionForm from '../components/ConditionForm'
import ResultView from '../components/ResultView'
import RouletteView from '../components/RouletteView'
import VoteView from '../components/VoteView'
import WeatherWidget from '../components/WeatherWidget'
import s from '../styles/Home.module.css'

export default function Home() {
  const [step, setStep] = useState('form')
  const [activeTab, setActiveTab] = useState('recommend')
  const [conditions, setConditions] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [weatherCoords, setWeatherCoords] = useState({ lat: null, lon: null })

  const handleFormSubmit = (data) => {
    setConditions(data.conditions)
    setRestaurants(data.restaurants)
    setActiveTab('recommend')
    setStep('result')
  }

  const handleReset = () => {
    setConditions(null)
    setRestaurants([])
    setStep('form')
  }

  return (
    <>
      <Head>
        <title>점심 뭐 먹지 — LunchPick</title>
        <meta name="description" content="오늘 점심, AI가 골라드려요" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 타이틀 — overflow:hidden 영향 없도록 wrap 완전 바깥 배치 */}
      <div className={s.titleWrap}>
        <img src="/title.png" alt="오늘 점심 뭐 먹지?" className={s.titleImg} draggable={false} />
      </div>

      <div className={s.wrap}>
        {/* 날씨 위젯 — 스크롤 시 고정 */}
        <div className={s.weatherFixed}>
          <WeatherWidget lat={weatherCoords.lat} lon={weatherCoords.lon} />
        </div>

        <main className={s.main}>

          {/* Default Screen */}
          {step === 'form' && (
            <div className={s.modeWrap}>
              <ConditionForm onSubmit={handleFormSubmit} onPlaceSelect={setWeatherCoords} />
            </div>
          )}

          {/* After Search */}
          {step === 'result' && (
            <div className={s.resultWrap}>
              {/* 탭 바 — CSS 기반 */}
              <div className={s.tabBar}>
                <button className={`${s.tabBtn} ${activeTab === 'recommend' ? s.tabActive : ''}`} onClick={() => setActiveTab('recommend')}>실시간 추천</button>
                <button className={`${s.tabBtn} ${activeTab === 'roulette' ? s.tabActive : ''}`} onClick={() => setActiveTab('roulette')}>랜덤 룰렛</button>
                <button className={`${s.tabBtn} ${activeTab === 'vote' ? s.tabActive : ''}`} onClick={() => setActiveTab('vote')}>우리 팀 투표</button>
              </div>

              {/* 조건 칩 — Condition.png 스타일 */}
              <div className={s.conditionChips}>
                <span className={s.condChip}>{conditions?.location}</span>
                <span className={s.condChip}>{conditions?.count}</span>
                <span className={s.condChip}>{conditions?.style}</span>
              </div>

              {/* 탭 콘텐츠 */}
              <div className={s.tabContent}>
                {activeTab === 'recommend' && (
                  <ResultView key="recommend" conditions={conditions} restaurants={restaurants} onReset={handleReset} />
                )}
                {activeTab === 'roulette' && (
                  <RouletteView key="roulette" conditions={conditions} restaurants={restaurants} onReset={handleReset} />
                )}
                {activeTab === 'vote' && (
                  <VoteView key="vote" conditions={conditions} restaurants={restaurants} onReset={handleReset} />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
