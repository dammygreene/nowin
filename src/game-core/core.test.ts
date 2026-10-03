import { describe, expect, it } from 'vitest'
import { GAMES, seededDaily } from './types'
import { SeededRng } from './rng'
import { isSolanaAddress } from '../rewards/rewardProvider'

describe('NOWIN shared deterministic core', () => {
  it('registers all eight launch cabinets with unique identifiers', () => {
    expect(GAMES).toHaveLength(8)
    expect(new Set(GAMES.map(game => game.id)).size).toBe(8)
    expect(GAMES.filter(game => game.eyebrow === 'VS NOWIN AI')).toHaveLength(4)
  })
  it('replays the same seeded random stream', () => {
    const first = new SeededRng(203014).next()
    const second = new SeededRng(203014).next()
    expect(first).toBe(second)
    expect(new SeededRng(203014).int(1000)).toBe(new SeededRng(203014).int(1000))
  })
  it('keeps a shared daily seed stable during the same UTC day', () => {
    expect(seededDaily()).toBe(seededDaily())
  })
  it('only accepts base58-shaped Solana wallet strings', () => {
    expect(isSolanaAddress('7dJ8qLJXy9j2aWnYRhY7LQ9K8TQLspuXxuixVg1M9PjL')).toBe(true)
    expect(isSolanaAddress('not-a-wallet')).toBe(false)
    expect(isSolanaAddress('0OIl')).toBe(false)
  })
})
