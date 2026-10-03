# NOWIN Arcade

**GAMES YOU KNOW. WINS YOU DON'T.**

NOWIN is a browser arcade of six familiar games. Each cabinet has a deterministic NOWIN betrayal: obvious play is countered, but a repeatable route remains for players who learn the pattern.

## Launch cabinets

| Solo | VS NOWIN AI |
| --- | --- |
| Snake | Cross |
| Flap | Pong |
| Tetris | Tic-Tac-Toe |

## Local development

```bash
npm install
npm run dev -- --host 0.0.0.0
```

For the Vercel API routes as well as the client, configure `.env.local` from [`.env.example`](./.env.example) and run:

```bash
npm run dev:vercel
```

`npm run dev` serves the Vite client only; it cannot save a reward claim. The UI reports a configuration error instead of using browser or filesystem storage when the claim API/Blob credentials are unavailable.

## Reward claims

After a game result reports a win, a player may paste a Solana public key and submit one manual-review claim. Playing never requires wallet connection, signature, login, payment, or token ownership.

The Vercel functions use a **private** Vercel Blob store:

- `nowin-claims/records/<claim-id>.json` — one immutable-on-create claim record per run.
- `nowin-claims/exports/nowin-winners.csv` — a private derived export generated only by the protected admin endpoint.

Configure these server-only variables in Vercel and in `.env.local` for local Vercel development:

```dotenv
BLOB_READ_WRITE_TOKEN=
NOWIN_ADMIN_SECRET=
```

Create/connect the Blob store with **private access**. Set `NOWIN_ADMIN_SECRET` to a high-entropy value of at least 32 characters. Do not use a `VITE_` prefix for either variable and do not commit real values. Claim records are initially `PENDING` with `PENDING_REVIEW` verification because this build has no server-side game replay verifier. A pending claim is neither approved nor paid.

The administrator-only endpoints require `Authorization: Bearer <NOWIN_ADMIN_SECRET>`:

- `GET /api/admin/export` — generates, privately stores, and downloads `nowin-winners.csv`.
- `PATCH /api/admin/claims` — updates only `status`, `reviewed_at`, `tx_signature`, and `notes` for an existing record. Statuses are `PENDING`, `PAID`, and `REJECTED`.

There is no automatic payout, transaction signing, treasury connection, public winner list, leaderboard, wallet display, or public record/CSV endpoint.

## Quality checks

```bash
npm test -- --run
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

See [`docs/REWARD-CLAIMS.md`](./docs/REWARD-CLAIMS.md), [`docs/WINNING-GUIDE.md`](./docs/WINNING-GUIDE.md), and [`docs/QA-REPORT.md`](./docs/QA-REPORT.md) for operational requirements and verification status.
