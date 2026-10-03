# NOWIN Arcade

**GAMES YOU KNOW. WINS YOU DON'T.**

NOWIN is a colorful browser arcade of six familiar games. Each cabinet has a deterministic NOWIN betrayal: obvious winning play is countered, but a telegraphed, repeatable route remains for players who learn the pattern.

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

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Data and rewards

This frontend runs in **DEMO MODE**. Local attempt and win data is stored only in the browser. The Daily Doom seed is a deterministic UTC demo seed until a server challenge endpoint is connected.

A wallet is never required to play. The reward form is a format-only demo until a production server-side replay verifier, claim-token service, payout integration, rate limits, and legal review are available. No private keys or real payout code are bundled.

See [`docs/WINNING-GUIDE.md`](./docs/WINNING-GUIDE.md) and [`docs/QA-REPORT.md`](./docs/QA-REPORT.md) for current, evidence-based testing status.
