export interface ClaimStart { claimToken: string; status: 'verified' }
export interface ClaimResult { status: 'pending' | 'already_claimed'; signature?: string }
export interface RewardProvider {
  isEnabled(): boolean
  beginClaim(runId: string): Promise<ClaimStart>
  submitClaim(runId: string, wallet: string): Promise<ClaimResult>
}
const CLAIMS = 'nowin:claims'
const loadClaims = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(CLAIMS) || '{}') } catch { return {} } }
export const mockRewardProvider: RewardProvider = {
  isEnabled: () => false,
  beginClaim: async runId => ({ claimToken: `mock_verified_${runId}`, status: 'verified' }),
  submitClaim: async (runId, wallet) => {
    const claims = loadClaims()
    if (claims[runId]) return { status: 'already_claimed', signature: claims[runId] }
    const signature = `MOCK-${runId.slice(-7).toUpperCase()}-${wallet.slice(0, 4)}`
    claims[runId] = signature; localStorage.setItem(CLAIMS, JSON.stringify(claims))
    return { status: 'pending', signature }
  }
}
export const isSolanaAddress = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim())
