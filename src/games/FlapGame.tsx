import { useCallback, useEffect, useRef, useState } from 'react'
import { SeededRng } from '../game-core/rng'
import mascot from '../assets/mascot/nowin-mascot.png'
import type { ActiveGameProps } from './GameShell'

// A logical, portrait playfield keeps the same game geometry at every CSS size.
// The figures deliberately follow the familiar 288 × 512 arcade composition,
// while the art and the sabotage are original COPECADE work.
const WIDTH = 288
const HEIGHT = 512
const GROUND_Y = 400
const TOTAL = 25
const BIRD_X = 60
const BIRD_RADIUS = 16
const PIPE_WIDTH = 52
const PIPE_SPACING = 148
const SCROLL_SPEED = 2.35
const FLAP_VELOCITY = -5.05
const GRAVITY = 0.29
const FINISH_WIDTH = 96
const FINISH_TOP = GROUND_Y - 48
const TELEGRAPH_FRAMES = 11

type Phase = 'ready' | 'running' | 'crashed' | 'landing' | 'won'
type SabotageState = 'idle' | 'telegraph' | 'moving' | 'done'
type ShiftDirection = -1 | 1

type Gate = {
  id: number
  x: number
  gap: number
  targetGap: number
  scored: boolean
  sabotage: SabotageState
  direction: ShiftDirection
  telegraphFrames: number
}

type FlapState = {
  y: number
  velocity: number
  gates: Gate[]
  score: number
  phase: Phase
  finishX: number | null
  elapsed: number
  scroll: number
  phaseElapsed: number
  done: boolean
  inputs: string[]
  betrayalSeen: boolean
}

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value))
const gapSizeFor = (gate: Gate) => gate.id >= 20 ? 96 : 108
const pipeGapBounds = (gapSize: number) => ({ minimum: 55 + gapSize / 2, maximum: GROUND_Y - 30 - gapSize / 2 })

// The first ten pairs are ordinary. The marked pairs form a learnable, seeded
// progression: small movements first, then larger but still signalled shifts.
const sabotageAmountFor = (gateId: number) => {
  if (gateId === 11 || gateId === 14) return 18
  if (gateId === 16 || gateId === 18) return 28
  if (gateId === 20 || gateId === 22 || gateId === 24) return 38
  return 0
}

function makeGates(seed: number): Gate[] {
  const rng = new SeededRng(seed)
  const gates: Gate[] = []
  let previousGap = HEIGHT / 2
  for (let id = 0; id < TOTAL; id++) {
    const size = id >= 20 ? 96 : 108
    const bounds = pipeGapBounds(size)
    // The opening pair is intentionally comfortable. After that, seeded
    // variation is bounded so the world reads as paced pipe pairs, not noise.
    const maximumStep = id < 3 ? 44 : 74
    const randomGap = previousGap + (rng.next() * 2 - 1) * maximumStep
    const gap = id === 0 ? 248 : clamp(randomGap, bounds.minimum, bounds.maximum)
    gates.push({ id, x: 330 + id * PIPE_SPACING, gap, targetGap: gap, scored: false, sabotage: 'idle', direction: 1, telegraphFrames: 0 })
    previousGap = gap
  }
  return gates
}

function freshState(seed: number): FlapState {
  return {
    y: HEIGHT / 2,
    velocity: 0,
    gates: makeGates(seed),
    score: 0,
    phase: 'ready',
    finishX: null,
    elapsed: 0,
    scroll: 0,
    phaseElapsed: 0,
    done: false,
    inputs: [],
    betrayalSeen: false
  }
}

function projectFlight(y: number, velocity: number, frames: number) {
  return y + velocity * frames + 0.5 * GRAVITY * frames * frames
}

function failureCopyFor(score: number) {
  return ['NOPE.', 'SKILL ISSUE.', 'BRO.', 'YOU WERE RIGHT THERE.', 'YOU REALLY THOUGHT.'][score % 5]
}

function recordInput(state: FlapState, input: string) {
  // Claims do not need an unbounded client event log. A full 25-pair run uses
  // far fewer than this cap, while a key-repeat cannot grow memory forever.
  if (state.inputs.length < 600) state.inputs.push(input)
}

