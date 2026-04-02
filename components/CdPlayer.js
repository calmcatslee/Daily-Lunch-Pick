import { useState, useRef, useEffect } from 'react'
import s from '../styles/CdPlayer.module.css'

export default function CdPlayer() {
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onCanPlay = () => setLoaded(true)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('canplaythrough', onCanPlay)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('canplaythrough', onCanPlay)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <div className={s.wrap}>
      <audio ref={audioRef} src="/music/lunch.mp3" preload="auto" />

      <button
        className={`${s.btn} ${playing ? s.spinning : ''} ${!loaded ? s.unloaded : ''}`}
        onClick={toggle}
        title={playing ? '일시정지' : '재생'}
        aria-label={playing ? '음악 일시정지' : '음악 재생'}
      >
        <img
          src="/cdplayer.png"
          alt="CD Player"
          className={s.img}
          draggable={false}
        />
        <span className={`${s.playIcon} ${playing ? s.hide : ''}`}>▶</span>
        <span className={`${s.pauseIcon} ${playing ? '' : s.hide}`}>❚❚</span>
      </button>

      {playing && (
        <div className={s.nowPlaying}>
          <span className={s.dot} />
          <span className={s.nowText}>밥 먹을 시간~</span>
        </div>
      )}
    </div>
  )
}
