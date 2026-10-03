import {
  ClaimDuplicateError,
  ClaimInputError,
  SlidingWindowRateLimiter,
  VercelBlobClaimStore,
  buildClaimRecord,
  hasBlobCredentials,
  jsonResponse,
  methodNotAllowed,
  parseClaimSubmission,
  verifyWinningRun,
  type ClaimStore
} from './_lib/claims'

interface ClaimHandlerDependencies {
  store: ClaimStore
  isStorageConfigured: () => boolean
  verify: typeof verifyWinningRun
  limiter: SlidingWindowRateLimiter
}

const responseForInputError = (error: ClaimInputError): Response => jsonResponse({ error: error.code }, 400)

async function readJsonRequest(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 12_000) throw new ClaimInputError('MALFORMED_REQUEST')
  const text = await request.text()
  if (!text || text.length > 12_000) throw new ClaimInputError('MALFORMED_REQUEST')
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ClaimInputError('MALFORMED_REQUEST')
  }
}

export function createClaimHandler(dependencies: ClaimHandlerDependencies) {
  return async function claimHandler(request: Request): Promise<Response> {
    if (request.method !== 'POST') return methodNotAllowed(['POST'])
    if (!dependencies.isStorageConfigured()) return jsonResponse({ error: 'CLAIM_STORAGE_NOT_CONFIGURED' }, 503)
    if (!dependencies.limiter.allow(request)) return jsonResponse({ error: 'RATE_LIMITED' }, 429)

    try {
      const submission = parseClaimSubmission(await readJsonRequest(request))
      const verification = await dependencies.verify(submission.run)
      const record = buildClaimRecord(submission.walletAddress, submission.run, verification)
      await dependencies.store.create(record)
      return jsonResponse({ claim_id: record.claim_id, status: record.status, verification: record.verification.state }, 201)
    } catch (error) {
      if (error instanceof ClaimInputError) return responseForInputError(error)
      if (error instanceof ClaimDuplicateError) {
        const existing = await dependencies.store.read(error.claimId).catch(() => null)
        return jsonResponse({
          error: 'DUPLICATE_RUN',
          claim_id: error.claimId,
          status: existing?.record.status ?? 'PENDING'
        }, 409)
      }
      return jsonResponse({ error: 'CLAIM_COULD_NOT_BE_SAVED' }, 503)
    }
  }
}

const handler = createClaimHandler({
  store: new VercelBlobClaimStore(),
  isStorageConfigured: hasBlobCredentials,
  verify: verifyWinningRun,
  limiter: new SlidingWindowRateLimiter()
})

export default handler
