# NOWIN Arcade — Game Specifications

## Shared game rules

Every game must:
- start within one click
- explain controls with at most one short line
- expose a deterministic seed in debug mode
- have a legitimate win path
- include one or more unexpected betrayal moments
- record score, time, attempts, seed, and result
- allow immediate retry

The public build should not expose debug seeds or internal trigger conditions.

---

# SOLO 01 — SNAKE

## Familiar mechanic
Classic grid Snake. Eat food, grow, avoid walls and yourself.

## NOWIN objective
Reach a specific length target to win.

Suggested target: 60–80 segments, tuned through testing.

## Betrayal ideas

1. **The Almost-Open Gate**
A short-lived opening appears in a wall pattern near the end. A faint pulse in the border signals when it is open.

2. **Temptation Apple**
A high-value-looking apple appears in a path that forces the player into a dead-end. It is avoidable.

3. **Reverse Cue**
Once per authored late-game pattern, an exit corridor briefly reverses relative to the player's expectation. A subtle arrow/pulse communicates the direction.

## Winning trick requirement
At least one deterministic route must be documented in `WINNING-GUIDE.md`.

---

# SOLO 02 — FLAP

## Familiar mechanic
One-button flap/fly through gaps.

## NOWIN objective
Reach a fixed end gate, not an infinite score.

Suggested target: 100–150 gates, tuned after testing.

## Betrayal ideas

1. **Double Rhythm**
Most gates follow a consistent vertical cadence. One late sequence breaks the cadence, but a visible micro-flash signals it.

2. **Fake Safe Gap**
The larger gap is not the safest route. The correct route is smaller but stable.

3. **Last Three**
The final three gates are intentionally different from the earlier rhythm, forcing the player to adapt rather than autopilot.

## Winning trick requirement
Document exact tap rhythm/window for the verified test seed.

---

# SOLO 03 — 2048

## Familiar mechanic
Slide numbered tiles and combine matching values.

## NOWIN objective
Complete a target tile on a curated board, or reach a seeded end condition.

## Betrayal ideas

1. The board is tuned so a greedy move looks optimal but creates a dead corner.
2. A daily challenge deliberately punishes one common opening pattern.
3. Near the end, the player's preferred move leaves them one merge short.

## Fairness
No impossible board. The full winning solution must be reproducible from the shared seed.

## Winning trick requirement
Document the exact move sequence for one development seed.

---

# SOLO 04 — MINESWEEPER

## Familiar mechanic
Reveal squares, flag mines, clear the board.

## NOWIN objective
Clear a curated board with a very low mistake rate.

## Betrayal ideas

1. A visually symmetrical region contains the final mine.
2. The last safe-looking tile requires inference from two adjacent clues.
3. The final mine is placed where a novice would flag too early.

## Fairness
Every mine placement is deterministic from the seed. Never make a pure 50/50 guess mandatory on the winning seed.

## Winning trick requirement
Document the inference chain for the tested winning seed.

---

# VS NOWIN AI 05 — CROSS

Interpretation: a Crossy Road-style crossing game where the NOWIN AI controls the traffic system/opposition behavior.

## Familiar mechanic
Cross from start to finish while avoiding moving traffic.

## NOWIN AI role
The AI controls lane timing and can adapt to the player's movement habits.

## Betrayal ideas

1. AI creates a safe-looking crossing window and then closes one lane, with a readable traffic signal cue.
2. The player repeatedly uses one lane strategy; AI starts anticipating it.
3. The final crossing is deliberately deceptive but learnable.

## Win condition
Reach the destination.

## Winning trick requirement
Document the exact lane strategy and timing used to beat the development seed.

---

# VS NOWIN AI 06 — NOUGHTS & CROSSES

## Familiar mechanic
3×3 noughts and crosses / tic-tac-toe.

## NOWIN AI personality
The AI should play competently but theatrically.

## Betrayal ideas

The AI should not cheat by changing symbols or board state. Instead:
- intentionally offer bait
- use traps
- mirror predictable player behavior
- use one of several authored play styles

## Win condition
Player gets three in a row.

## AI modes
- Calm
- Toxic
- NOWIN

The public default is `NOWIN`.

## Winning trick requirement
Provide an exact opening or trap line that reliably beats the tested AI version when one exists. If the AI is unbeatable at the current strength, lower the strength until a real player win is consistently possible.

---

# VS NOWIN AI 07 — PONG

## Familiar mechanic
Classic two-paddle Pong.

## Win condition
First to 10.

## NOWIN AI behavior
The AI should be strong but beatable.

Personality lines can fire after:
- player misses a slow ball
- player reaches match point
- AI wins a long rally
- player wins

## Betrayal ideas

1. **Pace shift**: ball speed changes after a readable sound/cue.
2. **Angle trap**: the AI intentionally returns a ball that looks weak but creates a difficult angle.
3. **Match point pressure**: final point uses a different but telegraphed bounce pattern.

## Winning trick requirement
Document the repeatable positioning/serve-response strategy found in tests.

---

# VS NOWIN AI 08 — CONNECT FOUR

## Familiar mechanic
7-column Connect Four.

## Win condition
Connect four.

## AI role
The AI should have strong basic tactics but include exploitable preferences rather than perfect play.

## Betrayal ideas

1. AI appears to ignore a line but creates a double threat.
2. AI uses the player's previous column preference against them.
3. AI becomes more aggressive at match point.

## Winning trick requirement
Document a reproducible player strategy for beating the public AI.

---

## Global difficulty tuning

Initial public target:
- Most users should understand the game immediately.
- Most users should lose.
- A skilled/researching player should be able to win.
- The target overall win rate should emerge from real testing, not a random loss probability.

Use debug tools to tune each game until:
- median casual run ends quickly
- skilled testers can improve meaningfully
- at least one full winning path is reproducible
- late-game failures create "I almost had it" reactions
