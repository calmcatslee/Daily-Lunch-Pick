import { useState, useEffect } from 'react'
import s from '../styles/WeatherWidget.module.css'

const weatherInfo = (code) => {
  if (code === 0)  return { icon: '☀️', text: '맑음' }
  if (code <= 3)   return { icon: '⛅', text: '구름조금' }
  if (code <= 48)  return { icon: '🌫️', text: '안개' }
  if (code <= 55)  return { icon: '🌦️', text: '이슬비' }
  if (code <= 65)  return { icon: '🌧️', text: '비' }
  if (code <= 75)  return { icon: '❄️', text: '눈' }
  if (code <= 82)  return { icon: '🌦️', text: '소나기' }
  if (code <= 99)  return { icon: '⛈️', text: '천둥번개' }
  return { icon: '🌥️', text: '흐림' }
}

const windDirText = (deg) => {
  const dirs = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return dirs[Math.round(deg / 45) % 8]
}

const dustLevel = (pm25) => {
  if (pm25 <= 15) return { text: '좋음', color: '#2bb54e' }
  if (pm25 <= 35) return { text: '보통', color: '#f0a500' }
  if (pm25 <= 75) return { text: '나쁨', color: '#e05c00' }
  return { text: '매우나쁨', color: '#c0003c' }
}

export default function WeatherWidget({ lat, lon }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!lat || !lon) {
      // 브라우저 위치 권한 요청
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => {} // 거부 시 아무것도 안 보여줌
        )
      }
      return
    }
    fetchWeather(lat, lon)
  }, [lat, lon])

  const fetchWeather = async (la, lo) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/weather?lat=${la}&lon=${lo}`)
      const json = await res.json()
      if (!json.error) setData(json)
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div className={s.wrap}>
      <div className={s.skeleton} />
    </div>
  )
  if (!data) return null

  const { icon, text } = weatherInfo(data.weatherCode)
  const dust = dustLevel(data.pm25)

  return (
    <div className={s.wrap}>
      <span className={s.weatherLabel}>오늘 날씨</span>
      <div className={s.chip}>
        <span className={s.icon}>{icon}</span>
        <span className={s.temp}>{data.temp}°C</span>
        <span className={s.label}>{text}</span>
      </div>
      <div className={s.divider} />
      <div className={s.chip}>
        <span className={s.windIcon}>💨</span>
        <span className={s.label}>{windDirText(data.windDir)}풍</span>
        <span className={s.sub}>{data.windSpeed}m/s</span>
      </div>
      <div className={s.divider} />
      <div className={s.chip}>
        <span className={s.dustDot} style={{ background: dust.color }} />
        <span className={s.label}>미세먼지</span>
        <span className={s.dustText} style={{ color: dust.color }}>{dust.text}</span>
      </div>
    </div>
  )
}
