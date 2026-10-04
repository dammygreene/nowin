import { useCallback, useEffect, useRef, useState } from 'react'
import { Arrow } from '../components/Arrow'
import { SeededRng } from '../game-core/rng'
import type { ActiveGameProps } from './GameShell'

const COLS = 10
const ROWS = 20
const TARGET_LINES = 20
const SHAPES: Record<string, number[][]> = {
  I: [[1,1,1,1]], O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1]], S: [[0,1,1],[1,1,0]], Z: [[1,1,0],[0,1,1]], J: [[1,0,0],[1,1,1]], L: [[0,0,1],[1,1,1]]
}
const COLORS = ['', '#69e9df', '#ffe45c', '#b791ff', '#8be36b', '#ff6b83', '#ff9d52', '#6385ff']
type Piece = { type: string; shape: number[][]; x: number; y: number; color: number }
type Phase = 'PLAYING' | 'COPECADE_EVENT'
type TetrisState = { board: number[][]; current: Piece; next: Piece; rng: SeededRng; lines: number; score: number; level: number; done: boolean; inputs: string[]; phase: Phase; eventStarted: boolean; eventPiece: boolean }

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))
const rotate = (shape: number[][]) => shape[0].map((_, index) => shape.map(row => row[index]).reverse())
const createPiece = (rng: SeededRng, forced?: string): Piece => {
  const type = forced || rng.pick(Object.keys(SHAPES)); const shape = SHAPES[type].map(row => [...row]); const color = forced ? 3 : (Object.keys(SHAPES).indexOf(type) + 1)
  return { type, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0, color }
}
const fits = (board: number[][], piece: Piece) => piece.shape.every((row, py) => row.every((cell, px) => !cell || (piece.x + px >= 0 && piece.x + px < COLS && piece.y + py < ROWS && !board[piece.y + py]?.[piece.x + px])))
const paintBoard = (state: TetrisState) => {
  const board = state.board.map(row => [...row]); state.current.shape.forEach((row, py) => row.forEach((cell, px) => { const y = state.current.y + py; const x = state.current.x + px; if (cell && y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = state.current.color })); return board
}

export function TetrisGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const makeState = useCallback(() => { const rng = new SeededRng(seed); const current = createPiece(rng); return { board: emptyBoard(), current, next: createPiece(rng), rng, lines: 0, score: 0, level: 1, done: false, inputs: [] as string[], phase: 'PLAYING' as Phase, eventStarted: false, eventPiece: false } }, [seed])
  const core = useRef<TetrisState>(makeState()); const [view, setView] = useState(core.current)
  const publish = () => setView({ ...core.current, board: core.current.board.map(row => [...row]), current: { ...core.current.current, shape: core.current.current.shape.map(row => [...row]) }, next: { ...core.current.next, shape: core.current.next.shape.map(row => [...row]) } })
  useEffect(() => { core.current = makeState(); publish() }, [makeState])

  const lose = useCallback(() => { const state = core.current; state.done = true; onFinish({ result: 'lost', score: state.score, detail: 'The stack hit the ceiling. COPECADE applauds.', inputs: state.inputs, betrayalSeen: state.eventStarted }) }, [onFinish])
  const lock = useCallback(() => {
    const state = core.current; const piece = state.current
    piece.shape.forEach((row, py) => row.forEach((cell, px) => { if (cell && piece.y + py >= 0) state.board[piece.y + py][piece.x + px] = piece.color }))
    const kept = state.board.filter(row => row.some(cell => !cell)); const cleared = ROWS - kept.length
    if (cleared) { state.board = [...Array.from({ length: cleared }, () => Array(COLS).fill(0)), ...kept]; state.lines += cleared; state.score += [0, 100, 300, 500, 800][cleared] * state.level; state.level = Math.min(9, 1 + Math.floor(state.lines / 4)) }
    if (state.lines >= TARGET_LINES) { state.done = true; onFinish({ result: 'won', score: state.score, detail: 'Twenty lines. You broke the cabinet.', inputs: state.inputs, betrayalSeen: state.eventStarted }); return }
    const startEvent = !state.eventStarted && state.lines >= 12
    const incoming = startEvent ? createPiece(state.rng, 'T') : state.next
    state.current = incoming; state.next = createPiece(state.rng); state.eventStarted ||= startEvent; state.eventPiece = startEvent; state.phase = startEvent ? 'COPECADE_EVENT' : 'PLAYING'
    if (!fits(state.board, state.current)) lose()
  }, [lose, onFinish])

  const action = useCallback((input: string) => {
    const state = core.current; if (paused || state.done) return
    const current = state.current; state.inputs.push(input)
    if (input === 'left' || input === 'right') { const test = { ...current, x: current.x + (input === 'left' ? -1 : 1) }; if (fits(state.board, test)) state.current = test }
    else if (input === 'rotate') { const test = { ...current, shape: rotate(current.shape) }; if (fits(state.board, test)) state.current = test }
    else if (input === 'hard') { let test = { ...current }; while (fits(state.board, { ...test, y: test.y + 1 })) test = { ...test, y: test.y + 1 }; state.current = test; lock() }
    else { const test = { ...current, y: current.y + 1 }; if (fits(state.board, test)) state.current = test; else lock() }
    if (state.eventPiece && input !== 'hard' && state.current.y > 1) { state.phase = 'PLAYING'; state.eventPiece = false }
    publish()
  }, [lock, paused])
  useEffect(() => { const key = (event: KeyboardEvent) => { const map: Record<string, string> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'rotate', w: 'rotate', ArrowDown: 'down', s: 'down', ' ': 'hard' }; if (map[event.key]) { event.preventDefault(); action(map[event.key]) } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [action])
  useEffect(() => { const timer = window.setInterval(() => action('tick'), Math.max(185, 680 - core.current.level * 55)); return () => window.clearInterval(timer) }, [action, view.level])
  useEffect(() => setHud(`${view.lines}/${TARGET_LINES} LINES · LV ${view.level}${view.lines >= 10 && view.lines < 12 ? ' · COPECADE PIECE SOON' : view.phase === 'COPECADE_EVENT' ? ' · COPECADE BLOCK!' : ''}`), [setHud, view.level, view.lines, view.phase])
  const board = paintBoard(view); const nextCells = view.next.shape.flatMap((row, y) => row.map((cell, x) => ({ cell, x, y })))
  return <div className="tetris-game"><div className="tetris-side tetris-side--left"><p className="tetris-stat"><b>{view.score}</b>SCORE</p><p className="tetris-stat"><b>{view.lines}</b>LINES</p><div className={`tetris-warning ${view.lines >= 10 ? 'tetris-warning--live' : ''}`}>{view.phase === 'COPECADE_EVENT' ? 'COPECADE BLOCK' : view.lines >= 10 ? 'WATCH NEXT' : 'KEEP IT LOW'}</div></div><div className={`tetris-board ${view.phase === 'COPECADE_EVENT' ? 'tetris-board--event' : ''}`} role="application" aria-label="Falling block game">{board.flatMap((row, y) => row.map((cell, x) => <i key={`${x}-${y}`} className={cell ? 'tetris-cell tetris-cell--filled' : 'tetris-cell'} style={cell ? { '--block': COLORS[cell] } as React.CSSProperties : undefined}>{cell === 3 && view.phase === 'COPECADE_EVENT' ? '!' : ''}</i>))}</div><div className="tetris-side"><p className="next-label">NEXT</p><div className="next-piece">{Array.from({ length: 16 }, (_, index) => { const x = index % 4; const y = Math.floor(index / 4); const match = nextCells.find(item => item.x === x && item.y === y)?.cell; return <i key={index} style={match ? { background: COLORS[view.next.color] } : undefined}/> })}</div><p className="next-label">20 = WIN</p></div><p className="game-tip">Clear 20 lines. At 12, a purple COPECADE T-block arrives. A flat centre is the counter.</p><div className="tetris-controls" aria-label="Tetris touch controls"><button onClick={() => action('left')} aria-label="Move left"><Arrow direction="left"/></button><button onClick={() => action('rotate')} aria-label="Rotate">⟳</button><button onClick={() => action('right')} aria-label="Move right"><Arrow/></button><button onClick={() => action('down')} aria-label="Soft drop"><Arrow direction="down"/></button><button onClick={() => action('hard')}>DROP</button></div></div>
}
