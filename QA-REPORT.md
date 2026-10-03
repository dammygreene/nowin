# NOWIN Arcade — QA Report

**Report date:** 2026-10-03 UTC  
**Build:** `arcade-1.0.0`  
**Scope:** fresh full implementation in this repository

## Commands executed

| Command | Result |
|---|---|
| `npm install` | Passed — 169 packages installed; npm audit reported 0 vulnerabilities. |
| `npm test` | Passed — 3 Vitest files, 7 tests. |
| `npm run lint` | Passed — ESLint with zero warnings allowed. |
| `npm run typecheck` | Passed — TypeScript completed with no errors. |
| `npm run build` | Passed — Vite production bundle generated. |
| `npm run dev -- --host 0.0.0.0` | Passed — Vite served on port 5173. |
| `curl` using the Arena preview host header | Passed after adding `allowedHosts: true` to Vite configuration. |

## Automated checks actually run

Three Vitest files passed **7 tests** covering:

- exactly eight distinct launch cabinet registrations;
- four VS NOWIN AI cabinet registrations;
- repeatability of the shared seeded RNG;
- stable daily seed within the current UTC day;
- acceptance/rejection behaviour of the local Solana-address format check;
- mock-reward disabled state plus duplicate claim idempotency;
- NOWIN AI blocking of ordinary immediate wins in Noughts and Connect Four;
- the exact authored Noughts and Connect Four blind spots documented in the winning guide.

## Build artifact

The successful production build generated:

- `dist/index.html` — 0.58 kB;
- Original NOWIN mascot asset — 482.94 kB;
- CSS bundle — 31.83 kB (7.95 kB gzip);
- JavaScript bundle — 265.54 kB (82.92 kB gzip).

`dist/` is ignored and was not committed as source.

## Implementation smoke coverage

Static/type and source-level checks covered the shared game registry, deterministic seed primitive, persistence boundary, reward-validation format check, build, and development server response. The following implementation features are present in the application:

| Surface | Implementation status |
|---|---|
| Arcade lobby, 8 illustrated cabinet cards, daily ribbon, navigation | Implemented |
| Snake, Flap, 2048, Mines | Implemented as interactive browser games |
| Cross, Noughts & Crosses, Pong, Connect Four | Implemented as interactive VS NOWIN browser games |
| Intro, HUD, pause, fail, instant retry, win result | Implemented |
| Persistent local attempts/wins/bests and recent run records | Implemented via localStorage |
| Development seed control | Implemented, development-only |
| Sound toggle / procedural interaction sounds | Implemented; muted by default |
| Reduced-motion override | Implemented |
| 1% Club, leaderboard, daily challenge display | Implemented with clearly labelled demo/local data |
| Mock reward claim and wallet format validation | Implemented; no wallet required to play |
| Client/server reward boundary | Mock provider interface included; no production payout path enabled |

## Browser/device QA

Browser automation was attempted with Playwright. A Playwright CLI was available, but installing Chromium failed because the download connection to `cdn.playwright.dev` reset. No local Chromium, Chrome, or Firefox executable was present.

**Therefore, no visual browser/device test and no real browser gameplay win is claimed in this report.** This is an environment limitation, not a pass. The development-server response and preview-host compatibility were verified with `curl` only.

A real acceptance pass is still required at 390×844, 430×932, 768×1024, 1280×800, and 1440×900 before a production release. It must cover all game lifecycles, keyboard/touch controls, actual loss/retry behaviour, each documented win route, result overlays, claim form, sound toggle, and refresh/navigation.

## Issues found and fixed

1. The initial Vite server rejected the Arena preview host with HTTP 403. `server.allowedHosts` and `preview.allowedHosts` were set to `true`; the preview-host smoke request then passed.
2. The first production TypeScript build found an incorrect result callback omission, missing Vite client declaration, and a narrow numeric reduce type. These were corrected.
3. ESLint found one unused `useMemo` import. It was removed; lint subsequently passed.
4. The old repository QA/winning files described a different six-game prototype and made unsupported browser-test claims. They were replaced with this actual, transparent report and the current implementation guide.

## Remaining limitations / release blockers

- **Blocking for a real prize launch:** no server-side run replay verifier, rate limiter, claim-token endpoint, or production payout service exists. The frontend mock provider deliberately never sends a payout.
- **Blocking for a production-quality game release:** complete actual browser/device gameplay QA and repeat the documented winning routes. The current environment could not download a browser, so this was not skipped or falsely marked passed.
- The daily and leaderboard numbers are presentational demo data except for local player statistics; there is no backend leaderboard.
- The reward claim is a local mock flow and accepts only a basic base58-shaped address for UX. It is not authoritative wallet validation.

## Verification conclusion

The project compiles, lints, tests, builds, serves, and accepts the Arena preview host. The complete client arcade and eight playable game implementations are in source. It is not yet approved for real-money or production deployment until the above browser QA and server verification work are completed.
