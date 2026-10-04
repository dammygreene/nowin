# COPECADE Arcade — Technical Architecture

## Shipped stack

- Vite 8
- React
- TypeScript
- Vercel Functions under `api/`
- Private Vercel Blob storage through `@vercel/blob`
- Server-side Solana public-key validation through `@solana/addresses`

The arcade client contains the game UI. Server-only claim code and secrets stay in Vercel Functions and are excluded from the client bundle.

## Runtime layers

### React shell and games

The application shell owns hash navigation, lobby, six cabinets, result state, responsive controls, and the post-win claim panel. Game modules hold active gameplay state in component refs/state. A result supplies the game, run ID, seed, score, completion time, attempt number, and completion timestamp to the claim UI.

### Claim API

`POST /api/claims`:

- accepts a wallet and a structured winning-result submission;
- validates payload size/shape, game identifier, finite values, ISO time, and Solana `PublicKey` server-side;
- calls `verifyWinningRun`, an explicit boundary for future server replay verification;
- currently writes only `PENDING`/`PENDING_REVIEW` records because a replay verifier is not configured;
- creates a deterministic SHA-256 record path for each run with overwrite disabled, providing atomic run-ID idempotency;
- rate-limits repeated requests in the active Vercel Function instance.

### Private storage

The record path is `nowin-claims/records/<claim-id>.json`; the derived export path is `nowin-claims/exports/nowin-winners.csv`. All Blob SDK calls use `access: 'private'`. Claims are never written to browser storage, a committed file, or the Vercel function filesystem.

### Admin API

`GET /api/admin/export` and `PATCH /api/admin/claims` require a timing-safe comparison with the server-only `COPECADE_ADMIN_SECRET` from an `Authorization: Bearer` header. They are not called by the browser UI.

The update route changes only `status`, `reviewed_at`, `tx_signature`, and `notes`; it cannot mutate a wallet or game result. Export reads private records, safely generates CSV, writes the private derived CSV, and streams a download only to an authenticated administrator.

## Security boundary

The client never receives `BLOB_READ_WRITE_TOKEN` or `COPECADE_ADMIN_SECRET`; neither may use a `VITE_` prefix. There are no private keys, signing credentials, wallet connections, client transaction signing, treasury integrations, or automatic payouts.

A pending submission is not proof of a legitimate win. Before claims can be marked automatically eligible, add server-issued run identities, normalized input capture, deterministic server replay verification, durable distributed rate limiting, abuse monitoring, and security/legal review.

## Quality gates

Automated API tests use an in-memory test double only; production code has no local-storage fallback. Tests cover valid/invalid claims, duplicate run protection, malformed data, missing fields, storage failure, CSV safety, admin authentication, admin updates, and export behavior. Real Vercel Blob persistence and browser win/claim interaction remain deployment-time manual checks documented in [`docs/QA-REPORT.md`](./docs/QA-REPORT.md).
