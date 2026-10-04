import { describe, expect, it } from 'vitest'
import { botMove, winner } from './TicTacToeGame'

describe('COPECADE Tic-Tac-Toe policy', () => {
  it('recognizes standard wins', () => {
    expect(winner(['X', 'X', 'X', '', '', '', '', '', ''])).toEqual([0, 1, 2])
    expect(winner(['O', '', '', 'O', '', '', 'O', '', ''])).toEqual([0, 3, 6])
    expect(winner(['', '', 'X', '', 'X', '', 'X', '', ''])).toEqual([2, 4, 6])
  })

  it('takes a win and blocks an immediate player win', () => {
    expect(botMove(['O', 'O', '', 'X', 'X', '', '', '', ''])).toBe(2)
    expect(botMove(['X', 'X', '', 'O', '', '', '', '', ''])).toBe(2)
  })

  it('reproduces only the authored bait route', () => {
    const board = Array(9).fill('')
    board[4] = 'X'
    expect(botMove(board)).toBe(0)
    board[0] = 'O'
    board[8] = 'X'
    expect(botMove(board)).toBe(1)
    board[1] = 'O'
    board[2] = 'X'
    expect(botMove(board)).toBe(3)
    board[3] = 'O'
    board[6] = 'X'
    expect(winner(board)).toEqual([2, 4, 6])
  })
})
