import { createHash, timingSafeEqual } from 'node:crypto'
import { get, list, put } from '@vercel/blob'
import { isAddress } from '@solana/addresses'

export const CLAIM_RECORD_PREFIX = 'nowin-claims/records/'
export const CLAIM_EXPORT_PATH = 'nowin-claims/exports/nowin-winners.csv'
export const CLAIM_STATUSES = ['PENDING', 'PAID', 'REJECTED'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]
export const GAME_IDS = ['snake', 'flap', 'tetris', 'cross', 'pong', 'tictactoe'] as const
export type ClaimGameId = (typeof GAME_IDS)[number]

export interface SubmittedWinningRun {
  run_id: string
  game: ClaimGameId
  result: 'won'
  seed: number
  score: number
  completion_time: number
  attempt_number: number
  won_at: string
}

export interface ClaimRecord {
  claim_id: string
  game: ClaimGameId
  wallet_address: string
  run_id: string
  seed: number
  score: number
  completion_time: number
  attempt_number: number
  won_at: string
  status: ClaimStatus
  reviewed_at: string | null
  tx_signature: string | null
  notes: string | null
  verification: {
    state: 'PENDING_REVIEW'
    reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED'
  }
}

export interface ClaimStore {
  create(record: ClaimRecord): Promise<void>
  read(claimId: string): Promise<{ record: ClaimRecord; etag?: string } | null>
  update(record: ClaimRecord, etag?: string): Promise<void>
  list(): Promise<ClaimRecord[]>
  writeExport(csv: string): Promise<void>
}

export class ClaimInputError extends Error {
  constructor(public readonly code: string) {
    super(code)
  }
}

export class ClaimDuplicateError extends Error {
  constructor(public readonly claimId: string) {
    super('CLAIM_ALREADY_EXISTS')
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isGameId = (value: unknown): value is ClaimGameId => typeof value === 'string' && (GAME_IDS as readonly string[]).includes(value)

function requiredString(value: unknown, code: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) throw new ClaimInputError(code)
  return value.trim()
}

function finiteNumber(value: unknown, code: string, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) throw new ClaimInputError(code)
  return value
}

function validIsoTimestamp(value: unknown): string {
  const timestamp = requiredString(value, 'INVALID_WON_AT', 64)
  if (Number.isNaN(Date.parse(timestamp))) throw new ClaimInputError('INVALID_WON_AT')
  return new Date(timestamp).toISOString()
}

export function normalizeSolanaWallet(value: unknown): string {
  const address = requiredString(value, 'MISSING_WALLET', 128)
  if (!isAddress(address)) throw new ClaimInputError('INVALID_SOLANA_WALLET')
  return address
}

export function parseWinningRun(value: unknown): SubmittedWinningRun {
  if (!isPlainObject(value)) throw new ClaimInputError('MALFORMED_REQUEST')
  const runId = requiredString(value.run_id, 'MISSING_RUN_ID', 160)
  if (!/^nw_[a-z0-9_]+$/i.test(runId)) throw new ClaimInputError('INVALID_RUN_ID')
  if (!isGameId(value.game)) throw new ClaimInputError('INVALID_GAME')
  if (value.result !== 'won') throw new ClaimInputError('WINNING_RESULT_REQUIRED')

  return {
    run_id: runId,
    game: value.game,
    result: 'won',
    seed: finiteNumber(value.seed, 'INVALID_SEED', 0, 0xffffffff),
    score: finiteNumber(value.score, 'INVALID_SCORE', 0, 10_000_000),
    completion_time: finiteNumber(value.completion_time, 'INVALID_COMPLETION_TIME', 0.01, 86_400),
    attempt_number: finiteNumber(value.attempt_number, 'INVALID_ATTEMPT_NUMBER', 1, 1_000_000),
    won_at: validIsoTimestamp(value.won_at)
  }
}

export function parseClaimSubmission(value: unknown): { walletAddress: string; run: SubmittedWinningRun } {
  if (!isPlainObject(value)) throw new ClaimInputError('MALFORMED_REQUEST')
  return { walletAddress: normalizeSolanaWallet(value.wallet_address), run: parseWinningRun(value.winning_result) }
}

/**
 * The browser game currently has no server replay verifier. This deliberate
 * boundary makes every submitted win a manual-review record, never an approved
 * reward or an automatic payout instruction.
 */
