import { useState, type FormEvent } from 'react'
import type { GameResult } from '../game-core/types'
import { Arrow } from './Arrow'

type ClaimView = 'form' | 'submitting' | 'received' | 'error'

const errorCopy: Record<string, { title: string; detail?: string }> = {
  INVALID_SOLANA_WALLET: { title: "THAT WALLET ISN'T VALID." },
  MISSING_WALLET: { title: "THAT WALLET ISN'T VALID." },
  DUPLICATE_RUN: { title: 'THIS WIN HAS ALREADY BEEN CLAIMED.' },
  CLAIM_STORAGE_NOT_CONFIGURED: { title: "CLAIM SERVICE ISN'T CONFIGURED.", detail: 'Rewards cannot be submitted until secure storage is configured.' },
  CLAIM_COULD_NOT_BE_SAVED: { title: "CLAIM COULDN'T BE SAVED.", detail: 'TRY AGAIN.' },
  RATE_LIMITED: { title: 'TOO MANY CLAIM ATTEMPTS.', detail: 'TRY AGAIN LATER.' }
}

function durationInSeconds(result: GameResult): number {
  return Math.max(0.01, Number(((result.endedAt - result.startedAt) / 1_000).toFixed(2)))
}

export function ClaimPanel({ result, attemptNumber }: { result: GameResult; attemptNumber: number }) {
  const [wallet, setWallet] = useState('')
  const [view, setView] = useState<ClaimView>('form')
  const [error, setError] = useState<{ title: string; detail?: string } | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setView('submitting')
    setError(null)
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          winning_result: {
            run_id: result.runId,
            game: result.gameId,
            result: result.result,
            seed: result.seed,
            score: result.score,
            completion_time: durationInSeconds(result),
            attempt_number: attemptNumber,
            won_at: new Date(result.endedAt).toISOString()
          }
        })
      })
      const payload: unknown = await response.json().catch(() => null)
      const code = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'SERVER_ERROR'
      if (!response.ok) {
        setError(errorCopy[code] ?? { title: 'SOMETHING BROKE.', detail: 'TRY AGAIN.' })
        setView('error')
        return
      }
      setView('received')
    } catch {
      setError({ title: 'SOMETHING BROKE.', detail: 'TRY AGAIN.' })
      setView('error')
    }
  }

  if (view === 'received') {
    return <section className="claim-panel claim-panel--received" aria-live="polite"><h3>CLAIM RECEIVED</h3><p>Your wallet has been recorded.</p><p>Rewards are reviewed manually.</p><small>No additional wallet connection is required.</small></section>
  }

  return <section className="claim-panel" aria-live="polite"><p className="kicker">YOU ARE IN THE 1%</p><h3>CLAIM YOUR REWARD</h3><p>You actually beat NOWIN.</p><form onSubmit={submit}><label htmlFor={`wallet-${result.runId}`}>SOLANA WALLET</label><input id={`wallet-${result.runId}`} name="wallet" value={wallet} onChange={event => setWallet(event.target.value)} placeholder="paste wallet address" autoComplete="off" spellCheck="false" required disabled={view === 'submitting'} /><button className="arcade-button button--lime" type="submit" disabled={view === 'submitting'}>{view === 'submitting' ? 'SAVING CLAIM…' : <>SUBMIT CLAIM <Arrow/></>}</button></form>{error && <p className="claim-panel__error"><b>{error.title}</b>{error.detail && <span>{error.detail}</span>}</p>}</section>
}
