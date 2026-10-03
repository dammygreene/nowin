import { useCallback, useEffect, useRef, useState } from 'react'
import { SeededRng } from '../game-core/rng'
import mascot from '../assets/mascot/nowin-mascot.png'
import type { ActiveGameProps } from './GameShell'

const WIDTH = 820; const HEIGHT = 430; const TOTAL = 25
type Gate = { x: number; gap: number; scored: boolean; id: number }
function makeGates(seed: number): Gate[] { const rng = new SeededRng(seed); return Array.from({ length: TOTAL }, (_, id) => ({ x: 420 + id * 128, gap: id > 20 ? 210 + ((id % 2) * 34) : 130 + rng.int(175), scored: false, id })) }
export function FlapGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const game = useRef({ y: 215, velocity: 0, gates: makeGates(seed), score: 0, done: false, inputs: [] as string[] }); const [view, setView] = useState(game.current); const [pulse, setPulse] = useState(false); const last = useRef(0)
  useEffect(() => { game.current = { y: 215, velocity: 0, gates: makeGates(seed), score: 0, done: false, inputs: [] }; setView({ ...game.current }) }, [seed])
  const flap = useCallback(() => { if (paused || game.current.done) return; game.current.velocity = -6.4; game.current.inputs.push('flap') }, [paused])
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.code === 'Space' || event.key === 'ArrowUp') { event.preventDefault(); flap() } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [flap])
  useEffect(() => {
    let frame = 0
    const loop = (now: number) => { frame = requestAnimationFrame(loop); if (paused || game.current.done) return; const delta = Math.min(28, now - last.current || 16) / 16; last.current = now; const current = game.current; current.velocity += .34 * delta; current.y += current.velocity * delta; current.gates.forEach(gate => gate.x -= 2.8 * delta)
      if (current.y < 15 || current.y > HEIGHT - 15) { current.done = true; onFinish({ result: 'lost', score: current.score, detail: 'Gravity remains undefeated.', inputs: current.inputs, betrayalSeen: current.score >= 21 }); return }
      for (const gate of current.gates) { const gapSize = gate.id >= 22 ? 88 : 130; const hitX = gate.x < 174 && gate.x + 58 > 132; const top = gate.gap - gapSize / 2; const bottom = gate.gap + gapSize / 2; if (hitX && (current.y - 14 < top || current.y + 14 > bottom)) { current.done = true; onFinish({ result: 'lost', score: current.score, detail: gate.id >= 22 ? 'The last three changed rhythm. The flash warned you.' : 'Pipe says no.', inputs: current.inputs, betrayalSeen: gate.id >= 20 }); return }
        if (!gate.scored && gate.x + 58 < 132) { gate.scored = true; current.score++; if (current.score === 21) setPulse(true); if (current.score === TOTAL) { current.done = true; onFinish({ result: 'won', score: TOTAL, detail: 'You landed in the 1%.', inputs: current.inputs, betrayalSeen: true }); return } }
      }
      setView({ ...current, gates: [...current.gates] })
    }; frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame)
  }, [onFinish, paused])
  useEffect(() => setHud(`${view.score}/${TOTAL} GATES`), [setHud, view.score])
  return <div className={`flap-game ${pulse ? 'flap-game--pulse' : ''}`}><p className="game-tip">Tap to flap. At the pink pulse, take one beat between taps — the final gaps are brutally narrow.</p><div className="flap-stage" onPointerDown={flap} role="application" aria-label="Flap game"><svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet"><defs><pattern id="flap-clouds" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx="10" cy="20" r="3" fill="#fff" opacity=".6"/><circle cx="18" cy="20" r="5" fill="#fff" opacity=".6"/></pattern><clipPath id="flap-mascot-mask"><circle cx="0" cy="0" r="27"/></clipPath></defs><rect width={WIDTH} height={HEIGHT} fill="#61cfe3"/><rect width={WIDTH} height={HEIGHT} fill="url(#flap-clouds)"/>{view.gates.map(gate => { const size = gate.id >= 22 ? 88 : 130; const top = gate.gap - size / 2; const bottom = gate.gap + size / 2; return <g key={gate.id}><rect x={gate.x} y="0" width="58" height={top} rx="8" fill="#5fbe68" stroke="#172337" strokeWidth="7"/><rect x={gate.x} y={bottom} width="58" height={HEIGHT - bottom} rx="8" fill="#5fbe68" stroke="#172337" strokeWidth="7"/>{gate.id >= 22 && <path d={`M${gate.x + 29} ${gate.gap - 18}l11 18-11 18-11-18z`} fill="#ff4fa3"/>}</g> })}<g transform={`translate(145 ${view.y}) rotate(${Math.min(12, Math.max(-10, view.velocity * 1.7))})`}><circle r="30" fill="#fff8e8" stroke="#172337" strokeWidth="5"/><g clipPath="url(#flap-mascot-mask)"><image href={mascot} x="-48" y="-34" width="96" height="109" preserveAspectRatio="xMidYMid meet"/></g><circle r="27" fill="none" stroke="#fff8e8" strokeWidth="2" opacity=".7"/></g><rect y={HEIGHT - 8} width={WIDTH} height="8" fill="#ffe45c"/></svg><button className="flap-tap" aria-label="Flap">TAP / SPACE</button></div></div>
}
