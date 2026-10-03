export type GameId = 'snake' | 'flap' | 'tetris' | 'cross' | 'pong' | 'tictactoe'
export type ResultState = 'won' | 'lost'

export interface GameResult {
  runId: string
  gameId: GameId
  version: string
  seed: number
  startedAt: number
  endedAt: number
  result: ResultState
  score: number
  detail: string
  inputs: string[]
  betrayalSeen: boolean
}

export interface GameMeta {
  id: GameId
  title: string
  eyebrow: 'SOLO' | 'VS NOWIN AI'
  tagline: string
  controls: string
  color: string
  accent: string
  target: string
  className: string
}

export const GAMES: GameMeta[] = [
  { id: 'snake', title: 'SNAKE', eyebrow: 'SOLO', tagline: 'eat 30. then escape.', controls: 'ARROWS / WASD', color: '#8be36b', accent: '#2c9d68', target: '30 APPLES + EXIT', className: 'snake' },
  { id: 'flap', title: 'FLAP', eyebrow: 'SOLO', tagline: 'just fly. apparently.', controls: 'SPACE / TAP', color: '#ffd84a', accent: '#f58d45', target: '25 GATES + LAND', className: 'flap' },
  { id: 'tetris', title: 'TETRIS', eyebrow: 'SOLO', tagline: 'clear 20. good luck.', controls: 'ARROWS / SPACE', color: '#b791ff', accent: '#673bb7', target: '20 LINES', className: 'tetris' },
  { id: 'cross', title: 'CROSS', eyebrow: 'VS NOWIN AI', tagline: 'race NOWIN home.', controls: 'ARROWS / WASD', color: '#ff8a4c', accent: '#d83d69', target: 'BEAT NOWIN', className: 'cross' },
  { id: 'pong', title: 'PONG', eyebrow: 'VS NOWIN AI', tagline: 'first to seven.', controls: 'W / S OR POINTER', color: '#69e9df', accent: '#188f91', target: 'FIRST TO 7', className: 'pong' },
  { id: 'tictactoe', title: 'TIC-TAC-TOE', eyebrow: 'VS NOWIN AI', tagline: 'it sees the obvious.', controls: 'CLICK A CELL', color: '#f4a6dc', accent: '#a64c9c', target: 'THREE IN A ROW', className: 'tictactoe' }
]

export const getGame = (id: string) => GAMES.find(game => game.id === id) ?? GAMES[0]
/** Local DEMO seed only. Production must replace this through the daily challenge endpoint. */
export const seededDaily = () => Math.floor(Date.now() / 86_400_000) * 7919 + 311
export const makeRunId = () => `nw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
