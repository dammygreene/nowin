import {
  VercelBlobClaimStore,
  claimsToCsv,
  hasBlobCredentials,
  jsonResponse,
  methodNotAllowed,
  validAdminSecret,
  type ClaimStore
} from '../_lib/claims'

interface ExportHandlerDependencies {
  store: ClaimStore
  isStorageConfigured: () => boolean
  isAdmin: (request: Request) => boolean
}

export function createExportHandler(dependencies: ExportHandlerDependencies) {
  return async function exportHandler(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed(['GET'])
    if (!dependencies.isAdmin(request)) return jsonResponse({ error: 'UNAUTHORIZED' }, 401)
    if (!dependencies.isStorageConfigured()) return jsonResponse({ error: 'CLAIM_STORAGE_NOT_CONFIGURED' }, 503)

    try {
      const csv = claimsToCsv(await dependencies.store.list())
      await dependencies.store.writeExport(csv)
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nowin-winners.csv"',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      })
    } catch {
      return jsonResponse({ error: 'EXPORT_COULD_NOT_BE_GENERATED' }, 503)
    }
  }
}

const handler = createExportHandler({
  store: new VercelBlobClaimStore(),
  isStorageConfigured: hasBlobCredentials,
  isAdmin: validAdminSecret
})

export default handler
