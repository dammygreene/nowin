export type GameId = 'snake' | 'flap' | 'merge' | 'mines' | 'cross' | 'noughts' | 'pong' | 'connect'
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
  { id: 'snake', title: 'SNAKE', eyebrow: 'SOLO', tagline: 'eat 30. simple.', controls: 'ARROWS / WASD', color: '#8be36b', accent: '#2c9d68', target: '30 APPLES + EXIT', className: 'snake' },
  { id: 'flap', title: 'FLAP', eyebrow: 'SOLO', tagline: 'just fly. apparently.', controls: 'SPACE / TAP', color: '#ffd84a', accent: '#f58d45', target: '25 GATES', className: 'flap' },
  { id: 'merge', title: '2048', eyebrow: 'SOLO', tagline: 'one little number.', controls: 'ARROWS / SWIPE', color: '#b791ff', accent: '#673bb7', target: 'MAKE 256', className: 'merge' },
  { id: 'mines', title: 'MINES', eyebrow: 'SOLO', tagline: 'the clues are fine.', controls: 'TAP / FLAG', color: '#71dbff', accent: '#2679bd', target: 'CLEAR THE FIELD', className: 'mines' },
  { id: 'cross', title: 'CROSS', eyebrow: 'VS NOWIN AI', tagline: 'beat NOWIN across.', controls: 'ARROWS / WASD', color: '#ff6b71', accent: '#d83d69', target: 'REACH THE ROOF', className: 'cross' },
  { id: 'noughts', title: 'NOUGHTS', eyebrow: 'VS NOWIN AI', tagline: 'it loves a corner.', controls: 'CLICK A CELL', color: '#f4a6dc', accent: '#a64c9c', target: 'THREE IN A ROW', className: 'noughts' },
  { id: 'pong', title: 'PONG', eyebrow: 'VS NOWIN AI', tagline: 'first to seven.', controls: 'W / S OR POINTER', color: '#69e9df', accent: '#188f91', target: 'FIRST TO 7', className: 'pong' },
  { id: 'connect', title: 'CONNECT FOUR', eyebrow: 'VS NOWIN AI', tagline: 'it has a favourite column.', controls: 'TAP A COLUMN', color: '#ff9d52', accent: '#c44e32', target: 'FOUR IN A ROW', className: 'connect' }
]

export const getGame = (id: string) => GAMES.find(game => game.id === id) ?? GAMES[0]
export const seededDaily = () => Math.floor(Date.now() / 86_400_000) * 7919 + 2048
export const makeRunId = () => `nw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
