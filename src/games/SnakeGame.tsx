import { useCallback, useEffect, useRef, useState } from 'react'
import { SeededRng } from '../game-core/rng'
import { Arrow } from '../components/Arrow'
import type { ActiveGameProps } from './GameShell'

type Point = { x: number; y: number }
const W = 16; const H = 12; const TARGET = 30
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const opposite = (a: Point, b: Point) => a.x + b.x === 0 && a.y + b.y === 0
function foodFor(rng: SeededRng, snake: Point[]): Point { let item: Point; do item = { x: 1 + rng.int(W - 2), y: 1 + rng.int(H - 2) }; while (snake.some(part => same(part, item))); return item }

export function SnakeGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const rng = useRef(new SeededRng(seed)); const state = useRef({ snake: [{ x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 10, y: 6 }, eaten: 0, done: false, inputs: [] as string[] })
  const [view, setView] = useState(state.current); const [flash, setFlash] = useState(false)
  const reset = useCallback(() => { rng.current = new SeededRng(seed); const snake = [{ x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }]; state.current = { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: foodFor(rng.current, snake), eaten: 0, done: false, inputs: [] }; setView({ ...state.current }); }, [seed])
  useEffect(() => reset(), [reset])
  const turn = useCallback((key: string) => {
    const directions: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } }
    const direction = directions[key]; const game = state.current
    if (direction && !opposite(direction, game.dir)) { game.next = direction; game.inputs.push(key) }
  }, [])
  useEffect(() => { const fn = (event: KeyboardEvent) => turn(event.key); window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn) }, [turn])
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (paused) return; const game = state.current; if (game.done) return
      game.dir = game.next; const head = { x: game.snake[0].x + game.dir.x, y: game.snake[0].y + game.dir.y }
      const exit = { x: W - 2, y: H - 2 }
      if (game.eaten >= TARGET && same(head, exit)) { game.done = true; if (game.dir.x === 1) onFinish({ result: 'won', score: game.eaten, detail: 'You found the exit from the only honest side.', inputs: game.inputs, betrayalSeen: true }); else onFinish({ result: 'lost', score: game.eaten, detail: 'The exit only opens from the left. Look at the arrow.', inputs: game.inputs, betrayalSeen: true }); return }
      if (head.x < 0 || head.y < 0 || head.x >= W || head.y >= H || game.snake.some(part => same(part, head))) { game.done = true; onFinish({ result: 'lost', score: game.eaten, detail: game.eaten >= 20 ? 'The gate was opening. You looked away.' : 'You became the wall.', inputs: game.inputs, betrayalSeen: game.eaten >= 20 }); return }
      game.snake = [head, ...game.snake]
      if (same(head, game.food)) { game.eaten++; game.food = foodFor(rng.current, game.snake); if (game.eaten === 20) setFlash(true); } else game.snake.pop()
      setView({ ...game, snake: [...game.snake] })
    }, 145); return () => window.clearInterval(timer)
  }, [onFinish, paused])
  useEffect(() => setHud(`${view.eaten}/${TARGET} APPLES${view.eaten >= TARGET ? ' · EXIT OPEN' : ''}`), [setHud, view.eaten])
  const touch = (direction: string) => () => turn(direction)
  const cells = Array.from({ length: W * H }, (_, index) => ({ x: index % W, y: Math.floor(index / W) }))
  return <div className={`snake-game ${flash ? 'snake-game--gate' : ''}`}><p className="game-tip">Eat apples. At 20, watch the border pulse. At the exit, obey its one-way arrow.</p><div className="snake-board" role="application" aria-label="Snake game" style={{ gridTemplateColumns: `repeat(${W}, 1fr)` }}>{cells.map(cell => { const part = view.snake.findIndex(item => same(item, cell)); const isFood = same(view.food, cell); const isExit = view.eaten >= TARGET && cell.x === W - 2 && cell.y === H - 2; return <i key={`${cell.x}-${cell.y}`} className={`${part === 0 ? 'snake-head' : part > -1 ? 'snake-tail' : ''} ${isFood ? view.eaten >= 20 ? 'snake-food snake-food--bait' : 'snake-food' : ''} ${isExit ? 'snake-exit' : ''}`}>{part === 0 ? '•' : isFood ? '✦' : isExit ? '⇢' : ''}</i> })}</div><div className="d-pad" aria-label="Snake touch controls"><button onClick={touch('ArrowUp')} aria-label="Move up"><Arrow direction="up"/></button><button onClick={touch('ArrowLeft')} aria-label="Move left"><Arrow direction="left"/></button><button onClick={touch('ArrowDown')} aria-label="Move down"><Arrow direction="down"/></button><button onClick={touch('ArrowRight')} aria-label="Move right"><Arrow /></button></div></div>
}
