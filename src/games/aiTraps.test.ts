import { describe, expect, it } from 'vitest'
import { botMove } from './NoughtsGame'
import { botChoice } from './ConnectGame'

const blankConnect = () => Array.from({ length: 6 }, () => Array(7).fill(''))

describe('NOWIN anti-win AI', () => {
  it('blocks ordinary immediate noughts wins but retains the one authored bait', () => {
    expect(botMove(['X', 'X', '', '', 'O', '', '', '', ''])).toBe(2)
    expect(botMove(['O', 'O', 'X', '', 'X', '', '', '', 'X'])).toBe(3)
  })

  it('blocks an ordinary Connect Four vertical match point but exposes its exact edge blind spot', () => {
    const normal = blankConnect(); normal[0][0] = 'R'; normal[1][0] = 'R'; normal[2][0] = 'R'
    expect(botChoice(normal, 3)).toBe(0)
    const signature = blankConnect(); signature[0][0] = 'R'; signature[1][0] = 'R'; signature[2][0] = 'R'
    expect(botChoice(signature, 2)).toBe(4)
  })
})
