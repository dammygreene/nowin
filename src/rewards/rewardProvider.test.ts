// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockRewardProvider } from './rewardProvider'

beforeEach(() => localStorage.clear())

describe('local mock reward boundary', () => {
  it('is disabled for live rewards while accepting one local mock claim per run', async () => {
    expect(mockRewardProvider.isEnabled()).toBe(false)
    const first = await mockRewardProvider.submitClaim('nw_test_run', '7dJ8qLJXy9j2aWnYRhY7LQ9K8TQLspuXxuixVg1M9PjL')
    const second = await mockRewardProvider.submitClaim('nw_test_run', '7dJ8qLJXy9j2aWnYRhY7LQ9K8TQLspuXxuixVg1M9PjL')
    expect(first.status).toBe('pending')
    expect(first.signature).toMatch(/^MOCK-/)
    expect(second.status).toBe('already_claimed')
    expect(second.signature).toBe(first.signature)
  })
})
