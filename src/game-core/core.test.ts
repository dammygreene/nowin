import { describe, expect, it } from 'vitest'
import { GAMES, seededDaily } from './types'
import { SeededRng } from './rng'
import { isSolanaAddress } from '../rewards/rewardProvider'

describe('NOWIN shared deterministic core', () => {
  it('registers exactly six launch cabinets with unique identifiers', () => {
    expect(GAMES).toHaveLength(6)
    expect(new Set(GAMES.map(game => game.id)).size).toBe(6)
    expect(GAMES.filter(game => game.eyebrow === 'VS NOWIN AI')).toHaveLength(3)
  })
  it('replays the same seeded random stream', () => {
    expect(new SeededRng(203014).next()).toBe(new SeededRng(203014).next())
  })
  it('keeps the demo daily seed stable within the same UTC day', () => expect(seededDaily()).toBe(seededDaily()))
  it('checks wallet formats only for UX', () => {
    expect(isSolanaAddress('7dJ8qLJXy9j2aWnYRhY7LQ9K8TQLspuXxuixVg1M9PjL')).toBe(true)
    expect(isSolanaAddress('not-a-wallet')).toBe(false)
  })
})
