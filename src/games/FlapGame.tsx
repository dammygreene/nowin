import { useCallback, useEffect, useRef, useState } from 'react'
import { SeededRng } from '../game-core/rng'
import mascot from '../assets/mascot/nowin-mascot.png'
import type { ActiveGameProps } from './GameShell'

const WIDTH = 820
const HEIGHT = 430
const TOTAL = 25
const BIRD_X = 154
const BIRD_RADIUS = 23
const PIPE_WIDTH = 66
const SCROLL_SPEED = 2.75
const FLAP_VELOCITY = -6.25
const GRAVITY = 0.34

type Gate = {
  id: number
  x: number
  gap: number
  targetGap: number
  scored: boolean
  shifted: boolean
}

type FlapState = {
  y: number
  velocity: number
  gates: Gate[]
  score: number
  finishX: number | null
  done: boolean
  inputs: string[]
  betrayalSeen: boolean
}

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value))
const gapSizeFor = (gate: Gate) => gate.id >= 20 ? 118 : 142
const pipeGapBounds = (gapSize: number) => ({ minimum: 72 + gapSize / 2, maximum: HEIGHT - 82 - gapSize / 2 })

function makeGates(seed: number): Gate[] {
  const rng = new SeededRng(seed)
  return Array.from({ length: TOTAL }, (_, id) => {
    const size = id >= 20 ? 118 : 142
    const bounds = pipeGapBounds(size)
    return {
      id,
      x: 470 + id * 164,
      gap: bounds.minimum + rng.next() * (bounds.maximum - bounds.minimum),
      targetGap: 0,
      scored: false,
      shifted: false
    }
  }).map(gate => ({ ...gate, targetGap: gate.gap }))
}

function freshState(seed: number): FlapState {
  return { y: HEIGHT / 2, velocity: 0, gates: makeGates(seed), score: 0, finishX: null, done: false, inputs: [], betrayalSeen: false }
}

function pipeMoveShouldTrigger(gate: Gate, birdY: number): boolean {
  // The last stretch is NOWIN's tell: when the head is confidently centred in
  // a late gap, the pipe gives one visible pink warning then moves away.
  return (gate.id === 20 || gate.id === 22) && !gate.shifted && gate.x < 335 && gate.x > BIRD_X + 42 && Math.abs(birdY - gate.gap) < 40
}

function Pipe({ gate }: { gate: Gate }) {
  const size = gapSizeFor(gate)
  const top = gate.gap - size / 2
  const bottom = gate.gap + size / 2
  const late = gate.id >= 20
  const pipeFill = late ? '#7fce67' : '#5fbe68'
  const capFill = late ? '#b6ef72' : '#8be36b'
  return <g className={gate.shifted ? 'flap-pipe flap-pipe--shifted' : 'flap-pipe'}>
    <rect x={gate.x} y="0" width={PIPE_WIDTH} height={top} rx="9" fill={pipeFill} stroke="#172337" strokeWidth="7"/>
    <rect x={gate.x - 8} y={top - 17} width={PIPE_WIDTH + 16} height="20" rx="6" fill={capFill} stroke="#172337" strokeWidth="6"/>
    <rect x={gate.x} y={bottom} width={PIPE_WIDTH} height={HEIGHT - bottom - 53} rx="9" fill={pipeFill} stroke="#172337" strokeWidth="7"/>
    <rect x={gate.x - 8} y={bottom - 3} width={PIPE_WIDTH + 16} height="20" rx="6" fill={capFill} stroke="#172337" strokeWidth="6"/>
    <path d={`M${gate.x + 14} 18v${Math.max(0, top - 50)}M${gate.x + PIPE_WIDTH - 14} ${bottom + 30}v${Math.max(0, HEIGHT - bottom - 105)}`} stroke="#e5ff9e" strokeWidth="7" strokeLinecap="round" opacity=".55"/>
    {late && <path d={`M${gate.x + PIPE_WIDTH / 2} ${gate.gap - 15}l12 15-12 15-12-15z`} fill="#ff4fa3" stroke="#172337" strokeWidth="4"/>}
  </g>
}

