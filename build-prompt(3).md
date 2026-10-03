# NOWIN v3 REBUILD PROMPT

## Read this before changing anything

The current NOWIN prototype is not good enough.

Do not perform a cosmetic polish pass on the current dashboard-style interface.
Do not preserve weak game mechanics just because they already compile.
Do not claim a game is tested because the browser loads or `npm run build` passes.
Do not write a fake winning guide based on reading source code.

This is a full product-quality rebuild of the visual layer, game presentation, and challenge design.
Reuse working infrastructure where sensible, but replace weak UI/game implementations completely when necessary.

The target is a playful, polished, colorful 2D arcade that people want to keep playing and sharing.

---

# 1. PRODUCT

Name:
NOWIN

Primary line:
GAMES YOU KNOW. WINS YOU DON'T.

Secondary personality line:
SKILL ISSUE.

Core idea:

NOWIN is an arcade of familiar simple games. The player immediately understands the game because the mechanic is familiar. The joke is that the game contains a surprising, learnable "NOWIN moment" that makes the player feel betrayed.

The player should repeatedly experience:

"I know this game."

then

"I'm winning."

then

"WHAT THE FUCK?"

then

"Okay, I know what happened."

then

"Again."

Eventually the player genuinely wins and becomes part of the 1%.

The game must feel unfair at first glance but fair in hindsight.

---

# 2. NON-NEGOTIABLE PRINCIPLES

Every game must satisfy all of these:

1. Familiar gameplay.
2. A clearly defined finite win condition.
3. An unexpected NOWIN betrayal/twist.
4. The twist must be deterministic or seeded.
5. The twist must have a real counter-strategy.
6. The game must be genuinely beatable.
7. A competent tester must be able to discover the winning trick.
8. Winning must be reproducible from a fresh run.
9. Failure must be funny or surprising.
10. Retry must be almost instantaneous.

DO NOT make difficulty by simply:

- making everything faster forever
- shrinking hitboxes without explanation
- reducing reaction windows until the game feels broken
- randomly killing players
- secretly changing inputs
- moving objects arbitrarily every run
- making the final win depend on luck

The game can deceive the player, but it cannot lie about its physics or make victory mathematically impossible.

The goal is not "randomly lose 99% of the time."

The goal is:

"Almost nobody wins because almost nobody figures out the trick and executes it correctly."

---

# 3. VISUAL DIRECTION

The current UI looks like a software dashboard.
That aesthetic is prohibited.

NOWIN must look like a polished 2D indie/mobile game or animated web arcade.

Use a cohesive cartoony visual system:

- thick dark outlines
- chunky illustrated shapes
- expressive characters
- bold flat colors
- exaggerated proportions
- comic-style bursts
- sticker graphics
- playful shadows
- little imperfections
- arcade motifs
- colorful environments
- squash/stretch animation
- bounce animation
- particles
- screen shake
- impact flashes
- confetti

Suggested palette:

- electric yellow
- hot pink
- cyan
- bright orange
- lime / acid green
- saturated purple
- deep navy / near-black
- warm cream / off-white

Use contrast aggressively.

Avoid:

- glassmorphism
- generic SaaS cards
- corporate gradients
- huge empty hero areas
- monochrome layouts
- sterile dark mode
- crypto terminal aesthetics
- generic AI-startup aesthetics
- emoji as the primary artwork
- placeholder boxes
- plain text-only game cards
- default browser controls

The visual result should make a person think "game" before "website."

---

# 4. ART ASSET REQUIREMENT

Every game MUST have real visual artwork.

Never represent games with emoji alone.

Create original art using one or more of:

- SVG
- CSS/vector illustration
- Canvas drawing
- locally generated PNG/WebP assets

If the environment provides an image-generation capability, it may be used to create original concept art, but exported assets must still be integrated locally and match the shared art direction.

Every game must have at minimum:

- lobby hero illustration
- small icon
- gameplay background/environment
- win pose/illustration
- loss/fail pose/illustration
- NOWIN AI or mascot reaction where applicable

Required structure:

src/assets/
  brand/
  mascot/
  ui/
  effects/
  games/
    snake/
    flap/
    cross/
    pong/
    tetris/
    tic-tac-toe/

Do not use empty placeholder files.

---

# 5. NOWIN MASCOT

Create one original 2D mascot that visually identifies the entire project.

Concept:
A mischievous little arcade creature with an oversized head and tiny body.

Traits:

