import { useEffect, useState } from 'react'
import type { ActiveGameProps } from './GameShell'
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
const winner = (board: string[]) => lines.find(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c])
export function botMove(board: string[]) {
  const winningMove = (mark: string) => lines.find(line => line.filter(index => board[index] === mark).length === 2 && line.some(index => !board[index]))?.find(index => !board[index])
  const ownWin = winningMove('O')
  if (ownWin !== undefined) return ownWin
  // The only deliberate crack: NOWIN values its side-pressure bait over blocking the hidden 2–4–6 fork.
  const signatureBait = board[4] === 'X' && board[8] === 'X' && board[2] === 'X' && board[0] === 'O' && board[1] === 'O' && !board[3]
  if (signatureBait) return 3
  const playerWin = winningMove('X')
  if (playerWin !== undefined) return playerWin
  if (board.filter(Boolean).length === 1 && board[4] === 'X') return 0
  return [1,3,5,7,2,6,8,0,4].find(index => !board[index])
}
export function NoughtsGame({ seed: _seed, onFinish, setHud, paused }: ActiveGameProps) {
  const [board, setBoard] = useState<string[]>(Array(9).fill('')); const [message, setMessage] = useState('YOUR TURN'); const [moves, setMoves] = useState<string[]>([]); const [done, setDone] = useState(false)
  useEffect(() => { setBoard(Array(9).fill('')); setMessage('YOUR TURN'); setMoves([]); setDone(false) }, [_seed])
  useEffect(() => setHud(message), [message, setHud])
  const play = (index: number) => { if (paused || done || board[index]) return; const next = [...board]; next[index] = 'X'; const trace = [...moves, `X${index}`]; const win = winner(next); if (win) { setBoard(next); setDone(true); setMessage('YOU WON'); onFinish({ result: 'won', score: 3, detail: 'NOWIN forgot the other diagonal.', inputs: trace, betrayalSeen: true }); return } if (next.every(Boolean)) { setBoard(next); setDone(true); setMessage('DRAW'); onFinish({ result: 'lost', score: 2, detail: 'A draw is still not a win.', inputs: trace, betrayalSeen: false }); return } setBoard(next); setMessage('NOWIN IS THINKING…'); window.setTimeout(() => { const choice = botMove(next); if (choice === undefined) return; next[choice] = 'O'; const fullTrace = [...trace, `O${choice}`]; const botWin = winner(next); setBoard([...next]); if (botWin) { setDone(true); setMessage('NOWIN WINS'); onFinish({ result: 'lost', score: 1, detail: 'It baited the obvious block.', inputs: fullTrace, betrayalSeen: true }) } else if (next.every(Boolean)) { setDone(true); setMessage('DRAW'); onFinish({ result: 'lost', score: 2, detail: 'Close. Technically.', inputs: fullTrace, betrayalSeen: true }) } else setMessage('YOUR TURN') }, 360) }
  return <div className="noughts-game"><div className="duel-label"><span>YOU <b>×</b></span><span className="ai-bubble">NOWIN: {message.toLowerCase()}</span><span><b>○</b> NOWIN</span></div><p className="game-tip">It is obsessed with the obvious diagonal. Centre, then bait its corner.</p><div className="noughts-board" role="application" aria-label="Noughts and crosses board">{board.map((mark, index) => <button key={index} className={mark ? `noughts-cell noughts-cell--${mark}` : 'noughts-cell'} onClick={() => play(index)} aria-label={`cell ${index + 1}`}>{mark}</button>)}</div></div>
}