export function FlapGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const game = useRef<FlapState>(freshState(seed))
  const [view, setView] = useState(game.current)
  const [warning, setWarning] = useState(false)
  const last = useRef(0)

  useEffect(() => {
    game.current = freshState(seed)
    last.current = 0
    setWarning(false)
    setView({ ...game.current, gates: [...game.current.gates] })
  }, [seed])

  const flap = useCallback(() => {
    if (paused || game.current.done) return
    game.current.velocity = FLAP_VELOCITY
    game.current.inputs.push('flap')
  }, [paused])

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'ArrowUp') {
        event.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [flap])

  useEffect(() => {
    let frame = 0
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (paused || game.current.done) return
      const delta = Math.min(28, now - last.current || 16) / 16
      last.current = now
      const current = game.current
      current.velocity += GRAVITY * delta
      current.y += current.velocity * delta

      current.gates.forEach(gate => {
        gate.x -= SCROLL_SPEED * delta
        if (gate.gap !== gate.targetGap) {
          const movement = Math.sign(gate.targetGap - gate.gap) * Math.min(Math.abs(gate.targetGap - gate.gap), 4.2 * delta)
          gate.gap += movement
        }
        if (pipeMoveShouldTrigger(gate, current.y)) {
          const size = gapSizeFor(gate)
          const bounds = pipeGapBounds(size)
          const direction = current.y < gate.gap ? 1 : -1
          gate.targetGap = clamp(gate.gap + direction * 54, bounds.minimum, bounds.maximum)
          gate.shifted = true
          current.betrayalSeen = true
          current.inputs.push(`nowin:pipe-${gate.id}-${direction > 0 ? 'drops' : 'rises'}`)
          setWarning(true)
          window.setTimeout(() => setWarning(false), 720)
        }
      })

      if (current.y - BIRD_RADIUS < 0 || current.y + BIRD_RADIUS > HEIGHT - 52) {
        current.done = true
        onFinish({ result: 'lost', score: current.score, detail: 'Gravity remains undefeated.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
        return
      }

      for (const gate of current.gates) {
        const size = gapSizeFor(gate)
        const top = gate.gap - size / 2
        const bottom = gate.gap + size / 2
        const overlapsPipe = gate.x < BIRD_X + BIRD_RADIUS && gate.x + PIPE_WIDTH > BIRD_X - BIRD_RADIUS
        if (overlapsPipe && (current.y - BIRD_RADIUS < top || current.y + BIRD_RADIUS > bottom)) {
          current.done = true
          onFinish({ result: 'lost', score: current.score, detail: gate.shifted ? 'The pipe moved when you were ready. It was not subtle.' : 'Pipe says no.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
          return
        }
        if (!gate.scored && gate.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
          gate.scored = true
          current.score++
          if (current.score === TOTAL) {
            current.finishX = WIDTH + 70
            current.inputs.push('finish-dock')
          }
        }
      }

      if (current.finishX !== null) {
        current.finishX -= SCROLL_SPEED * delta
        const platformTop = HEIGHT - 96
        const overPlatform = current.finishX < BIRD_X + BIRD_RADIUS && current.finishX + 170 > BIRD_X - BIRD_RADIUS
        const landing = current.y + BIRD_RADIUS >= platformTop && current.y + BIRD_RADIUS <= platformTop + 22 && current.velocity >= 0
        if (overPlatform && landing) {
          current.done = true
          onFinish({ result: 'won', score: TOTAL, detail: 'Twenty-five gates, then a clean landing. Disgusting.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
          return
        }
        if (current.finishX + 170 < BIRD_X - BIRD_RADIUS) {
          current.done = true
          onFinish({ result: 'lost', score: TOTAL, detail: 'You passed every pipe and missed the dock.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
          return
        }
      }

      setView({ ...current, gates: [...current.gates] })
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [onFinish, paused])

  useEffect(() => setHud(view.finishX !== null ? 'LAND ON THE NOWIN DOCK' : `${view.score}/${TOTAL} GATES`), [setHud, view.finishX, view.score])

  const birdTilt = clamp(view.velocity * 1.75, -26, 54)
  return <div className={`flap-game ${warning ? 'flap-game--warning' : ''}`}>
    <p className="game-tip">Tap or press space to flap. In the final stretch, a pink pipe warning means the gap is about to dodge your line.</p>
    <div className="flap-stage" onPointerDown={flap} role="application" aria-label="Flap game">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flap-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7be6f2"/><stop offset="1" stopColor="#b8f5f0"/></linearGradient>
          <pattern id="flap-clouds" width="180" height="110" patternUnits="userSpaceOnUse"><path d="M14 50c0-11 9-20 21-20 8 0 15 4 18 11 3-3 7-4 11-4 11 0 20 9 20 20H14z" fill="#fff8e8" opacity=".8"/></pattern>
          <clipPath id="flap-mascot-mask"><circle cx="0" cy="0" r="31"/></clipPath>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#flap-sky)"/>
        <rect width={WIDTH} height={HEIGHT - 48} fill="url(#flap-clouds)" opacity=".72"/>
        <circle cx="690" cy="72" r="32" fill="#ffe45c" stroke="#172337" strokeWidth="6"/>
        <path d={`M0 ${HEIGHT - 104}L90 ${HEIGHT - 136}l92 33 111-49 112 49 112-37 90 37 103-57 110 57v58H0z`} fill="#77c86b" stroke="#172337" strokeWidth="6"/>
        {view.gates.map(gate => <Pipe key={gate.id} gate={gate}/>) }
        {view.finishX !== null && <g transform={`translate(${view.finishX} ${HEIGHT - 96})`}><rect x="0" y="0" width="170" height="22" rx="10" fill="#ff4fa3" stroke="#172337" strokeWidth="6"/><path d="M20 0v-29h19l10 12 10-12h19v29" fill="#ffe45c" stroke="#172337" strokeWidth="5"/><text x="88" y="15" textAnchor="middle" fontSize="10" fontWeight="900" fill="#172337">NOWIN DOCK</text></g>}
        {warning && <g transform="translate(294 24)"><rect width="232" height="38" rx="10" fill="#ff4fa3" stroke="#172337" strokeWidth="5"/><text x="116" y="25" textAnchor="middle" fontSize="15" fontWeight="900" fill="#172337">PIPE PANIC!</text></g>}
        <g transform={`translate(${BIRD_X} ${view.y}) rotate(${birdTilt})`}>
          <circle r="35" fill="#fff8e8" stroke="#172337" strokeWidth="6"/>
          <g clipPath="url(#flap-mascot-mask)"><image href={mascot} x="-55" y="-40" width="110" height="125" preserveAspectRatio="xMidYMid meet"/></g>
          <circle r="31" fill="none" stroke="#fff8e8" strokeWidth="3" opacity=".85"/>
          <path d="M27 2l18 7-17 8z" fill="#ffcf3c" stroke="#172337" strokeWidth="4"/>
        </g>
        <rect y={HEIGHT - 52} width={WIDTH} height="52" fill="#ffe45c" stroke="#172337" strokeWidth="6"/>
        <path d={`M0 ${HEIGHT - 30}h${WIDTH}`} stroke="#fff8e8" strokeWidth="7" strokeDasharray="18 14"/>
        <text x="26" y="42" fontSize="28" fontWeight="900" fill="#172337" stroke="#fff8e8" strokeWidth="3" paintOrder="stroke">{view.score}</text>
      </svg>
      <button className="flap-tap" aria-label="Flap">TAP / SPACE</button>
    </div>
  </div>
}
