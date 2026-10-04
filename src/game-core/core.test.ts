import { describe, expect, it } from 'vitest'
import { GAMES } from './types'
import { SeededRng } from './rng'

describe('COPECADE shared deterministic core', () => {
  it('registers exactly six launch cabinets with unique identifiers', () => {
    expect(GAMES).toHaveLength(6)
    expect(new Set(GAMES.map(game => game.id)).size).toBe(6)
    expect(GAMES.filter(game => game.eyebrow === 'VS COPECADE AI')).toHaveLength(3)
  })
  it('replays the same seeded random stream', () => {
    expect(new SeededRng(203014).next()).toBe(new SeededRng(203014).next())
  })
})