export async function verifyWinningRun(_run: SubmittedWinningRun): Promise<ClaimRecord['verification']> {
  return { state: 'PENDING_REVIEW', reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED' }
}

export function claimIdForRun(runId: string): string {
  return createHash('sha256').update(runId).digest('hex')
}

export function claimPath(claimId: string): string {
  return `${CLAIM_RECORD_PREFIX}${claimId}.json`
}

export function buildClaimRecord(walletAddress: string, run: SubmittedWinningRun, verification: ClaimRecord['verification']): ClaimRecord {
  return {
    claim_id: claimIdForRun(run.run_id),
    game: run.game,
    wallet_address: walletAddress,
    run_id: run.run_id,
    seed: run.seed,
    score: run.score,
    completion_time: run.completion_time,
    attempt_number: run.attempt_number,
    won_at: run.won_at,
    status: 'PENDING',
    reviewed_at: null,
    tx_signature: null,
    notes: null,
    verification
  }
}

function parseStoredClaim(value: unknown): ClaimRecord {
  if (!isPlainObject(value)) throw new Error('Invalid claim record')
  const run = parseWinningRun({
    run_id: value.run_id,
    game: value.game,
    result: 'won',
    seed: value.seed,
    score: value.score,
    completion_time: value.completion_time,
    attempt_number: value.attempt_number,
    won_at: value.won_at
  })
  const claimId = requiredString(value.claim_id, 'INVALID_CLAIM_ID', 128)
  if (claimId !== claimIdForRun(run.run_id)) throw new Error('Claim ID does not match run ID')
  const wallet = normalizeSolanaWallet(value.wallet_address)
  const status = value.status
  if (!(CLAIM_STATUSES as readonly string[]).includes(String(status))) throw new Error('Invalid claim status')
  const nullableString = (field: unknown, maxLength: number): string | null => {
    if (field === null) return null
    return requiredString(field, 'INVALID_CLAIM_RECORD', maxLength)
  }
  const reviewedAt = value.reviewed_at === null ? null : validIsoTimestamp(value.reviewed_at)
  const verification = { state: 'PENDING_REVIEW' as const, reason: 'SERVER_REPLAY_VERIFIER_NOT_CONFIGURED' as const }

  return {
    claim_id: claimId,
    game: run.game,
    wallet_address: wallet,
    run_id: run.run_id,
    seed: run.seed,
    score: run.score,
    completion_time: run.completion_time,
    attempt_number: run.attempt_number,
    won_at: run.won_at,
    status: status as ClaimStatus,
    reviewed_at: reviewedAt,
    tx_signature: nullableString(value.tx_signature, 256),
    notes: nullableString(value.notes, 2_000),
    verification
  }
}

async function jsonFromPrivateBlob(pathname: string): Promise<{ record: ClaimRecord; etag: string } | null> {
  const result = await get(pathname, { access: 'private', useCache: false })
  if (!result || result.statusCode !== 200) return null
  const text = await new Response(result.stream).text()
  return { record: parseStoredClaim(JSON.parse(text)), etag: result.blob.etag }
}

export class VercelBlobClaimStore implements ClaimStore {
  async create(record: ClaimRecord): Promise<void> {
    try {
      await put(claimPath(record.claim_id), JSON.stringify(record), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'application/json; charset=utf-8'
      })
    } catch (error) {
      // A create-only deterministic pathname makes this read an idempotency
      // check even when the storage service surfaces a provider-specific conflict.
      const existing = await this.read(record.claim_id).catch(() => null)
      if (existing) throw new ClaimDuplicateError(record.claim_id)
      throw error
    }
  }

  async read(claimId: string): Promise<{ record: ClaimRecord; etag?: string } | null> {
    return jsonFromPrivateBlob(claimPath(claimId))
  }

  async update(record: ClaimRecord, etag?: string): Promise<void> {
    await put(claimPath(record.claim_id), JSON.stringify(record), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      ifMatch: etag,
      contentType: 'application/json; charset=utf-8'
    })
  }

  async list(): Promise<ClaimRecord[]> {
    const records: ClaimRecord[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: CLAIM_RECORD_PREFIX, cursor, limit: 1_000 })
      for (const blob of page.blobs) {
        const stored = await jsonFromPrivateBlob(blob.pathname)
        if (stored) records.push(stored.record)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    return records.sort((left, right) => left.won_at.localeCompare(right.won_at) || left.claim_id.localeCompare(right.claim_id))
  }

  async writeExport(csv: string): Promise<void> {
    await put(CLAIM_EXPORT_PATH, csv, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'text/csv; charset=utf-8'
    })
  }
}

export const csvColumns = ['claim_id', 'game', 'wallet_address', 'run_id', 'seed', 'score', 'completion_time', 'attempt_number', 'won_at', 'status', 'reviewed_at', 'tx_signature', 'notes'] as const

export function csvEscape(value: string | number | null): string {
  const raw = value === null ? '' : String(value)
  const formulaSafe = /^[\t\r\n ]*[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${formulaSafe.replaceAll('"', '""')}"`
}

export function claimsToCsv(records: ClaimRecord[]): string {
  const rows = records.map(record => [
    record.claim_id,
    record.game,
    record.wallet_address,
    record.run_id,
    record.seed,
    record.score,
    record.completion_time,
    record.attempt_number,
    record.won_at,
    record.status,
    record.reviewed_at,
    record.tx_signature,
    record.notes
  ].map(csvEscape).join(','))
  return `${csvColumns.join(',')}\n${rows.join('\n')}${rows.length ? '\n' : ''}`
}

export function hasBlobCredentials(environment: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(environment.BLOB_READ_WRITE_TOKEN || (environment.VERCEL_OIDC_TOKEN && environment.BLOB_STORE_ID))
}

export function validAdminSecret(request: Request, environment: NodeJS.ProcessEnv = process.env): boolean {
  const expected = environment.NOWIN_ADMIN_SECRET
  const authorization = request.headers.get('authorization')
  if (!expected || expected.length < 32 || !authorization?.startsWith('Bearer ')) return false
  const provided = authorization.slice('Bearer '.length)
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer)
}

export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>()

  constructor(private readonly maximum = 6, private readonly windowMs = 10 * 60 * 1_000) {}

  allow(request: Request, now = Date.now()): boolean {
    const forwarded = request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const key = forwarded || 'unknown-client'
    const fresh = (this.hits.get(key) ?? []).filter(time => time > now - this.windowMs)
    if (fresh.length >= this.maximum) {
      this.hits.set(key, fresh)
      return false
    }
    fresh.push(now)
    this.hits.set(key, fresh)
    return true
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export function methodNotAllowed(methods: string[]): Response {
  return new Response(null, { status: 405, headers: { Allow: methods.join(', '), 'Cache-Control': 'no-store' } })
}
