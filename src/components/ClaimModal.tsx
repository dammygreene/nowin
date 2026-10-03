import { useState } from 'react'
import { isSolanaAddress } from '../rewards/rewardProvider'

/** Production reward claims require a server-issued replay verification token. */
export function ClaimModal({ runId: _runId, onClose }: { runId: string; onClose: () => void }) {
  const [wallet, setWallet] = useState(''); const [error, setError] = useState(''); const [submitted, setSubmitted] = useState(false)
  const submit = () => { if (!isSolanaAddress(wallet)) { setError('Enter a valid Solana wallet address.'); return } setSubmitted(true) }
  return <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Reward system status"><section className="claim-modal"><button className="close-button" onClick={onClose} aria-label="Close">×</button><p className="kicker">DEMO MODE · NO PAYOUT PROVIDER</p><h2>{submitted ? 'REWARD SYSTEM COMING ONLINE.' : 'CLAIM YOUR REWARD'}</h2>{submitted ? <><div className="claim-stamp">NOT<br/>SUBMITTED</div><p>Your wallet format was checked locally, but this run cannot create a reward claim until the production verifier and payout service are online.</p><button className="arcade-button" onClick={onClose}>GOT IT.</button></> : <><p>Paste your Solana wallet to check the claim form. This local demo never sends a wallet, score, or payout request.</p><input aria-label="Solana wallet address" value={wallet} onChange={event => { setWallet(event.target.value); setError('') }} placeholder="SOLANA WALLET"/><small>Production claims will only open after server replay verification. No reward has been sent.</small>{error && <strong className="form-error">{error}</strong>}<button className="arcade-button button--pink" onClick={submit}>CHECK DEMO FORM</button></>}</section></div>
}
