import { useCallback, useEffect, useRef, useState } from 'react'
import { SeededRng } from '../game-core/rng'
import mascot from '../assets/mascot/nowin-mascot.png'
import type { ActiveGameProps } from './GameShell'

// The playfield intentionally follows the familiar 288 × 512 vertical arcade
// proportion: a small fixed flyer, broad capped pipes, and a 100-ish pixel gap.
const WIDTH = 288
const HEIGHT = 512
const GROUND_Y = 400
const TOTAL = 25
const BIRD_X = 60
const BIRD_RADIUS = 16
const PIPE_WIDTH = 52
const SCROLL_SPEED = 2.35
const FLAP_VELOCITY = -5.05
const GRAVITY = 0.29

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
  done: boolean
  inputs: string[]
  betrayalSeen: boolean
}

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value))
const gapSizeFor = (gate: Gate) => gate.id >= 20 ? 96 : 108
const pipeGapBounds = (gapSize: number) => ({ minimum: 55 + gapSize / 2, maximum: GROUND_Y - 30 - gapSize / 2 })

function makeGates(seed: number): Gate[] {
  const rng = new SeededRng(seed)
  return Array.from({ length: TOTAL }, (_, id) => {
    const size = id >= 20 ? 96 : 108
    const bounds = pipeGapBounds(size)
    const gap = bounds.minimum + rng.next() * (bounds.maximum - bounds.minimum)
    return { id, x: 330 + id * 148, gap, targetGap: gap, scored: false, shifted: false }
  })
}

function freshState(seed: number): FlapState {
  return { y: HEIGHT / 2, velocity: 0, gates: makeGates(seed), score: 0, done: false, inputs: [], betrayalSeen: false }
}

function pipeMoveShouldTrigger(gate: Gate, birdY: number): boolean {
  // In the final run, NOWIN watches a clean approach. The selected pipes flash
  // before moving their opening away, so recovery is possible but not obvious.
  return (gate.id === 20 || gate.id === 22) && !gate.shifted && gate.x < 190 && gate.x > BIRD_X + 36 && Math.abs(birdY - gate.gap) < 30
}

function Pipe({ gate }: { gate: Gate }) {
  const size = gapSizeFor(gate)
  const top = gate.gap - size / 2
  const bottom = gate.gap + size / 2
  const late = gate.id >= 20
  const pipeFill = late ? '#79c95e' : '#62bd5a'
  const capFill = late ? '#b0e978' : '#8bdd64'
  return <g className={gate.shifted ? 'flap-pipe flap-pipe--shifted' : 'flap-pipe'}>
    <rect x={gate.x} y="0" width={PIPE_WIDTH} height={top} fill={pipeFill} stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x - 4} y={top - 15} width={PIPE_WIDTH + 8} height="18" rx="2" fill={capFill} stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x} y={bottom} width={PIPE_WIDTH} height={GROUND_Y - bottom} fill={pipeFill} stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x - 4} y={bottom - 3} width={PIPE_WIDTH + 8} height="18" rx="2" fill={capFill} stroke="#172337" strokeWidth="3"/>
    <path d={`M${gate.x + 10} 0v${Math.max(0, top - 24)}M${gate.x + PIPE_WIDTH - 10} ${bottom + 22}v${Math.max(0, GROUND_Y - bottom - 36)}`} stroke="#dcffad" strokeWidth="4" opacity=".62"/>
    {late && <path d={`M${gate.x + PIPE_WIDTH / 2} ${gate.gap - 10}l8 10-8 10-8-10z`} fill="#ff4fa3" stroke="#172337" strokeWidth="2"/>}
  </g>
}

