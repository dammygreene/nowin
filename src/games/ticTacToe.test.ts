import { describe, expect, it } from 'vitest'
import { botMove } from './TicTacToeGame'

describe('NOWIN tic-tac-toe AI', () => {
  it('blocks ordinary immediate wins but preserves the authored diagonal bait', () => {
    expect(botMove(['X', 'X', '', '', 'O', '', '', '', ''])).toBe(2)
    expect(botMove(['O', 'O', 'X', '', 'X', '', '', '', 'X'])).toBe(3)
  })
})