- expressive eyes
- big grin
- small body
- gloves/hands
- chunky shoes
- readable silhouette

Required visual states:

- idle
- curious
- smug
- laughing
- taunting
- shocked
- annoyed
- defeated
- celebrating

The mascot should appear:

- in the homepage hero
- on game cards
- on game intros
- during losses
- during wins
- beside AI opponents
- in social/share graphics

The mascot is the face of NOWIN.

---

# 6. HOMEPAGE / ARCADE LOBBY

Do not create a conventional SaaS hero with six uniform cards below it.

Build an actual arcade lobby.

The first viewport should already feel like a game.

Suggested structure:

Top navigation:

NOWIN logo
PLAY
1% CLUB
LEADERBOARD

Hero:

Large illustrated NOWIN mascot.

NOWIN

GAMES YOU KNOW.
WINS YOU DON'T.

Short text:

Someone has to win.

Primary button:

PLAY NOW

Then six game entries displayed as illustrated arcade posters.

Use varied card sizing and composition.

Do not make six identical cards.

Use subtle 1–3 degree rotations and different illustrations to make the arcade feel physical and playful.

Every card should have:

- game illustration
- game title
- one short joke/description
- current attempts
- current winners
- play button

Example copy:

SNAKE
"eat 30. simple."

FLAP
"just fly."

CROSS
"beat NOWIN."

PONG
"7 points. that's it."

TETRIS
"20 lines. good luck."

TIC-TAC-TOE
"you versus NOWIN."

---

# 7. VISUAL FEEL OF THE LOBBY

The lobby must be alive while idle.

Include restrained micro-animations:

- mascot breathing/bouncing
- floating particles
- game cards gently moving
- occasional sticker wobble
- buttons squash/stretch on press
- counters ticking when updated
- speech bubbles appearing briefly
- NOWIN occasionally peeking into view

Do not animate everything constantly.

Use hierarchy so the page feels dynamic without becoming noisy.

---

# 8. BUTTONS

Buttons must feel like physical arcade controls.

Primary button:

- chunky
- outlined
- high contrast
- strong drop shadow
- pressed state
- hover lift
- animated feedback

PLAY NOW
TRY AGAIN
PLAY AGAIN
BEAT NOWIN
CLAIM YOUR WIN
LEADERBOARD

On press:

- button compresses
- shadow reduces
- tiny particles or impact marks appear

---

# 9. GAME LOBBY CARDS

Create custom hero art for each game.

SNAKE illustration:

Bright green cartoon snake, expressive eyes, apple, maze/grid, NOWIN mascot trying to distract it.

FLAP illustration:

Ridiculous cartoon bird, clouds, pipes, NOWIN mascot hiding behind one pipe.

CROSS illustration:

Tiny character on colorful road, cars, traffic lights, NOWIN AI already halfway across and looking back.

PONG illustration:

Retro arcade court, expressive ball, player paddle, NOWIN paddle wearing a smug face.

TETRIS illustration:

Colorful block tower leaning dangerously, one suspicious NOWIN block, mascot pushing a block.

TIC-TAC-TOE illustration:

Huge comic board, player side and NOWIN AI side sitting opposite each other.

---

# 10. GAME SCREEN

When a game starts, transition into the game.

Do not leave the player staring at the website shell around a tiny game widget.

Gameplay should use the majority of the viewport.

HUD:

- game title
- score/progress
- attempt
- pause
- sound

Gameplay area:

- dedicated canvas
- themed background
- strong readability
- animated effects

Desktop and mobile must feel intentional.

---

# 11. GAME INTRO

Before every game:

1. show mascot/NOWIN AI
2. one short line
3. GO

Examples:

SNAKE:
"eat 30."

FLAP:
"just fly."

CROSS:
"race you."

PONG:
"first to 7."

TETRIS:
"20 lines. easy."

TIC-TAC-TOE:
"good luck."

Keep intro under 1.5 seconds unless the player chooses a longer first-time tutorial.

---

# 12. GAME 1: SNAKE

Familiar mechanic:
Classic Snake.

Controls:

Desktop:
Arrow keys / WASD

Mobile:
Swipe or large directional controls.

FINITE WIN:

Eat 30 valid apples, then reach the exit.

The player is NOT merely chasing a high score.

NOWIN BETRAYAL:

At a predictable late-game point, the arena changes in a surprising way.

Possible design:

- one wall section retracts
- a temporary corridor opens
- the exit appears in an unexpected location
- one visually tempting apple becomes the wrong choice