export function FlapGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const game = useRef<FlapState>(freshState(seed))
  const [view, setView] = useState(game.current)
  const [warning, setWarning] = useState(false)
  const last = useRef(0)
  const warningTimer = useRef<number | null>(null)

  useEffect(() => {
    game.current = freshState(seed)
    last.current = 0
    if (warningTimer.current !== null) window.clearTimeout(warningTimer.current)
    setWarning(false)
    setView({ ...game.current, gates: [...game.current.gates] })
  }, [seed])

  useEffect(() => () => {
    if (warningTimer.current !== null) window.clearTimeout(warningTimer.current)
  }, [])

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
          const movement = Math.sign(gate.targetGap - gate.gap) * Math.min(Math.abs(gate.targetGap - gate.gap), 3.4 * delta)
          gate.gap += movement
        }
        if (pipeMoveShouldTrigger(gate, current.y)) {
          const bounds = pipeGapBounds(gapSizeFor(gate))
          const direction = current.y < gate.gap ? 1 : -1
          gate.targetGap = clamp(gate.gap + direction * 38, bounds.minimum, bounds.maximum)
          gate.shifted = true
          current.betrayalSeen = true
          current.inputs.push(`nowin:pipe-${gate.id}-${direction > 0 ? 'drops' : 'rises'}`)
          setWarning(true)
          if (warningTimer.current !== null) window.clearTimeout(warningTimer.current)
          warningTimer.current = window.setTimeout(() => setWarning(false), 700)
        }
      })

      if (current.y - BIRD_RADIUS < 0 || current.y + BIRD_RADIUS > GROUND_Y) {
        current.done = true
        onFinish({ result: 'lost', score: current.score, detail: 'Gravity remains undefeated.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
        return
      }

      for (const gate of current.gates) {
        const gapSize = gapSizeFor(gate)
        const top = gate.gap - gapSize / 2
        const bottom = gate.gap + gapSize / 2
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
            current.done = true
            onFinish({ result: 'won', score: TOTAL, detail: 'Twenty-five pipes. You made it through.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
            return
          }
        }
      }

      setView({ ...current, gates: [...current.gates] })
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [onFinish, paused])

  useEffect(() => setHud(`${view.score}/${TOTAL} GATES`), [setHud, view.score])

  const birdTilt = clamp(view.velocity * 3.1, -22, 62)
  return <div className={`flap-game ${warning ? 'flap-game--warning' : ''}`}>
    <p className="game-tip">Tap or press space to flap. A pink warning in the final stretch means a pipe is about to move its gap.</p>
    <div className="flap-stage" onPointerDown={flap} role="application" aria-label="Flap game">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flap-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#70d9ef"/><stop offset="1" stopColor="#d2f8f0"/></linearGradient>
          <pattern id="flap-clouds" width="144" height="94" patternUnits="userSpaceOnUse"><path d="M14 53c0-9 7-16 16-16 7 0 12 3 15 9 2-2 5-3 9-3 9 0 16 7 16 16H14z" fill="#fff8e8" opacity=".76"/></pattern>
          <clipPath id="flap-mascot-mask"><circle cx="0" cy="0" r="17"/></clipPath>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#flap-sky)"/>
        <rect width={WIDTH} height={GROUND_Y} fill="url(#flap-clouds)" opacity=".75"/>
        <circle cx="238" cy="58" r="20" fill="#ffe45c" stroke="#172337" strokeWidth="3"/>
        <g fill="#8dcc8f" stroke="#172337" strokeWidth="2" opacity=".83"><path d={`M0 ${GROUND_Y - 58}h18v-25h14v25h17v-43h20v43h15v-18h17v18h21v-33h17v33h21v-25h18v25h19v-45h16v45h19v-22h18v22h22v58H0z`}/></g>
        {view.gates.map(gate => <Pipe key={gate.id} gate={gate}/>) }
        <g transform={`translate(${BIRD_X} ${view.y}) rotate(${birdTilt})`}>
          <circle r="20" fill="#fff8e8" stroke="#172337" strokeWidth="3"/>
          <g clipPath="url(#flap-mascot-mask)"><image href={mascot} x="-36" y="-26" width="72" height="82" preserveAspectRatio="xMidYMid meet"/></g>
          <circle r="17" fill="none" stroke="#fff8e8" strokeWidth="2" opacity=".9"/>
        </g>
        <rect y={GROUND_Y} width={WIDTH} height={HEIGHT - GROUND_Y} fill="#e8c063" stroke="#172337" strokeWidth="3"/>
        <rect y={GROUND_Y} width={WIDTH} height="12" fill="#83d65b" stroke="#172337" strokeWidth="3"/>
        <path d={`M0 ${GROUND_Y + 35}h${WIDTH}M0 ${GROUND_Y + 76}h${WIDTH}`} stroke="#d39f48" strokeWidth="3" strokeDasharray="8 7" opacity=".72"/>
        <text x={WIDTH / 2} y="69" textAnchor="middle" fontSize="46" fontWeight="900" fill="#fff8e8" stroke="#172337" strokeWidth="3" paintOrder="stroke">{view.score}</text>
        {warning && <g transform="translate(69 22)"><rect width="150" height="28" rx="7" fill="#ff4fa3" stroke="#172337" strokeWidth="3"/><text x="75" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#172337">PIPE PANIC!</text></g>}
      </svg>
    </div>
  </div>
}
