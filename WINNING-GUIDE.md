# NOWIN Winning Guide

> **Verification note — 2026-10-03:** The instructions below map to the deterministic public implementation in `src/games/`. Build, lint, type-check, shared deterministic-core tests, and a preview-host smoke check were run. A real browser executable was not available in this execution environment (Playwright's Chromium download failed with a network reset), so **these routes are intentionally not represented as browser-play verified wins**. They are implementation routes for the next browser QA pass, not fabricated test claims.

## Shared conditions

- NOWIN targets a low win rate through *authored counterplay*, never a hidden death roll: the obvious line is countered, while one telegraphed blind spot remains reproducible. The cultural target is the 1%, not a random hard lock.
- Development runs expose a seed control below the cabinet; it is compiled out of production builds.
- The daily seed is calculated once per UTC day. Any development seed can be repeated exactly for fixed-board games.
- Every completed run records a run ID, version, seed, timestamps, normalized input summary, score, result, and betrayal flag in local storage.
- Wallet claiming stays mock-local; no reward is real or sent by the client.

## Snake

- **Win condition:** eat 30 apples, then enter the purple exit in the bottom-right inner cell **from its left side**.
- **Betrayal/cue:** apple 20 enables the visible border pulse and changes apples to gold. After apple 30, the exit visibly contains a right-pointing arrow; it is a one-way gate.
- **Route:** on a fixed seed, use the outer lanes to keep the body open, only turn perpendicular to the current direction, and reserve the lower-right approach for after apple 30. Enter the exit while moving right. Do not treat the gold apple as a special pickup — it is a deliberately distracting normal apple.
- **Common loss:** turning back into the growing body or entering the exit vertically / from the right.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Flap

- **Win condition:** pass 25 pipe gates.
- **Betrayal/cue:** after gate 21 the pipe diamond changes pink and the final three gaps shrink to 88 units while alternating higher/lower. Physics are unchanged.
- **Route:** use short, even flaps to stay near the gap midpoint. At the pink cue, deliberately leave one beat between short taps to reset the old cadence; panic-tapping cannot clear the 88-unit final gaps.
- **Common loss:** holding the old cadence after the pink diamond starts flashing.
- **Browser verification:** **NOT VERIFIED** in this environment.

## 2048

- **Win condition:** create a 256 tile.
- **Betrayal/cue:** when a 128 appears, the cabinet gains a pink warning outline. The risk is not a hidden rule: parking the high tile in a non-movable corner removes merge options.
- **Route:** keep the largest tile in one corner, sweep parallel to that edge, and avoid a move that separates the two largest tiles after the 128 warning. Use the on-screen arrow pad or keyboard arrows.
- **Common loss:** a greedy merge that strands the 128 away from its matching lane.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Mines

- **Win condition:** reveal all 65 safe squares on the deterministic 9×9 board.
- **Development seed:** `2048` produces the base mirrored arrangement: mines at `(1,1), (4,1), (7,1), (0,3), (2,3), (6,3), (8,3), (0,5), (1,5), (4,5), (7,5), (8,5), (2,7), (6,7), (3,8), (5,8)` using zero-based coordinates. Odd seeds mirror it horizontally.
- **Betrayal/cue:** NOWIN stacked the otherwise-friendly mirrored edges to tempt an early centre flag. The number clues are exact; flags are optional and do not contribute to winning.
- **Route:** expand only confirmed zero regions, then resolve every remaining covered cell from both adjacent counts before revealing it. Right-click (desktop) or enable Flag Mode (touch) only for notes.
- **Common loss:** flagging the apparent symmetry before checking both neighbouring clues.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Cross

- **Win condition:** reach the chequered top row before NOWIN.
- **Betrayal/cue:** the first attempt to enter the centre at row three is a deterministic NOWIN roadblock and sends the player back one row. Traffic never teleports.
- **Route:** move north through an open traffic lane, side-step before attempting row three, then continue north. Keep moving: NOWIN advances on a fixed nine-tick cadence.
- **Common loss:** climbing the centre column in a straight line and donating time to the roadblock.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Noughts & Crosses

- **Win condition:** make three X marks in a line.
- **Exact opening:** play centre (`4`), bottom-right (`8`), top-right (`2`), then bottom-left (`6`), with cells numbered left-to-right, top-to-bottom from `0` to `8`.
- **Why it works:** NOWIN normally takes its immediate win *and* blocks any immediate player win. It starts top-left, takes side `1`, then—only for this exact three-X arrangement—chooses its side-pressure bait at `3` instead of blocking `6`.
- **Betrayal/cue:** NOWIN talks about the obvious diagonal while its early corner response makes the *other* diagonal available. Every less precise immediate threat is blocked.
- **Browser verification:** source-trace verified; **NOT browser-play verified** in this environment.

## Pong

- **Win condition:** score seven points before NOWIN.
- **Betrayal/cue:** NOWIN's paddle actively tracks the incoming ball and shadows the player's vertical movement between returns. At four player points it increases tracking speed and begins reading centre returns. At either six-point score the ball turns cyan and gains a small, visible pace increase. It does not change trajectory without a paddle or wall hit.
- **Route:** track the ball rather than camp at centre, return from the upper or lower paddle third to send a sharp angle, and react earlier once the cyan match-point tell appears. Pointer movement and W/S / arrow keys are supported.
- **Common loss:** feeding the AI predictable centre returns or assuming the normal-speed intercept still works at 6–x.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Connect Four

- **Win condition:** make four red discs in a row.
- **Exact route:** repeatedly drop red discs in the outermost left column (column `0`) on each player turn. NOWIN normally simulates and blocks an immediate red win, but after its central opening `3, 2` it takes the visible middle bait at `4` instead of blocking this exact edge stack. The fourth red disc wins.
- **Betrayal/cue:** NOWIN's central yellow stack looks like a double threat, but the neglected edge is its one scripted blind spot. All ordinary one-move win threats are blocked.
- **Common loss:** defending the central bait rather than finishing the edge vertical.
- **Browser verification:** source-trace verified; **NOT browser-play verified** in this environment.

## Reproduction status

There is no claim in this guide that an automated browser win was observed. Before rewards or a production launch, perform the real UI acceptance pass for each exact route on desktop and mobile, record input traces, and update each status to browser verified only after repeat wins.
