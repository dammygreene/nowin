import { useEffect, useMemo, useState } from 'react'
import { Mascot } from '../components/Mascot'
import { Arrow } from '../components/Arrow'
import type { GameId, GameMeta, GameResult } from '../game-core/types'
import { makeRunId } from '../game-core/types'

export interface ActiveGameProps {
  seed: number
  onFinish: (result: Omit<GameResult, 'gameId' | 'runId' | 'version' | 'seed' | 'startedAt' | 'endedAt'>) => void
  setHud: (value: string) => void
  paused: boolean
}

export function GameIntro({ game, onStart }: { game: GameMeta; onStart: () => void }) {
  return <div className="game-intro"><Mascot mood="smug"/><div><p className="kicker">{game.eyebrow} CABINET</p><h2>{game.title}</h2><p className="intro-line">{game.tagline}</p><p className="control-line">{game.controls}</p><button autoFocus className="arcade-button button--lime" onClick={onStart}>GO <Arrow /></button></div></div>
}

export function useRun(gameId: GameId, seed: number, onDone: (result: GameResult) => void) {
  const runId = useMemo(makeRunId, [seed])
  const startedAt = useMemo(() => Date.now(), [runId])
  return (result: Omit<GameResult, 'gameId' | 'runId' | 'version' | 'seed' | 'startedAt' | 'endedAt'>) => onDone({ ...result, runId, seed, gameId, version: 'arcade-1.0.0', startedAt, endedAt: Date.now() })
}

export function PauseCover({ paused }: { paused: boolean }) { return paused ? <div className="pause-cover"><b>PAUSED</b><span>hit pause to get back in there</span></div> : null }

export function SeedDebug({ seed, onSeed }: { seed: number; onSeed: (next: number) => void }) {
  const [value, setValue] = useState(String(seed))
  useEffect(() => setValue(String(seed)), [seed])
  if (!import.meta.env.DEV) return null
  return <form className="seed-debug" onSubmit={event => { event.preventDefault(); onSeed(Number(value) || seed) }}><label>DEV SEED <input value={value} onChange={event => setValue(event.target.value)} /></label><button>SET</button></form>
}
