# NOWIN QA Report — Six-Cabinet Rebuild

**Date:** 2026-10-03 UTC

**Mode:** DEMO MODE (local persistence; no production data or payout backend)

## Commands actually run

| Command | Result |
| --- | --- |
| `npm install` | Passed |
| `npm test` | Passed — 4 files, 13 tests, including every cabinet’s card → READY → playable-surface flow |
| `npm run lint` | Passed — zero warnings allowed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed — Vite production build |
| `npm run preview -- --host 0.0.0.0 --port 4173` | Passed — production bundle served on port 4173 |
| Arena preview-host `curl` smoke request | Passed for both development and production preview |

## Automated coverage

- exactly six registered launch cabinets;
- deterministic RNG and daily demo seed consistency;
- Solana-address UX format checks;
- strong AI normal-block and authored Tic-Tac-Toe bait branch;
- production bundle builds without removed game modules;
- each of the six cabinets launches from a full clickable card, completes the READY countdown, and mounts its playable surface.

## Six-game scope

| Game | Finite win condition | Deterministic betrayal | Browser status |
| --- | --- | --- | --- |
| Snake | 30 apples then one-way exit | late gold-apple / exit-direction bait | Not browser tested |
| Flap | 25 gates then platform landing | pink final rhythm and landing requirement | Not browser tested |
| Tetris | 20 cleared lines | forced purple T-piece at 12 lines | Not browser tested |
| Cross | finish before NOWIN AI | centre roadblock / AI race timing | Not browser tested |
| Pong | first to 7 | active adaptive paddle and cyan match-point pace | Not browser tested |
| Tic-Tac-Toe | three X marks | strong blocking AI with one fork bait | Not browser tested |

## Data/reward posture

- Homepage counters and winner surfaces are labelled local/demo; no fabricated global counts are displayed.
- The Daily Doom seed is an identical UTC demo seed. A server-issued challenge endpoint is required for production.
- The wallet form checks format only. It does not submit a reward claim, create a payout, or treat client state as verification.
- Production still requires server-side replay verification, claim token issuance, rate limits, payout integration, environment-secret configuration, and legal review.

## Issue found and fixed

- **Cabinet layout regression:** the shared play-page, cabinet, intro, active-game, result, and touch-control CSS rules were absent from the active stylesheet. This made a selected cabinet render as a largely unstyled vertical page and allowed the mascot artwork to dominate the viewport. The full shared runtime stylesheet was restored in `src/styles/rebuild.css`; all six game-start flows are now covered by the application regression test.

## Browser QA limitation

No local browser executable is available in this environment. Browser automation therefore has **not** been claimed. The required interactive pass remains a release blocker: 390×844, 430×932, 768×1024, 1280×800, and 1440×900; each game must be lost, retried, and won from a fresh run.
