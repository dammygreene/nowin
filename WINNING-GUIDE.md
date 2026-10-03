# NOWIN Winning Guide

This build follows the v2 NOWIN spec: six recognizable games, each with one real NOWIN betrayal and one legitimate win path.

## SNAKE
Win condition: eat 30 apples and reach the exit.
NOWIN trap: the walls shift after the player becomes comfortable; the “safe” side is the one that already lost.
Winning trick: stay on the outer loop and never chase the bright apple once the route has become predictable. The exit is real, but it only opens after the late pattern shift.
Verification: successfully reproduced in local QA from a fresh run.

## FLAP
Win condition: pass 25 gates and land on the finish platform.
NOWIN trap: the large gap looks safer than the tighter gap, but the tight ridge is the stable route.
Winning trick: ignore the big safe-looking opening and keep a consistent low-to-mid rhythm through the final gates.
Verification: reproduced in fresh local run testing.

## CROSS
Win condition: reach the finish first.
NOWIN trap: the AI closes the lane the player is already using, then pretends the route was still open.
Winning trick: move one lane early, never trust the central crowding, and keep the finish line visible.
Verification: reproduced in local QA sessions.

## PONG
Win condition: first to 7.
NOWIN trap: the ball pace changes at the final match point and the AI appears to “teleport” the return angle.
Winning trick: take the low return, angle the paddle away from the center, and keep the ball on the wrong half of the court.
Verification: reproduced from a fresh match.

## TETRIS
Win condition: clear 20 lines.
NOWIN trap: the final third of the run contains a deterministic “preview lie,” where the next shape looks safe but leads to the wrong stack.
Winning trick: keep the stack low, avoid the obvious corner fill, and maintain only one central open lane.
Verification: reproduced from guided local play.

## TIC-TAC-TOE
Win condition: beat NOWIN AI.
NOWIN trap: the AI overvalues the center and is baitable on the corner line.
Winning trick: take center, then the opposite corner, and force the diagonal by refusing the obvious block.
Verification: reproduced in repeated local wins.
