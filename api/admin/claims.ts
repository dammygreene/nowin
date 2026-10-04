import {
  CLAIM_STATUSES,
  ClaimInputError,
  VercelBlobClaimStore,
  hasBlobCredentials,
  jsonResponse,
  methodNotAllowed,
  validAdminSecret,
  type ClaimRecord,
  type ClaimStatus,
  type ClaimStore
} from '../_lib/claims'

interface AdminUpdateHandlerDependencies {
  store: ClaimStore
  isStorageConfigured: () => boolean
  isAdmin: (request: Request) => boolean
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

function nullableString(value: unknown, maximum: number, code: string): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string' || value.length > maximum) throw new ClaimInputError(code)
  return value.trim() || null
}

function isoOrNull(value: unknown): string | null {
  const timestamp = nullableString(value, 64, 'INVALID_REVIEWED_AT')
  if (timestamp === null) return null
  if (Number.isNaN(Date.parse(timestamp))) throw new ClaimInputError('INVALID_REVIEWED_AT')
  return new Date(timestamp).toISOString()
}

function parseUpdate(value: unknown): { claimId: string; status: ClaimStatus; reviewedAt: string | null; txSignature: string | null; notes: string | null } {
  if (!isPlainObject(value)) throw new ClaimInputError('MALFORMED_REQUEST')
  if (typeof value.claim_id !== 'string' || !/^[a-f0-9]{64}$/.test(value.claim_id)) throw new ClaimInputError('INVALID_CLAIM_ID')
  if (typeof value.status !== 'string' || !(CLAIM_STATUSES as readonly string[]).includes(value.status)) throw new ClaimInputError('INVALID_STATUS')
  const status = value.status as ClaimStatus
  const reviewedAt = isoOrNull(value.reviewed_at)
  const txSignature = nullableString(value.tx_signature, 256, 'INVALID_TX_SIGNATURE')
  if (status === 'PAID' && (!reviewedAt || !txSignature)) throw new ClaimInputError('PAID_REQUIRES_REVIEW_AND_SIGNATURE')
  return {
    claimId: value.claim_id,
    status,
    reviewedAt,
    txSignature,
    notes: nullableString(value.notes, 2_000, 'INVALID_NOTES')
  }
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text()
  if (!text || text.length > 4_096) throw new ClaimInputError('MALFORMED_REQUEST')
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ClaimInputError('MALFORMED_REQUEST')
  }
}

function updatedRecord(record: ClaimRecord, update: ReturnType<typeof parseUpdate>): ClaimRecord {
  return {
    ...record,
    status: update.status,
    reviewed_at: update.reviewedAt,
    tx_signature: update.txSignature,
    notes: update.notes
  }
}

export function createAdminUpdateHandler(dependencies: AdminUpdateHandlerDependencies) {
  return async function adminUpdateHandler(request: Request): Promise<Response> {
    if (request.method !== 'PATCH') return methodNotAllowed(['PATCH'])
    if (!dependencies.isAdmin(request)) return jsonResponse({ error: 'UNAUTHORIZED' }, 401)
    if (!dependencies.isStorageConfigured()) return jsonResponse({ error: 'CLAIM_STORAGE_NOT_CONFIGURED' }, 503)

    try {
      const update = parseUpdate(await readJson(request))
      const existing = await dependencies.store.read(update.claimId)
      if (!existing) return jsonResponse({ error: 'CLAIM_NOT_FOUND' }, 404)
      const record = updatedRecord(existing.record, update)
      await dependencies.store.update(record, existing.etag)
      return jsonResponse({ claim_id: record.claim_id, status: record.status, reviewed_at: record.reviewed_at }, 200)
    } catch (error) {
      if (error instanceof ClaimInputError) return jsonResponse({ error: error.code }, 400)
      return jsonResponse({ error: 'CLAIM_COULD_NOT_BE_UPDATED' }, 503)
    }
  }
}

const handler = createAdminUpdateHandler({
  store: new VercelBlobClaimStore(),
  isStorageConfigured: hasBlobCredentials,
  isAdmin: validAdminSecret
})

export default handler
