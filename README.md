# NOWIN Arcade

**GAMES YOU KNOW. WINS YOU DON'T.**

NOWIN is a colorful browser arcade of six familiar games. Each cabinet has a deterministic NOWIN betrayal: obvious play is countered, but a telegraphed, repeatable route remains for players who learn the pattern.

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
npm run preview -- --host 0.0.0.0 --port 4173
```

## Production service status

The shipped arcade has no leaderboard, daily challenge, wallet collection, reward claim, or payout service. These surfaces are intentionally hidden or presented as unavailable rather than simulated.

A future production reward system must use an authoritative server-side replay verifier, claim-token endpoint, rate limits, payout integration, deployment-scoped secrets, and legal review. No private keys, wallet addresses, or real payout logic are bundled in this project.

See [`docs/WINNING-GUIDE.md`](./docs/WINNING-GUIDE.md) and [`docs/QA-REPORT.md`](./docs/QA-REPORT.md) for verification status and known limitations.
