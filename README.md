# NOWIN Arcade

**Games you know. Wins you don't.**

A polished browser arcade of eight familiar games with deterministic, learnable NOWIN anti-win moments. Each cabinet actively counters the obvious winning move, but has a single visible, reproducible blind spot documented in the winning guide. No wallet is required to play; wins use a local mock claim flow unless a future server-side verifier is connected.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open `http://localhost:5173`.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Included cabinets

| Solo | VS NOWIN AI |
| --- | --- |
| Snake | Cross |
| Flap | Noughts & Crosses |
| 2048 | Pong |
| Mines | Connect Four |

## Product highlights

- Hand-built illustrated arcade lobby, posters, mascot, physical controls, result states, responsive layouts, sound toggle, and reduced-motion support.
- Seeded game state and normalized input summaries for every completed local run.
- Local persistence for attempts, wins, scores, and recent run records.
- Development-only seed switcher; no debug controls are shown in a production build.
- Mock-only claim provider with base58-shaped Solana wallet validation and idempotent run claims. No treasury, private key, or live payout code is shipped.

## Verification status

See [`WINNING-GUIDE.md`](./WINNING-GUIDE.md) for current game-route and browser-verification status, and [`QA-REPORT.md`](./QA-REPORT.md) for exactly what was tested. A real production prize launch still requires an authoritative server-side run verifier, rate limits, claim-token service, legal review, and full interactive browser/device QA.