The event must be seeded and repeatable.

The player should think the board is broken the first time.

WINNING TRICK:

There must be one reproducible route that avoids the trap and reaches the exit.

The agent must discover the exact route through repeated play.

Do not invent this route in documentation.

---

# 13. GAME 2: FLAP

Familiar mechanic:
One-button flying game.

Controls:

Desktop:
Space / mouse

Mobile:
Tap.

FINITE WIN:

Pass 25 gates and land on the finish platform.

NOWIN BETRAYAL:

The final section contains a deceptive route.

Examples:

- large opening that leads into a bad position
- late-moving obstacle whose pattern is deterministic
- temporary change in scroll timing
- visual bait that looks safer than the actual route

Important:

The game must remain physically consistent.

WINNING TRICK:

There must be a repeatable flap rhythm or route.

The agent must reproduce it from a fresh run.

---

# 14. GAME 3: CROSS

Familiar mechanic:
Cross the road before traffic hits you.

Mode:

PLAYER VS NOWIN AI

Two characters begin together.

FINITE WIN:

Reach the finish before NOWIN AI.

NOWIN AI:

The AI has an identifiable but hidden behavioral pattern.

Examples:

- prefers specific lanes
- reacts to the player's lane choice with a small delay
- takes an obvious safe path that can be baited
- blocks the player's most natural route

The player must be able to discover a counter-strategy.

The AI cannot have superhuman reaction time that is impossible to understand.

Important:

There must be a legitimate way to beat the AI repeatedly once the weakness is known.

The first time it blocks the player, the reaction should be:

"IT STOLE MY LANE."

That is good.

After learning the pattern, the player should think:

"I know how to bait it."

---

# 15. GAME 4: PONG

Familiar mechanic:
Classic Pong.

Mode:

PLAYER VS NOWIN AI

FINITE WIN:

First to 7.

NOWIN AI personality:

- initially normal
- increasingly adaptive
- smug after scoring
- nervous when losing
- stunned if the player wins

NOWIN BETRAYAL:

At a predictable late point in a match, introduce one special event.

Examples:

- special serve pattern
- predictable ball-speed shift
- brief arena behavior change
- AI opens a baiting route that can be exploited

Do not fake physics.

The winning strategy must be discoverable and reproducible.

The first goal is not "make the AI unbeatable."

The first goal is "make the AI hilarious to play against."

---

# 16. GAME 5: TETRIS

Familiar mechanic:
Classic falling-block puzzle.

FINITE WIN:

Clear 20 lines.

Do not make it endless.

NOWIN BETRAYAL:

During the final third, introduce one deterministic surprise.

Potential options:

- special NOWIN piece
- one predictable rotation behavior
- misleading but honest visual cue
- cursed block sequence
- one special final board event

The player should be able to learn the event.

Do not break normal controls.

WINNING TRICK:

A low stack and a specific preparation should let a skilled player survive the final event.

The agent must discover the actual method and document it.

---

# 17. GAME 6: TIC-TAC-TOE

Familiar mechanic:
3x3 Tic-Tac-Toe.

Mode:

PLAYER VS NOWIN AI

FINITE WIN:

Beat the AI.

The AI is intentionally aggressive but has a discoverable behavioral weakness.

Potential approach:

The AI follows a strong opening strategy but overvalues one response to a particular corner/center sequence.

There must be at least one reliable player sequence that produces a win.

Do not create an impossible AI.

The trick should be something players can eventually discover and share.

Example community behavior:

"I figured out the NOWIN opening."

That is desirable.

---

# 18. NOWIN AI PERSONALITY

NOWIN AI is a character, not an invisible algorithm.

After loss:

SKILL ISSUE.

After two losses:

AGAIN?

After a near miss:

OH YOU THOUGHT.

After many losses:

YOU'RE STILL HERE?

After player wins:

...

Then a shocked animation.

Never spam dialogue.

Use visual reactions as much as text.

---

# 19. LOSS EXPERIENCE

Failure should be entertaining.

Never use a generic:

GAME OVER

instead use:

NOPE.

or

SKILL ISSUE.

or

YOU WERE RIGHT THERE.

Show:

- final score/progress
- attempt count
- best score
- NOWIN reaction
- retry button

TRY AGAIN is the dominant action.

Retry should restart in under one second after input.

---

# 20. WIN EXPERIENCE

Winning should feel disproportionately satisfying.

Sequence:

