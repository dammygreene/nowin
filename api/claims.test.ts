import { describe, expect, it } from 'vitest'
import { createAdminUpdateHandler } from './admin/claims'
import { createExportHandler } from './admin/export'
import { createClaimHandler } from './claims'
import {
  ClaimDuplicateError,
  SlidingWindowRateLimiter,
  buildClaimRecord,
  claimsToCsv,
  type ClaimRecord,
  type ClaimStore
} from './_lib/claims'

const validWallet = '11111111111111111111111111111111'

class MemoryClaimStore implements ClaimStore {
  readonly records = new Map<string, ClaimRecord>()
  exportText = ''
  failCreate = false

  async create(record: ClaimRecord): Promise<void> {
    if (this.failCreate) throw new Error('Blob unavailable')
    if (this.records.has(record.claim_id)) throw new ClaimDuplicateError(record.claim_id)
    this.records.set(record.claim_id, structuredClone(record))
  }

  async read(claimId: string): Promise<{ record: ClaimRecord; etag?: string } | null> {
    const record = this.records.get(claimId)
    return record ? { record: structuredClone(record), etag: 'version-1' } : null
  }

  async update(record: ClaimRecord): Promise<void> {
    this.records.set(record.claim_id, structuredClone(record))
  }

  async list(): Promise<ClaimRecord[]> {
    return [...this.records.values()].map(record => structuredClone(record))
  }

  async writeExport(csv: string): Promise<void> {
    this.exportText = csv
  }
}

function winningPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    wallet_address: validWallet,
    winning_result: {
      run_id: 'nw_claim_test_run',
      game: 'snake',
      result: 'won',
      seed: 42,
      score: 30,
      completion_time: 41.82,
      attempt_number: 2,
      won_at: '2026-10-03T12:00:00.000Z'
    },
    ...overrides
  }
}

function claimRequest(body: unknown): Request {
  return new Request('https://nowin.test/api/claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.8' },
    body: JSON.stringify(body)
  })
}

function claimHandler(store: MemoryClaimStore) {
  return createClaimHandler({
    store,
    isStorageConfigured: () => true,
    verify: async () => ({ state: 'PENDING_REVIEW', reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED' }),
    limiter: new SlidingWindowRateLimiter()
  })
}

async function createStoredClaim(store: MemoryClaimStore): Promise<string> {
  const response = await claimHandler(store)(claimRequest(winningPayload()))
  expect(response.status).toBe(201)
  const body = await response.json() as { claim_id: string }
  return body.claim_id
}

describe('reward claim endpoint', () => {
  it('stores a valid wallet claim as PENDING manual review', async () => {
    const store = new MemoryClaimStore()
    const response = await claimHandler(store)(claimRequest(winningPayload()))

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ status: 'PENDING', verification: 'PENDING_REVIEW' })
    const record = [...store.records.values()][0]
    expect(record).toMatchObject({
      game: 'snake',
      wallet_address: validWallet,
      run_id: 'nw_claim_test_run',
      score: 30,
      completion_time: 41.82,
      attempt_number: 2,
      status: 'PENDING',
      reviewed_at: null,
      tx_signature: null,
      notes: null,
      verification: { state: 'PENDING_REVIEW' }
    })
  })

  it('rejects an invalid Solana wallet without saving a claim', async () => {
    const store = new MemoryClaimStore()
    const response = await claimHandler(store)(claimRequest(winningPayload({ wallet_address: 'definitely-not-a-solana-key' })))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'INVALID_SOLANA_WALLET' })
    expect(store.records.size).toBe(0)
  })

  it('returns the existing claim identity for a duplicate run without creating a second record', async () => {
    const store = new MemoryClaimStore()
    const handler = claimHandler(store)
    const first = await handler(claimRequest(winningPayload()))
    const firstBody = await first.json() as { claim_id: string }
    const duplicate = await handler(claimRequest(winningPayload({ wallet_address: 'SysvarC1ock11111111111111111111111111111111' })))

    expect(duplicate.status).toBe(409)
    expect(await duplicate.json()).toMatchObject({ error: 'DUPLICATE_RUN', claim_id: firstBody.claim_id, status: 'PENDING' })
    expect(store.records.size).toBe(1)
  })

  it('rejects malformed, missing-wallet, and missing-run requests', async () => {
    const store = new MemoryClaimStore()
    const handler = claimHandler(store)
    const malformed = await handler(new Request('https://nowin.test/api/claims', { method: 'POST', body: '{' }))
    const missingWallet = await handler(claimRequest({ winning_result: winningPayload().winning_result }))
    const missingRun = await handler(claimRequest(winningPayload({ winning_result: { ...winningPayload().winning_result as Record<string, unknown>, run_id: undefined } })))

    expect(await malformed.json()).toEqual({ error: 'MALFORMED_REQUEST' })
    expect(await missingWallet.json()).toEqual({ error: 'MISSING_WALLET' })
    expect(await missingRun.json()).toEqual({ error: 'MISSING_RUN_ID' })
  })

  it('does not report success when durable storage fails', async () => {
    const store = new MemoryClaimStore()
    store.failCreate = true
    const response = await claimHandler(store)(claimRequest(winningPayload()))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'CLAIM_COULD_NOT_BE_SAVED' })
  })

  it('reports missing durable-storage configuration without a local fallback', async () => {
    const store = new MemoryClaimStore()
    const handler = createClaimHandler({
      store,
      isStorageConfigured: () => false,
      verify: async () => ({ state: 'PENDING_REVIEW', reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED' }),
      limiter: new SlidingWindowRateLimiter()
    })
    const response = await handler(claimRequest(winningPayload()))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'CLAIM_STORAGE_NOT_CONFIGURED' })
    expect(store.records.size).toBe(0)
  })
})

