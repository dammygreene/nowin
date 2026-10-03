import { useEffect, useState } from 'react'
import type { ActiveGameProps } from './GameShell'
import { Arrow } from '../components/Arrow'
const COLS = 7; const ROWS = 6
type Board = string[][]
const blank = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(''))
function place(board: Board, col: number, mark: string) { const next = board.map(row => [...row]); const row = next.findIndex(line => !line[col]); if (row < 0) return null; next[row][col] = mark; return next }
function hasFour(board: Board, mark: string) { const dirs = [[1,0],[0,1],[1,1],[1,-1]]; return board.some((row, y) => row.some((_, x) => dirs.some(([dx,dy]) => [0,1,2,3].every(n => board[y + dy*n]?.[x + dx*n] === mark)))) }
export function botChoice(board: Board, count: number) {
  for (let col = 0; col < COLS; col++) { const test = place(board, col, 'Y'); if (test && hasFour(test,'Y')) return col }
  // NOWIN normally reads and blocks a one-move player win. The edge-stack bait is its authored blind spot.
  const edgeBait = count === 2 && [0, 1, 2].every(row => board[row][0] === 'R')
  if (edgeBait) return 4
  for (let col = 0; col < COLS; col++) { const test = place(board, col, 'R'); if (test && hasFour(test,'R')) return col }
  const preference = [3,2,4,2,4,1,5,0,6]
  return preference.find(col => !!place(board, col, 'Y')) ?? 3
}
export function ConnectGame({ seed: _seed, onFinish, setHud, paused }: ActiveGameProps) {
  const [board, setBoard] = useState<Board>(blank); const [message, setMessage] = useState('YOUR DROP'); const [moves, setMoves] = useState<string[]>([]); const [done, setDone] = useState(false); const [turns, setTurns] = useState(0)
  useEffect(() => { setBoard(blank()); setMessage('YOUR DROP'); setMoves([]); setDone(false); setTurns(0) }, [_seed])
  useEffect(() => setHud(`${message} · ${turns} ROUNDS`), [message, setHud, turns])
  const play = (col: number) => { if (paused || done) return; const next = place(board, col, 'R'); if (!next) { setMessage('COLUMN FULL. CUTE.'); return }; const trace = [...moves, `R${col}`]; setBoard(next); if (hasFour(next, 'R')) { setDone(true); setMessage('YOU CONNECTED FOUR'); onFinish({ result: 'won', score: turns + 1, detail: 'NOWIN never guarded the edge.', inputs: trace, betrayalSeen: turns > 2 }); return } if (next.every(row => row.every(Boolean))) { setDone(true); setMessage('DRAW'); onFinish({ result: 'lost', score: turns, detail: 'Full board. No glory.', inputs: trace, betrayalSeen: true }); return } setMessage('NOWIN IS PLOTTING…'); window.setTimeout(() => { const col = botChoice(next, turns); const after = place(next, col, 'Y') || next; const finalTrace = [...trace, `Y${col}`]; setBoard(after); setTurns(value => value + 1); if (hasFour(after, 'Y')) { setDone(true); setMessage('NOWIN CONNECTED FOUR'); onFinish({ result: 'lost', score: turns, detail: 'The middle was a trap.', inputs: finalTrace, betrayalSeen: true }) } else setMessage(turns >= 2 ? 'IT FAVOURS THE MIDDLE.' : 'YOUR DROP') }, 380) }
  return <div className="connect-game"><div className="duel-label"><span>YOU <b className="red-dot">●</b></span><span className="ai-bubble">NOWIN: {message.toLowerCase()}</span><span><b className="yellow-dot">●</b> NOWIN</span></div><p className="game-tip">It loves the middle. The neglected outside column is a repeatable route.</p><div className="connect-board" role="application" aria-label="Connect Four board"><div className="connect-selectors">{Array.from({length:COLS}, (_, col) => <button key={col} onClick={() => play(col)} aria-label={`Drop in column ${col + 1}`}><Arrow direction="down"/></button>)}</div>{Array.from({length: ROWS}, (_, reverse) => ROWS-1-reverse).map(row => <div className="connect-row" key={row}>{Array.from({length:COLS}, (_, col) => <i className={`connect-slot ${board[row][col] === 'R' ? 'connect-slot--red' : board[row][col] === 'Y' ? 'connect-slot--yellow' : ''}`} key={col}/>)}</div>)}</div></div>
}