1. gameplay freezes
2. impact flash
3. short screen shake
4. mascot/NOWIN reaction
5. giant YOU WON text
6. confetti/particles
7. stats reveal
8. 1% Club message
9. reward claim UI
10. share card

Text:

# YOU WON.

YOU ARE IN THE 1%.

Show:

Game
Attempts
Completion time
Global rank
Current win rate

Then:

CLAIM YOUR REWARD

---

# 21. REWARD CLAIM

The player does not connect a wallet to play.

Only a verified winning run creates an eligible claim.

Flow:

WIN
-> server verifies run
-> claim form appears
-> player pastes Solana wallet
-> validate address
-> create claim
-> process payout
-> show claim status

Do not allow the frontend to declare a win.

For MVP/demo, a claim can enter a pending/manual-review state if live treasury payout infrastructure is not configured.

Do not fake a successful blockchain payout.

---

# 22. TOKEN

The $NOWIN token is NOT used as an in-game currency.

Do not add:

- token-gated games
- token boosts
- token purchases
- token lives
- token skins
- token upgrades
- staking for advantages
- pay-to-win

The token is simply the meme/community token associated with the NOWIN universe.

Gameplay must remain fun and complete without the token.

---

# 23. 1% CLUB

The 1% Club contains verified winners.

Each winner should have:

- player identifier
- game
- score/time
- attempt count
- date
- verification status

Do not fake global winner counts in production mode.

Demo mode may display seeded sample data only if clearly marked as demo data.

---

# 24. DAILY CHALLENGE

All players should be able to receive the same daily challenge seed.

Display:

TODAY'S CHALLENGE

ATTEMPTS
WINS
WIN RATE
FASTEST WIN

This creates community competition.

The challenge must be deterministic for a given day.

Do not use hidden randomization that makes one player's version different from another's unless explicitly labeled.

---

# 25. SHARE CARDS

After a verified win, render an original 2D share image.

Example:

NOWIN

I BEAT CROSS.

183 attempts.

0.54% win rate.

WELCOME TO THE 1%.

Small footer:

skill issue

Provide:

COPY
SHARE TO X

Failure cards are also useful:

I GOT TO 98%.

NOWIN SAID NO.

---

# 26. MOBILE

Mobile is first-class.

Requirements:

- large touch zones
- swipe/tap support where appropriate
- responsive game area
- no horizontal scroll
- safe-area support
- 60fps target
- readable HUD
- portrait-first lobby
- landscape support where useful for gameplay

The mobile layout should look intentionally designed, not like a compressed desktop page.

---

# 27. AUDIO

Use original or properly licensed/procedural arcade sounds.

Required:

- hover
- click
- start
- countdown
- interaction
- near miss
- fail
- NOWIN taunt
- win
- claim confirmation

Provide sound toggle.

---

# 28. TECHNICAL STRUCTURE

Keep Vite + React + TypeScript unless there is a clear reason to change it.

Games should not become giant React components.

Use a clear separation:

APP SHELL
GAME MODULES
GAME STATE
INPUT
AUDIO
EFFECTS
SERVER VALIDATION
LEADERBOARD
CLAIMS

Each game should expose a consistent interface where practical:

start()
restart()
pause()
update()
render()
getState()
checkWin()
getRunData()

Use deterministic seeds for competitive runs.

---

# 29. RUN RECORDING / VERIFICATION

Each competitive run should be associated with:

- run ID
- challenge ID/seed
- game version
- start timestamp
- input events or replay representation
- relevant state checkpoints/hash
- result
- finish time/score

Client results are untrusted.

The server must be able to verify that a claimed win satisfies the official rules.

For this build, implement a robust local verification/replay layer even if production backend payout infrastructure is not yet connected.

---

# 30. REQUIRED REAL GAME TESTING

This is mandatory.

After implementation, you must actually play all six games in a real browser.

For EVERY game:

1. Start a fresh run.
2. Intentionally lose.
3. Retry.
4. Observe the NOWIN betrayal.
5. Identify the deterministic trigger.
6. Work out the counter-strategy.
7. Win the game.
8. Restart from a fresh run.
9. Use the discovered strategy again.
10. Win again.
11. Repeat a third time if practical.

Do not stop at reading code.

Do not claim a winning strategy merely because the code suggests one.

The agent must observe actual gameplay.

If automated browser interaction is available, use it.

If direct automated game input is not available, use the best available real interaction method and honestly document the limitation.

