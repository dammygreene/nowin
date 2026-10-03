# NOWIN Arcade — QA Test Plan

## Acceptance standard

The finished build must be tested at the real UI level where possible, not only through unit tests.

## Required commands

At minimum run the project's equivalents of:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

If a script does not exist, use the underlying command appropriate to the configured stack and document it.

## Smoke tests

### Shell
- [ ] Landing page loads.
- [ ] All game cards render.
- [ ] Stats render.
- [ ] Leaderboard renders.
- [ ] Daily challenge renders.
- [ ] Navigation works.
- [ ] Back button behavior is sane.
- [ ] Refreshing a game route does not crash.

### Game lifecycle
For every game:
- [ ] start
- [ ] play
- [ ] fail
- [ ] result
- [ ] retry
- [ ] return to arcade
- [ ] new attempt

## Game-specific tests

### Snake
- [ ] movement works
- [ ] growth works
- [ ] collision works
- [ ] win target is reachable
- [ ] betrayal event can trigger
- [ ] debug seed reproduces the event
- [ ] verified winning sequence exists

### Flap
- [ ] tap/click controls
- [ ] keyboard control if supported
- [ ] collision
- [ ] gate progression
- [ ] win target is reachable
- [ ] betrayal cue appears
- [ ] verified winning sequence exists

### 2048
- [ ] arrow/swipe controls
- [ ] merges
- [ ] score
- [ ] board-full loss
- [ ] seeded board
- [ ] solvable winning seed
- [ ] verified winning sequence exists

### Minesweeper
- [ ] reveal
- [ ] flag
- [ ] mine collision
- [ ] win detection
- [ ] seeded board
- [ ] no mandatory blind guess on verified winning seed

### Cross
- [ ] movement
- [ ] traffic
- [ ] collision
- [ ] AI adaptation
- [ ] goal reached
- [ ] betrayal cue
- [ ] winning strategy tested

### Noughts & Crosses
- [ ] player move
- [ ] AI move
- [ ] win
- [ ] draw
- [ ] loss
- [ ] restart
- [ ] AI is beatable at public strength
- [ ] winning strategy tested

### Pong
- [ ] input
- [ ] ball movement
- [ ] collision
- [ ] scoring
- [ ] win to 10
- [ ] AI behavior
- [ ] AI is beatable
- [ ] winning strategy tested

### Connect Four
- [ ] column selection
- [ ] piece drops
- [ ] horizontal/vertical/diagonal wins
- [ ] draw
- [ ] AI move
- [ ] AI is beatable
- [ ] winning strategy tested

## Reward tests

- [ ] rewards disabled by default
- [ ] mock win can trigger claim UI
- [ ] invalid wallet rejected
- [ ] valid-looking wallet accepted in mock mode
- [ ] duplicate claim prevented
- [ ] no treasury secrets in client bundle

## Responsive tests

Test at approximately:
- 390×844 mobile
- 430×932 mobile
- 768×1024 tablet
- 1280×800 desktop
- 1440×900 desktop

Check:
- canvas scaling
- touch controls
- text clipping
- result modal
- claim modal
- game card grid
- leaderboards

## Visual QA

Look for:
- accidental scrollbars
- tiny touch targets
- unreadable text
- clipped canvases
- overlapping HUD
- flashing that violates reduced-motion intent
- audio starting without interaction
- layout jump when opening result screens

## Performance QA

Check:
- frame rate during gameplay
- memory growth after 10 consecutive retries
- Phaser instances destroyed correctly
- no duplicate event listeners
- no runaway timers

## Regression QA

After all fixes:
1. Run build again.
2. Run typecheck again.
3. Replay one verified win for every game.
4. Test the reward mock flow once more.
5. Produce `docs/QA-REPORT.md` with real results.
