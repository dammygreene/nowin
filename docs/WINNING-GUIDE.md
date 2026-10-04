# COPECADE Winning Guide — Verification Status

**Status: Tic-Tac-Toe has one local-browser playthrough recorded; the other cabinets remain unverified.** This guide does not publish source-derived routes as if they were observed gameplay.

The six cabinets below are the complete live set. A “fresh-run win” means a win started after opening/restarting the cabinet, not a unit-test result or a static-code inference.

| Cabinet | Observed winning trick | Fresh-run wins reproduced | Verification status |
| --- | --- | ---: | --- |
| Snake | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Flap | Not yet observed in an interactive browser. See the unverified implementation note below. | 0 | Blocked: browser engine unavailable. |
| Tetris | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Cross | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Pong | Not yet observed in an interactive browser. | 0 | Blocked: browser engine unavailable. |
| Tic-Tac-Toe | Center, bottom-right, top-right, bottom-left. | 1 | Observed and reproduced in local Vite browser QA; desktop and 390x844 mobile board checks passed. |

## Flap — implementation route, not fresh-run verification

The following documents the deterministic behavior implemented in the current Flap cabinet. It is **not** a claim that the route has been discovered or reproduced in a real browser.

- **Win condition:** Pass 25 pipe pairs, then land the mascot head on the COPECADE finish platform.
- **Reference loop:** One-button, fixed-horizontal-position flight: tap/click/Space/Arrow Up applies a single upward impulse while gravity and pipe pairs move toward the player.
- **COPECADE betrayal:** Pairs 12 and 15 can shift 18 logical pixels; pairs 17 and 19 can shift 28; pairs 21, 23, and 25 can shift 38. A pair only arms when its seeded, current flight projection is near the center of a passable opening. The whole visible pipe pair moves; collision uses that same moving opening.
- **Detection:** A marked diamond appears in the relevant gap. When COPECADE arms it, the pipe caps turn pink and both the gap marker and the top banner show an up or down arrow for 11 simulation frames before the pair begins its smooth movement. The start screen accepts a tap, click, Space, or Arrow Up.
- **Counter (source-derived):** When the arrow points up, make an early flap to meet the raised opening. When it points down, stop adding lift briefly and let the mascot fall with the gap. The cue occurs before movement while the pair is still well ahead of the mascot.
- **Winning sequence (source-derived):** Keep normal rhythm for early pairs, react to the displayed direction on marked pairs, and after gate 25 descend onto the platform instead of continuing a level flight. The platform is part of the win and missing it ends the run.
- **Fresh-run verification:** 0 browser wins reproduced; no exact player input route is claimed.

## Required completion protocol

Before this document can become a player guide or the product can be called release-ready:

1. Run the **production build** in a real browser.
2. For every cabinet, record a normal loss, restart from a fresh run, identify the in-game betrayal and counterplay through play, and record the exact successful input trace.
3. Reproduce at least three independent fresh-run wins per cabinet where practical. Note any cabinet that cannot meet that target and why.
4. Replace only the corresponding row above with observed trick wording, measured win count, device/browser, viewport, build identifier, and date.
5. Repeat at desktop and mobile viewports before making device-support claims.

Unit tests validate selected deterministic contracts, but they are not gameplay evidence and do not count toward this table.

## Tic-Tac-Toe — observed route

- **Win condition:** Beat COPECADE AI in a standard 3x3 game.
- **AI behavior:** COPECADE takes immediate wins, blocks immediate player wins, follows a deterministic position order, and briefly shows `COPECADE IS THINKING…` before responding.
- **COPECADE weakness:** After the player takes center, COPECADE deterministically chooses the top-left corner. If the player then takes the opposite corner, top-right, COPECADE's authored bait response chooses the middle-left cell instead of preventing the remaining diagonal fork.
- **Discovery:** The route was confirmed by deterministic policy tests and then played through the local browser using ordinary cell clicks.
- **Exact winning sequence:**
  1. Player: **CENTER** (cell 5) → AI: **TOP-LEFT** (cell 1)
  2. Player: **BOTTOM-RIGHT** (cell 9) → AI: **TOP-CENTER** (cell 2)
  3. Player: **TOP-RIGHT** (cell 3) → AI: **MIDDLE-LEFT** (cell 4)
  4. Player: **BOTTOM-LEFT** (cell 7) → player completes the diagonal `(TOP-RIGHT, CENTER, BOTTOM-LEFT)`
- **Verification:** 1 fresh local-browser win reproduced on 2026-10-04 at the local Vite build. This is not a deployed or server-authoritatively verified reward claim.
