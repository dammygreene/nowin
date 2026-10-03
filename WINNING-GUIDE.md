# NOWIN Winning Guide

> **Verification note — 2026-10-03:** The instructions below map to the deterministic public implementation in `src/games/`. Build, lint, type-check, shared deterministic-core tests, and a preview-host smoke check were run. A real browser executable was not available in this execution environment (Playwright's Chromium download failed with a network reset), so **these routes are intentionally not represented as browser-play verified wins**. They are implementation routes for the next browser QA pass, not fabricated test claims.

## Shared conditions

- Development runs expose a seed control below the cabinet; it is compiled out of production builds.
- The daily seed is calculated once per UTC day. Any development seed can be repeated exactly for fixed-board games.
- Every completed run records a run ID, version, seed, timestamps, normalized input summary, score, result, and betrayal flag in local storage.
- Wallet claiming stays mock-local; no reward is real or sent by the client.

## Snake

- **Win condition:** eat 30 apples, then enter the purple exit in the bottom-right inner cell.
- **Betrayal/cue:** apple 20 enables the visible border pulse and changes apples to gold. The pulse tells the player the end phase has begun; it does not alter steering or collision rules.
- **Route:** on a fixed seed, use the outer lanes to keep the body open, only turn perpendicular to the current direction, and reserve the lower-right approach for after apple 30. Do not treat the gold apple as a special pickup — it is a deliberately distracting normal apple.
- **Common loss:** turning back into the growing body while rushing to the new-looking exit.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Flap

- **Win condition:** pass 25 pipe gates.
- **Betrayal/cue:** after gate 21 the pipe diamond changes pink and the final three gaps become narrower and alternate higher/lower. Physics are unchanged.
- **Route:** use short, even flaps to stay near the gap midpoint. At the pink cue, reset from the old rhythm: give one small corrective flap for each alternating gap rather than taking the apparent larger travel arc.
- **Common loss:** holding the old cadence after the pink diamond starts flashing.
- **Browser verification:** **NOT VERIFIED** in this environment.

## 2048

- **Win condition:** create a 128 tile.
- **Betrayal/cue:** when a 64 appears, the cabinet gains a pink warning outline. The risk is not a hidden rule: parking the high tile in a non-movable corner removes merge options.
- **Route:** keep the largest tile in one corner, sweep parallel to that edge, and avoid a move that separates the two largest tiles after the 64 warning. Use the on-screen arrow pad or keyboard arrows.
- **Common loss:** a greedy merge that strands the 64 away from its matching lane.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Mines

- **Win condition:** reveal all 71 safe squares on the deterministic 9×9 board.
- **Development seed:** `2048` produces the base mirrored arrangement: mines at `(1,1), (4,1), (7,1), (2,3), (6,3), (1,5), (4,5), (7,5), (2,7), (6,7)` using zero-based coordinates. Odd seeds mirror it horizontally.
- **Betrayal/cue:** the visually symmetrical field tempts an early centre flag. The number clues are exact; flags are optional and do not contribute to winning.
- **Route:** start with safe exterior corners, expand zero regions, then resolve every remaining covered cell from the adjacent counts before revealing it. Right-click (desktop) or enable Flag Mode (touch) only for notes.
- **Common loss:** flagging the apparent symmetry before checking both neighbouring clues.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Cross

- **Win condition:** reach the chequered top row before NOWIN.
- **Betrayal/cue:** arriving at row three flags the AI response phase. The magenta AI marker subsequently copies the player's column if it can; traffic never teleports.
- **Route:** move north through an open traffic lane, then take one deliberate side-step at row three before continuing north. Keep moving: NOWIN advances on a fixed nine-tick cadence.
- **Common loss:** climbing the centre column in a straight line after the copy cue.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Noughts & Crosses

- **Win condition:** make three X marks in a line.
- **Exact opening:** play centre (`4`), bottom-right (`8`), top-right (`2`), then bottom-left (`6`), with cells numbered left-to-right, top-to-bottom from `0` to `8`.
- **Why it works:** NOWIN starts at top-left then follows its deterministic side preference (`1`, then `3`) instead of covering the `2–4–6` diagonal. It still takes an available immediate win.
- **Betrayal/cue:** NOWIN talks about the obvious diagonal while its early corner response makes the *other* diagonal available.
- **Browser verification:** source-trace verified; **NOT browser-play verified** in this environment.

## Pong

- **Win condition:** score seven points before NOWIN.
- **Betrayal/cue:** at either six-point score the ball turns cyan and gains a small, visible pace increase. It does not change trajectory without a paddle or wall hit.
- **Route:** track the ball rather than camp at centre, return from the upper or lower paddle third to send a sharp angle, and react earlier once the cyan match-point tell appears. Pointer movement and W/S / arrow keys are supported.
- **Common loss:** assuming the normal-speed intercept still works at 6–x.
- **Browser verification:** **NOT VERIFIED** in this environment.

## Connect Four

- **Win condition:** make four red discs in a row.
- **Exact route:** repeatedly drop red discs in the outermost left column (column `0`) on each player turn. NOWIN's scripted preference begins `3, 2, 4, 2, …` and does not cover that vertical stack until after the fourth red drop.
- **Betrayal/cue:** NOWIN's central yellow stack looks like a double threat, but the neglected edge is the stable counterplay.
- **Common loss:** defending the central bait rather than finishing the edge vertical.
- **Browser verification:** source-trace verified; **NOT browser-play verified** in this environment.

## Reproduction status

There is no claim in this guide that an automated browser win was observed. Before rewards or a production launch, perform the real UI acceptance pass for each exact route on desktop and mobile, record input traces, and update each status to browser verified only after repeat wins.
