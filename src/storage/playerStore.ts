import type { GameId, GameResult } from '../game-core/types'

export interface GameStats { attempts: number; wins: number; best: number; lastPlayed?: number }
export interface PlayerStore {
  getGameStats(id: GameId): GameStats
  getAllStats(): Record<string, GameStats>
  saveAttempt(result: GameResult): void
  getRecentResults(): GameResult[]
}
const KEY = 'nowin:player:v3'
const base: GameStats = { attempts: 0, wins: 0, best: 0 }
type Data = { stats: Record<string, GameStats>; results: GameResult[] }
function read(): Data {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"stats":{},"results":[]}') as Data } catch { return { stats: {}, results: [] } }
}
function write(data: Data) { localStorage.setItem(KEY, JSON.stringify(data)) }
export const localPlayerStore: PlayerStore = {
  getGameStats: id => ({ ...base, ...(read().stats[id] || {}) }),
  getAllStats: () => read().stats,
  saveAttempt: result => {
    const data = read(); const previous = { ...base, ...(data.stats[result.gameId] || {}) }
    data.stats[result.gameId] = { attempts: previous.attempts + 1, wins: previous.wins + (result.result === 'won' ? 1 : 0), best: Math.max(previous.best, result.score), lastPlayed: result.endedAt }
    data.results = [result, ...data.results].slice(0, 48); write(data)
  },
  getRecentResults: () => read().results
}
