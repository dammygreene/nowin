// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

let host: HTMLDivElement
let root: Root

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  window.scrollTo = vi.fn()
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})
beforeEach(() => {
  vi.useFakeTimers()
  window.location.hash = '#/'
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.useRealTimers()
})

describe('arcade play flow', () => {
  it('exposes only the six launch cabinets without competitive or reward controls', () => {
    act(() => root.render(<App />))
    expect(host.querySelectorAll('article[aria-label^="Play "]')).toHaveLength(6)
    expect(host.textContent).toContain('SNAKE')
    expect(host.textContent).toContain('FLAP')
    expect(host.textContent).toContain('TETRIS')
    expect(host.textContent).toContain('CROSS')
    expect(host.textContent).toContain('PONG')
    expect(host.textContent).toContain('TIC-TAC-TOE')
    expect(host.textContent).not.toMatch(/LEADERBOARD|1% CLUB|DAILY DOOM|CONNECT FOUR|MINESWEEPER|2048/i)
    expect([...host.querySelectorAll('button')].map(button => button.textContent).join(' ')).not.toMatch(/CLAIM|WALLET/i)
  })

  it('opens a cabinet from its full card and starts Snake after the READY countdown', () => {
    act(() => root.render(<App />))
    const snakeCard = host.querySelector<HTMLElement>('article[aria-label^="Play SNAKE"]')
    expect(snakeCard).not.toBeNull()
    act(() => {
      snakeCard?.click()
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(host.textContent).toContain('READY')
    expect(host.textContent).not.toContain('DEV SEED')
    const ready = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('READY'))
    expect(ready).toBeDefined()
    act(() => ready?.click())
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(260))
    expect(host.querySelector('[aria-label="Snake game"]')).not.toBeNull()
  })

  it.each([
    ['snake', 'Snake game'],
    ['tetris', 'Falling block game'],
    ['cross', 'Crossing game'],
    ['pong', 'Pong game'],
    ['tictactoe', 'Tic-tac-toe board']
  ])('starts the %s cabinet after READY', (gameId, gameLabel) => {
    window.location.hash = `#/play/${gameId}`
    act(() => root.render(<App />))
    const ready = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('READY'))
    expect(ready).toBeDefined()
    act(() => ready?.click())
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(320))
    act(() => vi.advanceTimersByTime(260))
    expect(host.querySelector(`[aria-label="${gameLabel}"]`)).not.toBeNull()
  })

  it('opens Flap directly in its idle tap-to-start state', () => {
    window.location.hash = '#/play/flap'
    act(() => root.render(<App />))
    const stage = host.querySelector<HTMLElement>('[aria-label="Flap game"]')
    expect(stage).not.toBeNull()
    expect(host.textContent).toContain('FLAP TO START')
    expect([...host.querySelectorAll('button')].some(button => button.textContent?.includes('READY'))).toBe(false)
    act(() => stage?.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(host.textContent).not.toContain('FLAP TO START')
  })
})
