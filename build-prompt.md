# NOWIN Arcade — Master Build Prompt

You are the implementation agent for **NOWIN**, a browser arcade built around one joke:

> **You know the game. You still can't win.**

Build the product end-to-end in one pass, then run a serious local QA pass. Do not stop after scaffolding. Do not ask the user to make routine implementation decisions. Make sensible choices from the specs below.

## 1. Non-negotiable product rules

1. NOWIN is a **game first**. The token is not used to buy, unlock, boost, revive, or upgrade anything in gameplay.
2. Playing must not require connecting a wallet.
3. Wallet entry appears **only after a verified winning run** when a prize claim is enabled.
4. Every game must be recognizable within 3 seconds because it uses familiar game mechanics.
5. Losing must often feel **unexpected and funny**, as though the game has betrayed the player, but the loss must still be explainable and technically fair.
6. The player must always have a believable path to victory. Never make wins mathematically impossible.
7. The game must create a strong **one-more-try** loop: immediate retry, tiny rounds, visible personal-best progress, and near misses.
8. The site should work beautifully on mobile and desktop.
9. The interface must feel like a polished game product, not a crypto dashboard.
10. Do not use copyrighted game names, copyrighted characters, ripped assets, or copied layouts. Recreate only familiar mechanics with original NOWIN visual identity.

## 2. Recommended stack

Use:
- Vite 8 + React + TypeScript for the shell and UI.
- Phaser 4.2.1 for the 2D game runtime.
- CSS for shell/UI styling, with CSS variables for the visual system.
- Minimal dependencies. Do not add large UI kits unless genuinely necessary.
- Vercel-compatible deployment structure.
- A persistence/provider abstraction so local development works without external credentials.

Phaser is explicitly designed for browser-based HTML5 games, and its current official download page lists Phaser 4.2.1. Vite 8 is the current stable major release as of October 2026. See the official sources linked in the implementation notes if needed.

## 3. Build the complete site

Create:
- Home / arcade lobby.
- Game detail/play view.
- Results screen.
- Global stats view.
- Leaderboards.
- Daily challenge surface.
- Winner claim modal.
- About/how-it-works page or modal.
- Mobile responsive navigation.
- Sound toggle.
- Reduced-motion support.
- Error and empty states.

The arcade must open fast and allow a visitor to start playing with one click.

## 4. Launch games

Implement these **8 games** at launch:

### SOLO
1. Snake
2. Flap
3. 2048
4. Minesweeper

### VS NOWIN AI
5. Cross
6. Noughts & Crosses
7. Pong
8. Connect Four

Detailed mechanics are in `docs/game-specs.md`.

## 5. The NOWIN betrayal system

This is the core design system. Do not simply make games harder by reducing numbers until they are frustrating.

Each game needs **Betrayal Events**: rare, authored, deterministic events that can make a winning-looking run fail in an unexpected but fair way.

Rules:
- Betrayal events must be telegraphed subtly through animation, sound, pattern, timing, or board state.
- Never alter a player's input after it is accepted.
- Never move an object in a physically impossible way without a cue.
- Never change a board state retroactively.
- Do not secretly roll a 99% random death.
- Every successful win must be reproducible from a valid game seed and input trace.
- The hidden trick should be discoverable through repeated play.

Examples:
- A seemingly safe platform is only safe when entered from the correct side.
- A late-game obstacle changes pattern after a readable cue.
- An AI opponent appears to blunder but has set a trap.
- A board contains a one-time reversal that can be anticipated from visual feedback.

## 6. Make the AI a character

NOWIN AI is not just an opponent label. It is the personality of the brand.

The AI should:
- React to wins and losses.
- Deliver short contextual one-liners.
- Never spam dialogue during gameplay.
- Occasionally celebrate the player's near miss.
- Occasionally accuse the player of a skill issue.
- Become slightly more annoying as the player gets close to winning.

Do not make the AI claim actions it did not take.

## 7. Core arcade UX

Home screen should immediately communicate:

NOWIN
**Games you know. Wins you don't.**

Primary CTA:
**PLAY**

Show:
- Total attempts.
- Total verified wins.
- Current overall win rate.
- Today’s challenge.
- Current leaderboard.
- The 8 game cards.

Game cards should show:
- Game name.
- Solo / VS AI.
- Best score.
- Attempts.
- Win badge when earned.

## 8. Player loop

For every game:

LOBBY → PLAY → FAIL/WIN → SCORE → RETRY

On failure:
- Show final score.
- Show personal best comparison.
- Show funny NOWIN message.
- Show `TRY AGAIN` immediately.
- Show `BACK TO ARCADE` secondarily.

On win:
- Big win animation.
- State: `YOU ARE IN THE 1%`.
- Show attempts, score/time, and rank if available.
- If rewards are disabled: show `WIN VERIFIED` and a simulated reward preview.
- If rewards are enabled: open the wallet claim flow.

## 9. Reward system

The prize is independent of the $NOWIN token.

Do not make players purchase or hold $NOWIN to qualify.

Implement a provider interface such as:
- `RewardProvider.verifyRun()`
- `RewardProvider.getReward()`
- `RewardProvider.submitClaim()`
- `RewardProvider.getClaimStatus()`

