# NOWIN — Launch Game Specification

NOWIN’s launch set is exactly six finite cabinets: Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe.

## Product rules

- Every cabinet has an authored, deterministic anti-win moment and a finite win condition.
- The betrayal must be telegraphed and learnable; the game must not silently alter accepted inputs or use random death rolls.
- A run exists in active client memory while played. The client may submit a completed win for manual reward review, but it cannot establish ranking, payout eligibility, or a verified competitive record.
- Public builds must not expose developer seed controls, shared-seed challenges, client-only leaderboards, or public claim data.
- A cabinet’s player-facing winning trick may be documented only after it has been reproduced in a real browser. See [`docs/WINNING-GUIDE.md`](./docs/WINNING-GUIDE.md) for the present verification state.

## Cabinet targets

| Cabinet | Visible objective |
| --- | --- |
| Snake | Eat 30 apples and reach the exit. |
| Flap | Pass 25 gates. |
| Tetris | Clear 20 lines. |
| Cross | Reach the finish before NOWIN AI. |
| Pong | Score seven points before NOWIN AI. |
| Tic-Tac-Toe | Make three X marks in a row. |

Design intentions are not browser-play evidence. Real loss/restart/win reproduction remains a release requirement.