function shouldTelegraph(gate: Gate, birdY: number, velocity: number) {
  const amount = sabotageAmountFor(gate.id)
  if (!amount || gate.sabotage !== 'idle') return false
  // At 190 logical pixels, the pair is roughly 0.8 seconds from contact. The
  // player sees an arrow for 11 frames before the pair moves, leaving a real
  // one-input response rather than a collision-time surprise.
  if (gate.x >= 190 || gate.x <= BIRD_X + PIPE_WIDTH + 20) return false
  const projected = projectFlight(birdY, velocity, 12)
  return Math.abs(projected - gate.gap) < 25
}

function pipeSignalColor(gate: Gate) {
  if (!sabotageAmountFor(gate.id)) return '#8bdd64'
  if (gate.sabotage === 'telegraph' || gate.sabotage === 'moving') return '#ff4fa3'
  return '#c4ef82'
}

function Pipe({ gate }: { gate: Gate }) {
  const size = gapSizeFor(gate)
  const top = gate.gap - size / 2
  const bottom = gate.gap + size / 2
  const marked = sabotageAmountFor(gate.id) > 0
  const shifting = gate.sabotage === 'telegraph' || gate.sabotage === 'moving'
  const arrow = gate.direction === 1 ? '↓' : '↑'
  return <g className={`flap-pipe ${shifting ? 'flap-pipe--shifting' : ''}`}>
    <rect x={gate.x} y="0" width={PIPE_WIDTH} height={top} fill="#62bd5a" stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x - 4} y={top - 15} width={PIPE_WIDTH + 8} height="18" rx="2" fill={pipeSignalColor(gate)} stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x} y={bottom} width={PIPE_WIDTH} height={GROUND_Y - bottom} fill="#62bd5a" stroke="#172337" strokeWidth="3"/>
    <rect x={gate.x - 4} y={bottom - 3} width={PIPE_WIDTH + 8} height="18" rx="2" fill={pipeSignalColor(gate)} stroke="#172337" strokeWidth="3"/>
    <path d={`M${gate.x + 10} 0v${Math.max(0, top - 24)}M${gate.x + PIPE_WIDTH - 10} ${bottom + 22}v${Math.max(0, GROUND_Y - bottom - 36)}`} stroke="#dcffad" strokeWidth="4" opacity=".62"/>
    {marked && <g transform={`translate(${gate.x + PIPE_WIDTH / 2} ${gate.gap})`}>
      <path d="M0-9l8 9-8 9-8-9z" fill={shifting ? '#ff4fa3' : '#ffe45c'} stroke="#172337" strokeWidth="2"/>
      {shifting && <text y="4" textAnchor="middle" fontSize="13" fontWeight="900" fill="#172337">{arrow}</text>}
    </g>}
  </g>
}

