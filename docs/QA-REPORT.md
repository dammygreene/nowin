# NOWIN Final Production Audit + Reward-Claim QA

**Audit date:** 2026-10-03

**Build examined:** local branch `arena/01a1014e-nowin`

**Result:** automated claim/API checks and production client build pass. Real Vercel Blob persistence, real-browser gameplay, and real browser claim flow remain **unverified**.

This report separates tests actually run from deployment-time checks still blocked by unavailable credentials/browser tooling. It does not treat an in-memory test double, static HTTP request, or client result object as durable production evidence.

## 1. Live game inventory

The runtime metadata contains exactly six launch cabinets:

1. Snake
2. Flap
3. Tetris
4. Cross
5. Pong
6. Tic-Tac-Toe

The runtime-source audit found no references to retired launch games (Minesweeper, 2048, Connect Four, or Noughts). There are six cabinet entries in `src/game-core/types.ts`.

## 2–3. Winning routes and reproduced fresh-run wins

| Game | Winning trick observed through play | Fresh-run wins reproduced |
| --- | --- | ---: |
| Snake | Not observed — interactive browser unavailable. | 0 |
| Flap | Not observed — interactive browser unavailable. | 0 |
| Tetris | Not observed — interactive browser unavailable. | 0 |
| Cross | Not observed — interactive browser unavailable. | 0 |
| Pong | Not observed — interactive browser unavailable. | 0 |
| Tic-Tac-Toe | Not observed — interactive browser unavailable. | 0 |

No source-derived route is presented as gameplay evidence. See [`WINNING-GUIDE.md`](./WINNING-GUIDE.md) for the required follow-up protocol.

## 4. Reward claim implementation

Implemented production-facing components:

- Post-win NOWIN-styled claim panel: Solana wallet input, `SUBMIT CLAIM`, exact error states, and `CLAIM RECEIVED` only after a successful API response.
- `POST /api/claims`: server-side JSON/payload validation, official `@solana/addresses` public-key validation, per-instance IP/client rate limiting, and deterministic run-ID idempotency.
- Private Vercel Blob record design: `nowin-claims/records/<claim-id>.json` with overwrite disabled.
- `GET /api/admin/export`: server-secret-protected private CSV generation and download; writes `nowin-claims/exports/nowin-winners.csv` privately.
- `PATCH /api/admin/claims`: server-secret-protected manual update of only `status`, `reviewed_at`, `tx_signature`, and `notes`.
- CSV quote/comma/newline escaping plus spreadsheet-formula neutralization.
- `.env.example` with placeholders only for `BLOB_READ_WRITE_TOKEN` and `NOWIN_ADMIN_SECRET`.

The server has **no replay verifier**. `verifyWinningRun` is a deliberately isolated interface that presently returns `PENDING_REVIEW`; saved claims have `status: PENDING` and are not verified, approved, or paid. The claim system does not silently trust a client win as reward eligibility.

## 5. Storage and privacy status

The production code uses `@vercel/blob` with `access: 'private'`; it has no browser-storage, local-file, committed-CSV, or public-Blob fallback. Private records and the derived export are only accessed by server functions.

No actual Blob store/token is configured in this audit workspace. An attempted `npx --yes vercel dev --listen 4174` also stopped before serving because this environment has no Vercel CLI credentials. Therefore the following are **implemented but not verified against Vercel storage**:

- record persistence;
- private-access enforcement by Vercel;
- duplicate conflict behavior returned by Vercel Blob;
- generated private CSV blob;
- admin-secret behavior in a deployed function.

No wallet address was submitted, logged, or persisted during this audit.

## 6. Systems intentionally unavailable

- Server-issued game runs and authoritative replay verification.
- Automated eligibility approval and automatic payouts.
- Wallet connection, wallet signature, treasury, private keys, or transaction signing.
- Accounts, player profiles, leaderboard, ranks, global stats, winner feed, daily challenge, and shared seed.

## 7. Build and automated checks — passed

After `npm install`, the following completed successfully:

| Command | Result |
| --- | --- |
| `npm test -- --run` | Passed: 4 files, 22 tests. Includes claim, duplicate, configuration/storage-failure, CSV, export, paid-status, and admin cases using an in-memory test double. |
| `npm run lint` | Passed for `src` and `api`; 0 warnings permitted. |
| `npm run typecheck` | Passed for both application and Vercel API TypeScript projects. |
| `npm run build` | Passed: Vite production client bundle generated. |

`npm audit` completed with **0 vulnerabilities** after the final dependency set was installed.

## 8. Browser, mobile, console, and network QA — not performed

No Chromium, Chrome, or Chromium-browser executable is installed in this environment. An attempted `npx --yes playwright install chromium` failed after repeated CDN TLS connection resets, so an actual browser could not be provisioned.

Consequently, no actual desktop rendering at 1280×800/1440×900, mobile rendering at 390×844/430×932, gameplay, result interaction, console inspection, browser network inspection, or claim UI submission was performed.

A non-browser production-preview smoke check previously returned HTTP 200 for the static Vite entry and bundled JS/CSS/image assets. This confirms static serving only. Vite preview does not execute Vercel Functions and cannot verify `/api/*` routes.

## 9. Actual manual claim and CSV verification

| Required manual evidence | Result |
| --- | --- |
| Real game win | Not performed — browser unavailable. |
| Valid wallet submitted to configured Vercel API | Not performed — no private Blob credentials/store configured. |
| Durable record confirmed in Blob | Not performed. |
| Same run confirmed duplicate against Blob | Not performed. |
| Admin export CSV downloaded from deployed API | Not performed. |
| Export CSV inspected against a durable record | Not performed. |

## 10. Known limitations / deployment blockers

1. All six games have zero observed browser fresh-run wins; the target of three independent wins per game is incomplete.
2. There is no server-side replay verifier. Claims are manual-review intake only and must not be described as verified rewards or payments.
3. Private Blob storage is implemented in code but not configured/tested with real credentials in this environment.
4. Real browser desktop/mobile QA, console/network inspection, and claim UI interaction remain unperformed.
5. This build must **not** be described as reward-live or deployment-ready until the real Vercel/Blob/browser protocol is completed.
