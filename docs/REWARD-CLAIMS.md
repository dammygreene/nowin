# COPECADE Reward Claims

## Scope

This is a minimal manual-review claim workflow:

`win → paste Solana public key → submit claim → PENDING review → team manually pays or rejects`

It does not connect a wallet, request a signature, send a transaction, store a private key, automate a payout, create a leaderboard, or expose winner data publicly.

## Storage and record format

Use a **private** Vercel Blob store. Connect it to the Vercel project and set the server-only `BLOB_READ_WRITE_TOKEN` environment variable. Claims are written directly from Vercel Functions; neither the browser nor the Vercel function filesystem is used as durable storage.

Each run has a deterministic SHA-256 claim ID and a create-only private record path:

```text
nowin-claims/records/<claim-id>.json
```

A successful submission stores this shape (with an internal `verification` note in addition to the required operational fields):

```json
{
  "claim_id": "sha256-of-run-id",
  "game": "snake",
  "wallet_address": "Solana public key",
  "run_id": "nw_...",
  "seed": 123,
  "score": 30,
  "completion_time": 41.82,
  "attempt_number": 2,
  "won_at": "2026-10-03T12:00:00.000Z",
  "status": "PENDING",
  "reviewed_at": null,
  "tx_signature": null,
  "notes": null,
  "verification": {
    "state": "PENDING_REVIEW",
    "reason": "SERVER_REPLAY_VERIFIER_NOT_CONFIGURED"
  }
}
```

The deterministic path is written with overwrite disabled. Two submissions for the same `run_id` therefore cannot create two claim records. A duplicate response returns the existing claim ID/status without exposing its wallet address.

## Verification boundary

The present game client has no server-issued run identity or replay verifier. The claim endpoint validates the submitted payload structure and Solana key **on the server**, then calls the isolated `verifyWinningRun` boundary. That boundary currently returns `PENDING_REVIEW` rather than treating client result data as a verified win.

A `PENDING` record is a manual-review queue item, not a reward approval and not a payment. Add server-issued runs plus deterministic server replay verification before treating a submitted result as an authoritative win.

## Admin workflow

Set a high-entropy server-only `COPECADE_ADMIN_SECRET` of at least 32 characters; never use a `VITE_` prefix.

All admin calls require this request header:

```text
Authorization: Bearer <COPECADE_ADMIN_SECRET>
```

### Export

`GET /api/admin/export` lists only private record blobs, generates CSV in this exact column order, writes the derived private file, and returns it as a download:

```text
claim_id
game
wallet_address
run_id
seed
score
completion_time
attempt_number
won_at
status
reviewed_at
tx_signature
notes
```

Private export path:

```text
nowin-claims/exports/nowin-winners.csv
```

The CSV escapes quotes, commas, and newlines; values that could be interpreted as spreadsheet formulas are prefixed with an apostrophe. The Blob URL is never returned to a player.

### Update after review

`PATCH /api/admin/claims` accepts only:

```json
{
  "claim_id": "<64-character claim id>",
  "status": "PAID",
  "reviewed_at": "2026-10-03T13:00:00.000Z",
  "tx_signature": "manual transaction signature",
  "notes": "Sent after manual review."
}
```

Allowed statuses: `PENDING`, `PAID`, `REJECTED`. A `PAID` update requires both an ISO `reviewed_at` value and a non-empty `tx_signature`. This endpoint never changes the game, run ID, score, seed, attempt number, or wallet address.

## Local setup

1. Create a **private** Vercel Blob store and connect it to this project.
2. Copy `.env.example` to `.env.local` and set non-empty local development values.
3. Run `npm run dev:vercel`, not Vite-only development, so Vercel Functions serve `/api/*`.
4. Use a protected HTTP client to exercise the admin endpoints. Do not put the admin secret in browser code, a query string, a public URL, or a committed file.

If Blob credentials are missing, `POST /api/claims` returns `CLAIM_STORAGE_NOT_CONFIGURED`; the UI reports that configuration state and does not fall back to local storage or a local CSV.

## Manual release test still required

Before describing claims as live, deploy to a Vercel environment with a private Blob store and run an actual win/claim/export/update sequence. Verify the private record and generated CSV from the admin route, then submit the same run again to confirm no second record is created.