Default local mode:
- `REWARDS_ENABLED=false`
- Use mock prize values.
- Store mock claims locally.

Production mode:
- Only enable through environment variables.
- Require backend verification before accepting a claim.
- Rate-limit claim attempts.
- Validate Solana base58 wallet addresses.
- Enforce one claim per verified run ID.
- Never trust client-submitted score data.
- Do not place treasury private keys in the frontend.

Before any real-money launch, document jurisdiction/legal review as an operational requirement. The build itself should remain functional in mock-reward mode.

## 10. Run verification / anti-cheat

For each game, produce an authoritative run record containing:
- run ID
- game ID
- game version
- seed
- start timestamp
- end timestamp
- normalized input events or deterministic action summary
- final score
- win/fail state
- client build hash or version

For local/demo mode, client-side validation is acceptable only for UX.

For reward eligibility, use a server-side verifier/provider boundary. Never award based only on a client boolean like `hasWon=true`.

## 11. Accessibility and controls

Desktop:
- Mouse.
- Keyboard.

Mobile:
- Touch-first controls.
- No hover-dependent interactions.

Support:
- reduced motion
- mute
- sufficient contrast
- large touch targets
- visible focus states

## 12. Visual direction

Tone:
- playful
- mischievous
- premium browser arcade
- mildly toxic
- meme-native
- not childish
- not overly crypto-themed

Visual identity:
- off-black/graphite base
- bright cream/white typography
- one sharp accent color used consistently
- chunky UI typography mixed with compact mono/stat typography
- subtle CRT/arcade cues, but no cheesy 8-bit overload
- game cards should feel collectible and tactile

Avoid:
- generic AI gradients
- excessive glassmorphism
- template-looking dashboards
- coin icons everywhere
- excessive neon
- long explanations

## 13. Audio

Use short original/generated UI sounds or procedural WebAudio where practical.

Need:
- click
- start
- near miss
- fail
- win
- AI reaction

Audio must be muted by default on first load until the player interacts, to respect browser autoplay policies.

## 14. Engineering structure

Prefer a clean structure like:

src/
  app/
  components/
  games/
    snake/
    flap/
    2048/
    minesweeper/
    cross/
    noughts/
    pong/
    connect4/
  game-core/
  ai/
  rewards/
  telemetry/
  storage/
  styles/
  utils/

Keep each game isolated behind a shared game contract.

A game module should expose:
- metadata
- mount/start
- pause
- restart
- destroy
- result
- telemetry hooks
- deterministic seed support

## 15. Telemetry

Track locally in development:
- game opened
- game started
- attempt completed
- score
- near miss
- betrayal event
- retry
- verified win
- claim started
- claim completed

Do not collect unnecessary personal information.

## 16. Testing requirement — do not skip this

After implementation, **test the finished product yourself**.

Do not merely run TypeScript and build commands.

Required:
1. Install dependencies.
2. Run typecheck.
3. Run lint if configured.
4. Run production build.
5. Start the production/local preview server.
6. Use browser automation if available to interact with the actual UI.
7. Test every game.
8. Test mobile-sized and desktop-sized layouts.
9. Test refresh/navigation between games.
10. Test fail → retry.
11. Test win flows using developer/test seeds.
12. Test mock reward claim flow.
13. Test invalid wallet submission.
14. Confirm no secret is shipped to the client.
15. Fix all blocking errors found.

If browser automation is unavailable, create a deterministic scripted test harness for each game and run it against the game logic. Do not falsely claim visual browser QA occurred.

## 17. Mandatory winning-trick discovery

This is a hard requirement.

After all games are implemented, create:

`docs/WINNING-GUIDE.md`

For every game include:
- exact win condition
- exact seed used for discovery/testing
- reproducible winning sequence/strategy
- any timing windows
- any subtle cues that reveal the betrayal mechanic
- common player mistake
- whether the trick works repeatedly
- a short explanation of why the trick is fair

For AI games, document how to consistently beat the AI, including any exploitable but intended patterns.

The winning guide must be based on **actual tests**, not guesses.

Also create:

`docs/QA-REPORT.md`

with:
- commands run
- tests passed/failed
- browser/devices tested
- issues found and fixed
- remaining limitations
- exact verification status of each game

## 18. Definition of done

The task is NOT done until:

- The arcade loads.
- All 8 games launch.
- Every game can be completed from start to result.
- Every game has a legitimate winning path.
- Every game has at least one authored unexpected-betrayal moment.
- VS AI games feel responsive and challenging.
- Retry is instant.
- Stats persist locally.
- Leaderboards render with mock/local data.
- Win verification is separated from client UX.
- Reward claim flow works in mock mode.
- `npm run build` succeeds.
- TypeScript succeeds with no errors.
- No obvious console errors remain.
- `docs/WINNING-GUIDE.md` contains verified strategies.
- `docs/QA-REPORT.md` contains the real test results.

## 19. Final output from the agent

When finished, report only concrete outcomes:

1. What was built.
2. Exact commands used to test it.
3. Build/typecheck result.
4. Browser QA result or limitation.
5. Location of `docs/WINNING-GUIDE.md`.
6. The winning trick for each game in a compact summary.
7. Any remaining blocker that prevents production deployment.

Do not claim a test was run if it was not actually run.