---

# 31. WINNING GUIDE

Create:

docs/WINNING-GUIDE.md

For each game include:

- exact win condition
- exact NOWIN betrayal
- what usually causes failure
- discovery steps
- exact counter-strategy
- exact sequence where applicable
- number of attempts tested
- number of wins
- fresh-run reproduction result
- whether the strategy is deterministic

Never write a fabricated guide.

If a game cannot yet be beaten reliably, mark it:

NOT VERIFIED

and continue debugging it.

Do not declare the whole project finished until every launch game has a verified winning method.

---

# 32. QA REPORT

Create:

docs/QA-REPORT.md

Record:

- build command/result
- dev server result
- browser test result
- desktop viewport test
- mobile viewport test
- each game tested
- each game's win condition
- each game's winning verification result
- retry test
- loss animation test
- win animation test
- reward claim UI test
- leaderboard test
- share card test
- audio toggle test
- runtime errors
- bugs fixed
- known limitations

Never state that a test passed if it was not actually performed.

---

# 33. VISUAL QA GATE

The following are explicit rejection criteria.

Reject and redesign if:

- the homepage looks like a SaaS dashboard
- game cards are plain rectangles with emoji
- games have no artwork
- colors are muted or generic
- animations are almost nonexistent
- the mascot looks like a placeholder
- game screens look like embedded widgets
- fail screens are boring
- win screens are boring
- AI opponents have no personality
- mobile looks like a shrunken desktop site

The site must look and feel like a real game.

---

# 34. PERFORMANCE

Target:

- 60fps gameplay
- immediate retry
- fast initial load
- no unnecessary giant dependencies
- lazy-load non-active game assets when practical
- avoid expensive animation loops outside gameplay

---

# 35. ACCESSIBILITY / USABILITY

Support:

- keyboard play on desktop
- touch play on mobile
- clear focus states
- sound toggle
- readable contrast
- reduced-motion fallback where reasonable

Accessibility should not flatten the visual personality.

---

# 36. FINAL ACCEPTANCE TEST

The build is complete only if a new visitor can:

1. land on the site
2. instantly understand that it is an arcade
3. instantly recognize the six game types
4. pick a game without reading a manual
5. start within seconds
6. experience a surprising NOWIN moment
7. understand why they failed after seeing it once or twice
8. immediately retry
9. learn the trick
10. genuinely win
11. see YOU ARE IN THE 1%
12. enter a Solana wallet only after winning
13. see a real/pending claim state without fake payout confirmation
14. produce a shareable result

The emotional target is:

"This is stupid."

"Why did I lose?"

"Ohhh."

"I can beat it."

"Again."

"YES."

The product is successful when the player wants to prove NOWIN wrong.

---

# 37. FINAL BUILD ORDER

Execute in this order:

PHASE 1
Audit current code and retain only reusable infrastructure.

PHASE 2
Create the art direction, mascot, palette, typography and asset system.

PHASE 3
Rebuild the arcade lobby.

PHASE 4
Rebuild all six game screens.

PHASE 5
Implement and test NOWIN betrayal mechanics.

PHASE 6
Implement AI opponents and personality.

PHASE 7
Implement win/fail/retry animation systems.

PHASE 8
Implement run recording and verification hooks.

PHASE 9
Implement 1% Club, leaderboard, daily challenge and share cards.

PHASE 10
Implement reward claim UI without requiring wallet connection during play.

PHASE 11
Play every game.

PHASE 12
Discover and verify every winning trick.

PHASE 13
Write WINNING-GUIDE.md and QA-REPORT.md based only on observed tests.

PHASE 14
Fix all visual/gameplay defects found during testing.

PHASE 15
Run final production build.

PHASE 16
Perform final browser inspection again.

---

# 38. DO NOT ASK FOR APPROVAL

Do the rebuild end-to-end.

Do not stop after scaffolding.
Do not stop after compiling.
Do not stop after styling.
Do not stop after creating cards.
Do not stop after implementing game logic.

Continue until the complete experience is playable and every launch game has an actually verified winning route.

At the end, report:

- what was rebuilt
- what was actually tested
- the exact winning trick for every game
- how many fresh runs reproduced each win
- any remaining limitation
- exact command to run the production build
- exact command to run the local app

Do not claim anything was tested if it was not actually tested.

NOWIN must be a game first.
NOWIN is the villain.
The rare winners are the content.
The 1% is the status.
$NOWIN is separate from gameplay.
