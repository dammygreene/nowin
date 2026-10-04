// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { FlapGame } from './FlapGame'

let host: HTMLDivElement
let root: Root
let frames = new Map<number, FrameRequestCallback>()
let nextFrame = 0

const advanceFrame = (now: number) => {
  const pending = [...frames.entries()]
  frames.clear()
  act(() => pending.forEach(([, callback]) => callback(now)))
}

beforeAll(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

beforeEach(() => {
  frames = new Map()
  nextFrame = 0
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    nextFrame += 1
    frames.set(nextFrame, callback)
    return nextFrame
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn((frame: number) => frames.delete(frame)))
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

describe('Flap start behaviour', () => {
  it('waits for the first flap instead of ending an untouched run', () => {
    const onFinish = vi.fn()
    act(() => root.render(<FlapGame seed={512} paused={false} onFinish={onFinish} setHud={vi.fn()}/>))

    expect(host.textContent).toContain('FLAP TO START')
    for (let now = 16; now <= 4800; now += 16) advanceFrame(now)
    expect(onFinish).not.toHaveBeenCalled()

    const stage = host.querySelector<HTMLElement>('[aria-label="Flap game"]')
    expect(stage).not.toBeNull()
    act(() => stage?.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    advanceFrame(4816)
    expect(host.textContent).not.toContain('FLAP TO START')
    expect(onFinish).not.toHaveBeenCalled()
  })
})
