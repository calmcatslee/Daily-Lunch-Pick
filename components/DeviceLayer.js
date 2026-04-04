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

  // Gameboy — click press animation only
  const [gameboyPressed, setGameboyPressed] = useState(false)

  const handleGameboyClick = useCallback(() => {
    setGameboyPressed(true)
    setTimeout(() => setGameboyPressed(false), 200)
  }, [])

  return (
    <div className={s.layer} aria-hidden="true">

      {/* 사운드 */}
      <audio ref={cdAudioRef} src="/sounds/cd_backgroundmusic.mp3" loop preload="auto" />
      <audio ref={pagerBeepRef} src="/sounds/pager_beep.mp3" preload="auto" />
      <audio ref={tincaseTapRef} src="/sounds/tincase_tap.mp3" preload="auto" />
      <audio ref={mpClickRef} src="/sounds/musicplayer_click.mp3" preload="auto" />

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
        className={`${s.device} ${s.pager}`}
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

      {/* ── Gameboy — click press animation ── */}
      <div
        className={`${s.device} ${s.gameboy}`}
        onClick={handleGameboyClick}
        title="클릭해봐"
      >
        <img
          src="/devices/gameboy.png"
          alt="Game Boy Color"
          className={`${s.gameboyImg} ${gameboyPressed ? s.gameboyPressed : ''}`}
          draggable={false}
        />
      </div>

      {/* ── Tincase ── */}
      <div
        className={`${s.device} ${s.tincase}`}
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
        className={`${s.device} ${s.musicplayer}`}
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

      {/* ── Nokia Phone — 375px only ── */}
      <div className={`${s.device} ${s.nokia}`}>
        <img
          src="/devices/nokiaphone_375.png"
          alt="Nokia phone"
          className={s.nokiaImg}
          draggable={false}
        />
      </div>

    </div>
  )
}
