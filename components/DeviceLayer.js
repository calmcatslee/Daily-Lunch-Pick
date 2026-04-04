'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import s from '../styles/DeviceLayer.module.css'

function playSound(ref) {
  if (!ref.current) return
  ref.current.currentTime = 0
  ref.current.play().catch(() => {})
}

function usePagerTyping(full = 'NO MESSAGE') {
  const [text, setText] = useState('')
  useEffect(() => {
    let i = 0
    let deleting = false
    let timerId = null
    const tick = () => {
      if (!deleting) {
        i++
        setText(full.slice(0, i))
        if (i === full.length) {
          deleting = true
          timerId = setTimeout(tick, 1200)
          return
        }
      } else {
        i--
        setText(full.slice(0, i))
        if (i === 0) {
          deleting = false
          timerId = setTimeout(tick, 400)
          return
        }
      }
      timerId = setTimeout(tick, deleting ? 60 : 110)
    }
    timerId = setTimeout(tick, 800)
    return () => clearTimeout(timerId)
  }, [full])
  return text
}

export default function DeviceLayer() {
  // CD
  const [cdHovered, setCdHovered] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const cdAudioRef = useRef(null)

  useEffect(() => {
    const audio = cdAudioRef.current
    if (!audio) return
    if (musicEnabled && !cdHovered) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [cdHovered, musicEnabled])

  const handleCdClick = useCallback(() => {
    setMusicEnabled(prev => !prev)
  }, [])

  // Pager
  const pagerText = usePagerTyping('NO MESSAGE')
  const pagerBeepRef = useRef(null)

  // Tincase
  const [tincaseOpen, setTincaseOpen] = useState(false)
  const tincaseTapRef = useRef(null)

  const handleTincaseClick = useCallback(() => {
    playSound(tincaseTapRef)
    setTincaseOpen(prev => !prev)
  }, [])

  // Musicplayer (musicplayer.png은 유지, mp3player 오버레이만 제거)
  const mpClickRef = useRef(null)

  // Gameboy — hover video + sound
  const [gameboyHovered, setGameboyHovered] = useState(false)
  const gameboyVideoRef = useRef(null)
  const gameboySongRef = useRef(null)

  useEffect(() => {
    const video = gameboyVideoRef.current
    const audio = gameboySongRef.current
    if (!video) return
    if (gameboyHovered) {
      video.play().catch(() => {})
      audio?.play().catch(() => {})
    } else {
      video.pause()
      if (audio) { audio.pause(); audio.currentTime = 0 }
    }
  }, [gameboyHovered])

  // Mobile: 모서리 탭하면 디바이스 보이기
  const [mobileReveal, setMobileReveal] = useState({
    pager: false, gameboy: false, tincase: false, musicplayer: false
  })

  const toggleMobileDevice = (name) => {
    setMobileReveal(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className={s.layer} aria-hidden="true">

      {/* 사운드 */}
      <audio ref={cdAudioRef} src="/sounds/cd_backgroundmusic.mp3" loop preload="auto" />
      <audio ref={pagerBeepRef} src="/sounds/pager_beep.mp3" preload="auto" />
      <audio ref={tincaseTapRef} src="/sounds/tincase_tap.mp3" preload="auto" />
      <audio ref={mpClickRef} src="/sounds/musicplayer_click.mp3" preload="auto" />
      <audio ref={gameboySongRef} src="/sounds/gameboy_song.mp3" preload="auto" />

      {/* ── CD ── */}
      <div
        className={`${s.device} ${s.cd} ${cdHovered ? s.cdHovered : ''}`}
        onMouseEnter={() => setCdHovered(true)}
        onMouseLeave={() => setCdHovered(false)}
        onClick={handleCdClick}
        title={musicEnabled ? '클릭하면 음악 꺼짐' : '클릭하면 음악 켜짐'}
      >
        <img
          src="/devices/cd.png"
          alt="CD"
          className={`${s.cdImg} ${musicEnabled && !cdHovered ? s.spinning : ''}`}
          draggable={false}
        />
        <div className={`${s.cdLabel} ${musicEnabled ? s.cdLabelOn : ''}`}>
          {musicEnabled ? '♪' : '♩'}
        </div>
      </div>

      {/* ── Pager ── */}
      <div
        className={`${s.device} ${s.pager} ${mobileReveal.pager ? s.mobileShow : ''}`}
        onClick={() => playSound(pagerBeepRef)}
        title="클릭하면 삐삐!"
      >
        <div className={s.pagerWrap}>
          <img src="/devices/pager.png" alt="pager" className={s.pagerImg} draggable={false} />
          <div className={s.pagerScreen}>
            <span className={s.pagerText}>
              {pagerText}<span className={s.cursor}>_</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Gameboy — hover video ── */}
      <div
        className={`${s.device} ${s.gameboy} ${mobileReveal.gameboy ? s.mobileShow : ''}`}
        onMouseEnter={() => setGameboyHovered(true)}
        onMouseLeave={() => setGameboyHovered(false)}
      >
        <img
          src="/devices/gameboy.png"
          alt="Game Boy Color"
          className={s.gameboyImg}
          draggable={false}
          style={{ display: gameboyHovered ? 'none' : 'block' }}
        />
        <video
          ref={gameboyVideoRef}
          src="/devices/gameboy.mp4"
          className={s.gameboyImg}
          style={{ display: gameboyHovered ? 'block' : 'none' }}
          loop
          muted={false}
          playsInline
        />
      </div>

      {/* ── Tincase ── */}
      <div
        className={`${s.device} ${s.tincase} ${mobileReveal.tincase ? s.mobileShow : ''}`}
        onClick={handleTincaseClick}
        title="클릭해봐"
      >
        <img
          src={tincaseOpen ? '/devices/tincase1.png' : '/devices/tincase0.png'}
          alt="tin case"
          className={s.tincaseImg}
          draggable={false}
        />
      </div>

      {/* ── Musicplayer ── */}
      <div
        className={`${s.device} ${s.musicplayer} ${mobileReveal.musicplayer ? s.mobileShow : ''}`}
        onClick={() => playSound(mpClickRef)}
        title="클릭해봐"
      >
        <img
          src="/devices/musicplayer.png"
          alt="music player"
          className={s.musicplayerImg}
          draggable={false}
        />
      </div>

      {/* ── 모바일 코너 탭 버튼 ── */}
      <button className={`${s.cornerBtn} ${s.cornerTL}`} onClick={() => toggleMobileDevice('pager')} aria-label="페이저" />
      <button className={`${s.cornerBtn} ${s.cornerBL}`} onClick={() => toggleMobileDevice('gameboy')} aria-label="게임보이" />
      <button className={`${s.cornerBtn} ${s.cornerTR}`} onClick={() => toggleMobileDevice('tincase')} aria-label="틴케이스" />
      <button className={`${s.cornerBtn} ${s.cornerBR}`} onClick={() => toggleMobileDevice('musicplayer')} aria-label="뮤직플레이어" />

    </div>
  )
}