function Clouds({ scroll }: { scroll: number }) {
  const offset = -(scroll * 0.13 % 176)
  const cloud = (x: number, y: number, scale: number) => <path key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${scale})`} d="M0 21c0-10 8-18 18-18 8 0 15 4 18 11 3-3 8-5 13-5 11 0 20 9 20 20H0z" fill="#fff8e8" opacity=".78"/>
  return <g transform={`translate(${offset} 0)`}>{cloud(-10, 82, 1)}{cloud(102, 143, .7)}{cloud(226, 64, .85)}{cloud(342, 118, 1.05)}</g>
}

function Skyline({ scroll }: { scroll: number }) {
  const offset = -(scroll * 0.31 % 252)
  const city = (x: number) => <path key={x} transform={`translate(${x} 0)`} d={`M0 ${GROUND_Y - 58}h18v-25h14v25h17v-43h20v43h15v-18h17v18h21v-33h17v33h21v-25h18v25h19v-45h16v45h19v-22h18v22h22v58H0z`} />
  return <g transform={`translate(${offset} 0)`} fill="#8dcc8f" stroke="#172337" strokeWidth="2" opacity=".83">{city(-30)}{city(222)}{city(474)}</g>
}

function FinishPlatform({ x }: { x: number }) {
  return <g transform={`translate(${x} ${FINISH_TOP})`} className="flap-finish-platform"><rect x="0" y="0" width={FINISH_WIDTH} height="16" rx="6" fill="#ff4fa3" stroke="#172337" strokeWidth="3"/><path d="M10 0v-20h14l8 8 8-8h14v20" fill="#ffe45c" stroke="#172337" strokeWidth="3"/><text x="51" y="11" textAnchor="middle" fontSize="6" fontWeight="900" fill="#172337">COPECADE</text></g>
}

function MascotFlyer({ y, velocity, phase, elapsed, phaseElapsed }: Pick<FlapState, 'y' | 'velocity' | 'phase' | 'elapsed' | 'phaseElapsed'>) {
  const sprite = phase === 'ready' ? 'idle' : phase === 'crashed' ? 'dead' : phase === 'landing' || phase === 'won' ? 'win' : velocity < -1.1 ? 'flap-up' : velocity > 1.1 ? 'flap-down' : 'flap-mid'
  const idleBob = phase === 'ready' ? Math.sin(elapsed / 230) * 3 : 0
  const tilt = phase === 'crashed' ? clamp(18 + phaseElapsed * .17, 18, 88) : phase === 'landing' || phase === 'won' ? -8 + Math.sin(phaseElapsed / 70) * 3 : clamp(velocity * 3.1, -22, 62)
  const finOffset = sprite === 'flap-up' ? -5 : sprite === 'flap-down' ? 5 : 0
  const glow = sprite === 'win' ? '#ffe45c' : sprite === 'dead' ? '#ff4fa3' : '#fff8e8'
  return <g className={`flap-avatar flap-avatar--${sprite}`} transform={`translate(${BIRD_X} ${y + idleBob}) rotate(${tilt})`}>
    <path d={`M-19 ${finOffset}q-13-10-12 4 4 11 13 8M19 ${-finOffset}q13-10 12 4-4 11-13 8`} fill={sprite === 'dead' ? '#ff4fa3' : '#ffe45c'} stroke="#172337" strokeWidth="3" strokeLinejoin="round"/>
    <circle r="21" fill={glow} stroke="#172337" strokeWidth="3"/>
    <g clipPath="url(#flap-mascot-mask)"><image href={mascot} x="-36" y="-26" width="72" height="82" preserveAspectRatio="xMidYMid meet"/></g>
    <circle r="17" fill="none" stroke="#fff8e8" strokeWidth="2" opacity=".9"/>
    {sprite === 'dead' && <path d="M-7-4l5 5m0-5-5 5M3-4l5 5m0-5-5 5" stroke="#172337" strokeWidth="2"/>}
    {sprite === 'win' && <path d="M-8-9l3 3 5-6M3-9l3 3 5-6" fill="none" stroke="#172337" strokeWidth="2" strokeLinecap="round"/>}
  </g>
}

function Confetti({ elapsed }: { elapsed: number }) {
  const pieces = ['#ff4fa3', '#ffe45c', '#69e9df', '#8bdd64']
  return <g pointerEvents="none">{Array.from({ length: 18 }, (_, index) => {
    const direction = index % 2 ? 1 : -1
    const x = BIRD_X + direction * (16 + (index % 5) * 11)
    const y = 320 - (elapsed / 16) * (1.6 + index % 3) + (index % 4) * 18
    return <rect key={index} x={x} y={y} width="5" height="9" rx="1" fill={pieces[index % pieces.length]} transform={`rotate(${index * 33} ${x} ${y})`}/>
  })}</g>
}

export function FlapGame({ seed, onFinish, setHud, paused, onStart, autoStart = false }: ActiveGameProps) {
  const game = useRef<FlapState>(freshState(seed))
  const [view, setView] = useState(game.current)
  const last = useRef(0)
  const autoStarted = useRef(false)

  const publish = useCallback(() => setView({ ...game.current, gates: [...game.current.gates] }), [])

  useEffect(() => {
    game.current = freshState(seed)
    last.current = 0
    autoStarted.current = false
    publish()
  }, [publish, seed])

  const flap = useCallback(() => {
    const current = game.current
    if (paused || current.done || current.phase === 'crashed' || current.phase === 'landing' || current.phase === 'won') return
    if (current.phase === 'ready') {
      current.phase = 'running'
      recordInput(current, 'start-flap')
      onStart?.()
    } else {
      recordInput(current, 'flap')
    }
    current.velocity = FLAP_VELOCITY
    publish()
  }, [onStart, paused, publish])

  useEffect(() => {
    if (!autoStart || autoStarted.current) return
    autoStarted.current = true
    const timer = window.setTimeout(flap, 0)
    return () => window.clearTimeout(timer)
  }, [autoStart, flap])

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
    const lose = (detail: string) => {
      const current = game.current
      if (current.phase !== 'running') return
      current.phase = 'crashed'
      current.phaseElapsed = 0
      current.velocity = Math.max(1.8, current.velocity)
      recordInput(current, 'crash')
      recordInput(current, detail)
    }
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      const current = game.current
      if (paused || current.done) return
      const delta = Math.min(28, now - last.current || 16) / 16
      last.current = now
      current.elapsed += delta * 16

      if (current.phase === 'ready') {
        publish()
        return
      }

      if (current.phase === 'crashed') {
        current.phaseElapsed += delta * 16
        current.velocity += GRAVITY * delta
        current.y = Math.min(GROUND_Y - BIRD_RADIUS, current.y + current.velocity * delta)
        if (current.phaseElapsed >= 520) {
          current.done = true
          onFinish({ result: 'lost', score: current.score, detail: current.inputs.includes('missed-finish') ? 'Twenty-five pipes, then you missed the landing.' : failureCopyFor(current.score), inputs: current.inputs, betrayalSeen: current.betrayalSeen })
          return
        }
        publish()
        return
      }

      if (current.phase === 'landing') {
        current.phaseElapsed += delta * 16
        current.y = FINISH_TOP - BIRD_RADIUS
        if (current.phaseElapsed >= 420) {
          current.phase = 'won'
          current.done = true
          onFinish({ result: 'won', score: TOTAL, detail: 'Twenty-five pipes and a clean landing.', inputs: current.inputs, betrayalSeen: current.betrayalSeen })
          return
        }
        publish()
        return
      }

      current.velocity += GRAVITY * delta
      current.y += current.velocity * delta
      current.scroll += SCROLL_SPEED * delta

      for (const gate of current.gates) {
        gate.x -= SCROLL_SPEED * delta
        if (gate.sabotage === 'telegraph') {
          gate.telegraphFrames -= delta
          if (gate.telegraphFrames <= 0) {
            const bounds = pipeGapBounds(gapSizeFor(gate))
            gate.targetGap = clamp(gate.gap + gate.direction * sabotageAmountFor(gate.id), bounds.minimum, bounds.maximum)
            gate.sabotage = 'moving'
          }
        }
        if (gate.sabotage === 'moving' && gate.gap !== gate.targetGap) {
          const movement = Math.sign(gate.targetGap - gate.gap) * Math.min(Math.abs(gate.targetGap - gate.gap), 3.4 * delta)
          gate.gap += movement
          if (gate.gap === gate.targetGap) gate.sabotage = 'done'
        }
        if (shouldTelegraph(gate, current.y, current.velocity)) {
          const projected = projectFlight(current.y, current.velocity, 12)
          gate.direction = projected < gate.gap ? 1 : -1
          gate.sabotage = 'telegraph'
          gate.telegraphFrames = TELEGRAPH_FRAMES
          current.betrayalSeen = true
          recordInput(current, `nowin:pipe-${gate.id}-${gate.direction === 1 ? 'drops' : 'rises'}`)
        }
      }

      if (current.y - BIRD_RADIUS < 0 || current.y + BIRD_RADIUS > GROUND_Y) {
        lose('ground')
        publish()
        return
      }

      for (const gate of current.gates) {
        const gapSize = gapSizeFor(gate)
        const top = gate.gap - gapSize / 2
        const bottom = gate.gap + gapSize / 2
        const overlapsPipe = gate.x < BIRD_X + BIRD_RADIUS && gate.x + PIPE_WIDTH > BIRD_X - BIRD_RADIUS
        if (overlapsPipe && (current.y - BIRD_RADIUS < top || current.y + BIRD_RADIUS > bottom)) {
          lose(gate.sabotage === 'moving' || gate.sabotage === 'done' ? 'shifted-pipe' : 'pipe')
          publish()
          return
        }
        if (!gate.scored && gate.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
          gate.scored = true
          current.score += 1
          if (current.score === TOTAL) {
            current.finishX = WIDTH + 42
            recordInput(current, 'finish-platform')
          }
        }
      }

      if (current.finishX !== null) {
        current.finishX -= SCROLL_SPEED * delta
        const overPlatform = current.finishX < BIRD_X + BIRD_RADIUS && current.finishX + FINISH_WIDTH > BIRD_X - BIRD_RADIUS
        const landing = current.y + BIRD_RADIUS >= FINISH_TOP - 4 && current.y + BIRD_RADIUS <= FINISH_TOP + 13 && current.velocity >= 0
        if (overPlatform && landing) {
          current.phase = 'landing'
          current.phaseElapsed = 0
          current.y = FINISH_TOP - BIRD_RADIUS
          current.velocity = 0
          recordInput(current, 'landed')
          publish()
          return
        }
        if (overPlatform && current.y + BIRD_RADIUS > FINISH_TOP + 13) {
          recordInput(current, 'missed-finish')
          lose('missed-finish')
          publish()
          return
        }
        if (current.finishX + FINISH_WIDTH < BIRD_X - BIRD_RADIUS) {
          recordInput(current, 'missed-finish')
          lose('missed-finish')
          publish()
          return
        }
      }

      publish()
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [onFinish, paused, publish])

  const telegraphGate = view.gates.find(gate => gate.sabotage === 'telegraph' || gate.sabotage === 'moving')
  useEffect(() => {
    if (view.phase === 'ready') setHud('TAP TO FLY')
    else if (view.finishX !== null) setHud('LAND ON THE COPECADE DOCK')
    else setHud(`${view.score}/${TOTAL} GATES`)
  }, [setHud, view.finishX, view.phase, view.score])

  const promptVisible = view.phase === 'ready'
  return <div className={`flap-game flap-game--${view.phase}`}>
    <p className="game-tip">Tap, click, Space, or ↑ to flap. Pink-marked pipes can shift only after their arrow warns you.</p>
    <div className="flap-stage" onPointerDown={flap} role="application" aria-label="Flap game" aria-describedby="flap-controls">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flap-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#61cfe3"/><stop offset="1" stopColor="#c9f3eb"/></linearGradient>
          <clipPath id="flap-mascot-mask"><circle cx="0" cy="0" r="17"/></clipPath>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#flap-sky)"/>
        <Clouds scroll={view.scroll}/>
        <circle cx="238" cy="58" r="20" fill="#ffe45c" stroke="#172337" strokeWidth="3"/>
        <Skyline scroll={view.scroll}/>
        {view.gates.map(gate => <Pipe key={gate.id} gate={gate}/>) }
        {view.finishX !== null && <FinishPlatform x={view.finishX}/>}
        <MascotFlyer y={view.y} velocity={view.velocity} phase={view.phase} elapsed={view.elapsed} phaseElapsed={view.phaseElapsed}/>
        {view.phase === 'landing' && <Confetti elapsed={view.phaseElapsed}/>}
        <rect y={GROUND_Y} width={WIDTH} height={HEIGHT - GROUND_Y} fill="#e8c063" stroke="#172337" strokeWidth="3"/>
        <rect y={GROUND_Y} width={WIDTH} height="12" fill="#83d65b" stroke="#172337" strokeWidth="3"/>
        <path d={`M${-(view.scroll % 30)} ${GROUND_Y + 35}h${WIDTH + 30}M${-(view.scroll % 30)} ${GROUND_Y + 76}h${WIDTH + 30}`} stroke="#d39f48" strokeWidth="3" strokeDasharray="8 7" opacity=".72"/>
        {view.phase !== 'ready' && <text x={WIDTH / 2} y="69" textAnchor="middle" fontSize="46" fontWeight="900" fill="#fff8e8" stroke="#172337" strokeWidth="3" paintOrder="stroke">{view.score}</text>}
        {promptVisible && <g className="flap-start-prompt" pointerEvents="none" transform="translate(62 106)"><rect x="0" y="0" width="164" height="58" rx="8" fill="#fff8e8" stroke="#172337" strokeWidth="3"/><text x="82" y="17" textAnchor="middle" fontSize="10" fontWeight="900" fill="#172337">READY?</text><path d="M22 35l8-7v5h10v4H30v5z" fill="#ff4fa3" stroke="#172337" strokeWidth="1.5"/><text x="94" y="35" textAnchor="middle" fontSize="8" fontWeight="900" fill="#172337">TAP / CLICK / SPACE</text><text x="82" y="49" textAnchor="middle" fontSize="8" fontWeight="900" fill="#172337">FLAP TO START</text></g>}
        {telegraphGate && <g className="flap-warning" transform="translate(70 21)"><rect width="148" height="28" rx="7" fill="#ff4fa3" stroke="#172337" strokeWidth="3"/><text x="74" y="19" textAnchor="middle" fontSize="10" fontWeight="900" fill="#172337">PIPE SHIFT {telegraphGate.direction === 1 ? '↓' : '↑'}</text></g>}
      </svg>
    </div>
    <span id="flap-controls" className="sr-only">Tap or left-click anywhere in the game, press Space, or press Arrow Up to flap.</span>
  </div>
}
