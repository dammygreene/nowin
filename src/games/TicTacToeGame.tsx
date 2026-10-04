import { useEffect, useRef, useState } from 'react'
import { audio } from '../game-core/audio'
import { Mascot } from '../components/Mascot'
import type { ActiveGameProps } from './GameShell'

export const winningLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

export function winner(board: string[]) {
  return winningLines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c])
}

const winningMove = (board: string[], mark: string) => winningLines
  .find(line => line.filter(index => board[index] === mark).length === 2 && line.some(index => !board[index]))
  ?.find(index => !board[index])

/**
 * COPECADE's deterministic policy is strong except for one authored bait:
 * center, opposite corner, top-right, bottom-left creates the winning diagonal.
 */
export function botMove(board: string[]) {
  const ownWin = winningMove(board, 'O')
  if (ownWin !== undefined) return ownWin

  const signatureBait = board[4] === 'X' && board[8] === 'X' && board[2] === 'X' && board[0] === 'O' && board[1] === 'O' && !board[3]
  if (signatureBait) return 3

  const playerWin = winningMove(board, 'X')
  if (playerWin !== undefined) return playerWin

  if (board.filter(Boolean).length === 1 && board[4] === 'X') return 0
  return [1, 3, 5, 7, 2, 6, 8, 0, 4].find(index => !board[index])
}

type Mark = 'X' | 'O'
type Result = 'won' | 'lost' | 'draw'

const copyFor = (result: Result) => result === 'won' ? 'WHAT?' : result === 'draw' ? 'FINE.' : 'SKILL ISSUE.'

function MarkIcon({ mark }: { mark: Mark }) {
  return <svg className={`ttt-mark ttt-mark--${mark}`} viewBox="0 0 100 100" aria-hidden="true">
    {mark === 'X'
      ? <path d="M22 22l56 56M78 22L22 78" pathLength="1"/>
      : <circle cx="50" cy="50" r="29" pathLength="1"/>}
  </svg>
}

export function TicTacToeGame({ seed, onFinish, setHud, paused }: ActiveGameProps) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''))
  const [message, setMessage] = useState('YOUR TURN')
  const [moves, setMoves] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [winning, setWinning] = useState<number[]>([])
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setBoard(Array(9).fill(''))
    setMessage('YOUR TURN')
    setMoves([])
    setDone(false)
    setThinking(false)
    setWinning([])
  }, [seed])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  useEffect(() => setHud(message), [message, setHud])

  const finish = (next: string[], trace: string[], result: Result) => {
    const line = winner(next)
    setBoard(next)
    setWinning(line ?? [])
    setDone(true)
    setThinking(false)
    setMessage(result === 'won' ? 'YOU WON' : result === 'draw' ? 'DRAW' : 'COPECADE WINS')
    audio.play(result === 'won' ? 'win' : result === 'draw' ? 'blip' : 'fail')
    onFinish({
      result: result === 'won' ? 'won' : 'lost',
      score: result === 'won' ? 3 : result === 'draw' ? 2 : 1,
      detail: result === 'won' ? 'You found the one crack in COPECADE.' : result === 'draw' ? 'A draw is still not a win.' : 'It baited the obvious block.',
      inputs: trace,
      betrayalSeen: result !== 'draw' || trace.some(move => move === 'O3')
    })
  }

  const play = (index: number) => {
    if (paused || done || thinking || board[index]) return
    const next = [...board]
    next[index] = 'X'
    const trace = [...moves, `X${index}`]
    audio.play('click')
    if (winner(next)) {
      finish(next, trace, 'won')
      return
    }
    if (next.every(Boolean)) {
      finish(next, trace, 'draw')
      return
    }

    setBoard(next)
    setMoves(trace)
    setMessage('COPECADE IS THINKING…')
    setThinking(true)
    audio.play('blip')
    timer.current = window.setTimeout(() => {
      const choice = botMove(next)
      if (choice === undefined) return
      next[choice] = 'O'
      const fullTrace = [...trace, `O${choice}`]
      if (winner(next)) finish(next, fullTrace, 'lost')
      else if (next.every(Boolean)) finish(next, fullTrace, 'draw')
      else {
        setBoard([...next])
        setMoves(fullTrace)
        setThinking(false)
        setMessage('YOUR TURN')
        audio.play('blip')
      }
    }, 360)
  }

  return <div className={`tictactoe-game ${thinking ? 'tictactoe-game--thinking' : ''} ${done ? 'tictactoe-game--done' : ''}`}>
    <div className="ttt-duel">
      <div><span>PLAYER</span><b className="ttt-symbol ttt-symbol--x">X</b></div>
      <Mascot mood={done && message === 'YOU WON' ? 'shock' : 'taunt'} className="ttt-opponent"/>
      <div><span>COPECADE AI</span><b className="ttt-symbol ttt-symbol--o">O</b></div>
    </div>
    <div className="duel-label"><span>YOU <b className="ttt-symbol--x">X</b></span><span className="ai-bubble">COPECADE: {message.toLowerCase()}</span><span><b className="ttt-symbol--o">O</b> COPECADE</span></div>
    <p className="game-tip">It blocks every obvious win. There is one narrow way through.</p>
    <div className="tictactoe-board" role="application" aria-label="Tic-tac-toe board" aria-busy={thinking}>
      {board.map((mark, index) => <button key={index} className={`tictactoe-cell ${mark ? `tictactoe-cell--${mark}` : ''} ${winning.includes(index) ? 'tictactoe-cell--winner' : ''}`} onClick={() => play(index)} aria-label={`cell ${index + 1}${mark ? `, ${mark}` : ''}`} disabled={Boolean(mark) || done || thinking}>
        {mark && <MarkIcon mark={mark as Mark}/>}
      </button>)}
      {winning.length === 3 && <span className={`ttt-win-line ttt-win-line--${winning.join('-')}`} aria-hidden="true"/>}
    </div>
    <p className={`ttt-status ttt-status--${message === 'YOU WON' ? 'win' : done ? 'loss' : 'live'}`}>{done ? copyFor(message === 'YOU WON' ? 'won' : message === 'DRAW' ? 'draw' : 'lost') : message}</p>
  </div>
}
