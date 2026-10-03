# NOWIN Winning Guide — Six-Cabinet Build

**Status: implementation route map, not browser-play verification.** The current execution environment has no installed browser engine; no route below is labelled browser verified unless a real interactive run has been reproduced. The game code and deterministic AI branches are tested, but a fresh-run browser pass remains required before production.

## Snake
- **Win condition:** eat 30 apples; the purple exit appears; enter it from the left while moving right.
- **NOWIN betrayal:** at apple 20 the border pulses and gold apples distract from the exit phase. The exit only accepts its visible one-way direction.
- **Winning trick:** maintain an outer loop, preserve the lower-right route, and enter the post-30 exit from its arrow side.
- **Repeatability:** deterministic for a seed; browser verification pending.

## Flap
- **Win condition:** pass 25 gates, then land NOWIN’s flying head on the final LAND platform.
- **NOWIN betrayal:** gates 23–25 flash pink and narrow to the deterministic late rhythm; clearing gate 25 is not enough—the platform still must be landed.
- **Winning trick:** use small even flaps through the pink gates, then stop climbing and let the mascot descend onto the platform at y=335.
- **Repeatability:** deterministic for a seed; browser verification pending.

## Tetris
- **Win condition:** clear 20 lines.
- **NOWIN betrayal:** at 12 lines a forced purple T-piece arrives and the cabinet announces `NOWIN BLOCK`.
- **Winning trick:** keep the central three columns level before line 12; rotate the forced T into the prepared centre rather than panic-filling an edge. Normal movement, rotation, soft drop, and hard drop are never changed.
- **Repeatability:** deterministic seeded piece stream; browser verification pending.

## Cross
- **Win condition:** reach the chequered finish before NOWIN AI.
- **NOWIN betrayal:** the first centre-lane attempt at row three triggers a deterministic roadblock and costs a row.
- **Winning trick:** take an early side-step before row three, use open traffic gaps, and keep the AI’s fixed nine-tick climb in view.
- **Repeatability:** deterministic traffic and AI timing; browser verification pending.

## Pong
- **Win condition:** score seven points before NOWIN AI.
- **NOWIN betrayal:** the AI actively tracks the ball and shadows the player. At four player points it reads centre returns; at six points the cyan ball gains predictable pace.
- **Winning trick:** strike with the paddle’s upper/lower edge to create steep angles, avoid centre feeds, and move earlier on the cyan match-point ball.
- **Repeatability:** deterministic serve sequence and AI rules; browser verification pending.

## Tic-Tac-Toe
- **Win condition:** create three X marks in a row; a draw is not a win.
- **NOWIN betrayal:** NOWIN blocks ordinary immediate wins and takes its own wins. Its exact side-pressure bait ignores one diagonal fork.
- **Exact winning sequence:** cells `4 → 8 → 2 → 6`, numbered left-to-right/top-to-bottom from 0. NOWIN responds `0 → 1 → 3`; `2–4–6` wins.
- **Repeatability:** deterministic AI branch is unit tested; browser verification pending.

## Required next QA step
Run each route in a real browser from a fresh seed at least three times, record successful input traces, then replace the pending statuses above with measured reproductions.
