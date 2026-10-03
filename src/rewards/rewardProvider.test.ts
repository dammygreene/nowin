import { describe, expect, it } from 'vitest'
import { isSolanaAddress } from './rewardProvider'

describe('wallet UX validation', () => {
  it('accepts base58-shaped Solana wallet strings and rejects malformed values', () => {
    expect(isSolanaAddress('7dJ8qLJXy9j2aWnYRhY7LQ9K8TQLspuXxuixVg1M9PjL')).toBe(true)
    expect(isSolanaAddress('not-a-wallet')).toBe(false)
    expect(isSolanaAddress('0OIl')).toBe(false)
  })
})