describe('admin claim operations', () => {
  const isAdmin = (request: Request) => request.headers.get('authorization') === 'Bearer admin-test-secret'

  it('requires admin authentication for export and updates', async () => {
    const store = new MemoryClaimStore()
    const exportHandler = createExportHandler({ store, isStorageConfigured: () => true, isAdmin })
    const updateHandler = createAdminUpdateHandler({ store, isStorageConfigured: () => true, isAdmin })

    expect((await exportHandler(new Request('https://nowin.test/api/admin/export'))).status).toBe(401)
    expect((await updateHandler(new Request('https://nowin.test/api/admin/claims', { method: 'PATCH', body: '{}' }))).status).toBe(401)
  })

  it('updates only manual-review fields for an authenticated administrator', async () => {
    const store = new MemoryClaimStore()
    const claimId = await createStoredClaim(store)
    const handler = createAdminUpdateHandler({ store, isStorageConfigured: () => true, isAdmin })
    const response = await handler(new Request('https://nowin.test/api/admin/claims', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer admin-test-secret' },
      body: JSON.stringify({
        claim_id: claimId,
        status: 'PAID',
        reviewed_at: '2026-10-03T13:00:00.000Z',
        tx_signature: 'manual-transaction-signature',
        notes: 'Sent after manual review.',
        wallet_address: 'SysvarC1ock11111111111111111111111111111111'
      })
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ claim_id: claimId, status: 'PAID' })
    expect(store.records.get(claimId)).toMatchObject({
      status: 'PAID',
      reviewed_at: '2026-10-03T13:00:00.000Z',
      tx_signature: 'manual-transaction-signature',
      notes: 'Sent after manual review.',
      wallet_address: validWallet
    })
  })

  it('rejects a PAID status without a review timestamp and transaction signature', async () => {
    const store = new MemoryClaimStore()
    const claimId = await createStoredClaim(store)
    const handler = createAdminUpdateHandler({ store, isStorageConfigured: () => true, isAdmin })
    const response = await handler(new Request('https://nowin.test/api/admin/claims', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer admin-test-secret' },
      body: JSON.stringify({ claim_id: claimId, status: 'PAID', reviewed_at: null, tx_signature: null, notes: null })
    }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'PAID_REQUIRES_REVIEW_AND_SIGNATURE' })
    expect(store.records.get(claimId)?.status).toBe('PENDING')
  })

  it('creates a private CSV export containing the submitted record', async () => {
    const store = new MemoryClaimStore()
    await createStoredClaim(store)
    const handler = createExportHandler({ store, isStorageConfigured: () => true, isAdmin })
    const response = await handler(new Request('https://nowin.test/api/admin/export', { headers: { Authorization: 'Bearer admin-test-secret' } }))
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-disposition')).toContain('nowin-winners.csv')
    expect(csv).toBe(store.exportText)
    expect(csv).toContain(`"${validWallet}"`)
    expect(csv).toContain('"nw_claim_test_run"')
    expect(csv).toContain('"PENDING"')
  })
})

describe('CSV safety', () => {
  it('escapes quotes, commas, newlines, and spreadsheet formulas', () => {
    const record = buildClaimRecord(validWallet, {
      run_id: 'nw_csv_safety_run',
      game: 'pong',
      result: 'won',
      seed: 5,
      score: 7,
      completion_time: 12.34,
      attempt_number: 1,
      won_at: '2026-10-03T12:00:00.000Z'
    }, { state: 'PENDING_REVIEW', reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED' })
    record.notes = '=SUM(1,1), "quoted"\nnext line'
    const csv = claimsToCsv([record])

    expect(csv).toContain("'=SUM(1,1), \"\"quoted\"\"\nnext line")
    expect(csv.split('\n')[0]).toBe('claim_id,game,wallet_address,run_id,seed,score,completion_time,attempt_number,won_at,status,reviewed_at,tx_signature,notes')
  })
})
