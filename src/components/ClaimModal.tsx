import { useState } from 'react'
import { isSolanaAddress, mockRewardProvider } from '../rewards/rewardProvider'

export function ClaimModal({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [wallet, setWallet] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<'form' | 'pending' | 'claimed'>('form')
  const claim = async () => {
    if (!isSolanaAddress(wallet)) { setError('That is not a valid Solana address. Check it.'); return }
    const answer = await mockRewardProvider.submitClaim(runId, wallet)
    setState(answer.status === 'already_claimed' ? 'claimed' : 'pending')
  }
  return <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Claim mock reward">
    <section className="claim-modal">
      <button className="close-button" onClick={onClose} aria-label="Close">×</button>
      <p className="kicker">MOCK REWARD MODE</p>
      <h2>{state === 'form' ? 'CLAIM YOUR WIN' : state === 'pending' ? 'CLAIM QUEUED.' : 'ALREADY CLAIMED.'}</h2>
      {state === 'form' ? <><p>Paste the Solana wallet that should receive your verified winner reward.</p><input aria-label="Solana wallet address" value={wallet} onChange={event => { setWallet(event.target.value); setError('') }} placeholder="Your Solana address" /><small>Double-check it. Rewards sent to the wrong address may not be recoverable.</small>{error && <strong className="form-error">{error}</strong>}<button className="arcade-button button--pink" onClick={claim}>CREATE MOCK CLAIM</button></> : <><div className="claim-stamp">VERIFIED<br/>LOCAL</div><p>{state === 'pending' ? 'Your demo claim is pending manual review. No real payout was sent.' : 'This run already has a local mock claim.'}</p><button className="arcade-button" onClick={onClose}>NICE.</button></>}
    </section>
  </div>
}
