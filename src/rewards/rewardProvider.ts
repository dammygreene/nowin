export interface ClaimStart { claimToken: string; status: 'verified' }
export interface ClaimResult { status: 'pending' | 'already_claimed' }
/** Interface for a server-only production adapter. No client implementation is enabled. */
export interface RewardProvider {
  isEnabled(): boolean
  beginClaim(runId: string): Promise<ClaimStart>
  submitClaim(runId: string, wallet: string): Promise<ClaimResult>
}
/** UX-only format check; server-side ownership and replay verification remain authoritative. */
export const isSolanaAddress = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim())
