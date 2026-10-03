# NOWIN Arcade — Agent Runbook

## Instruction

Read `build-prompt.md` and every file in `docs/` before making changes.

Then execute the work in one continuous run.

Do not stop to ask for approval for ordinary implementation choices.

## Phase 1 — inspect

- Inspect the existing repository.
- Identify whether it is empty or has existing code.
- Preserve useful existing setup only when compatible with this specification.
- Remove conflicting scaffolding if necessary.

## Phase 2 — scaffold

Set up the chosen Vite + React + TypeScript + Phaser architecture.

Keep the project easy for another AI agent to understand.

## Phase 3 — shared core

Implement first:
- seeded RNG
- game contract
- result model
- local player stats
- telemetry adapter
- reward provider boundary
- responsive shell
- audio manager

## Phase 4 — games

Implement the 8 games one by one.

For every game:
1. implement familiar base mechanic
2. implement deterministic seed
3. implement betrayal event(s)
4. implement fair counterplay
5. implement result state
6. implement retry
7. implement debug checkpoint
8. test at least one full run
9. find one reproducible winning strategy

Do not move to the next game while the current game is completely broken.

## Phase 5 — arcade layer

Implement:
- homepage
- game grid
- player stats
- leaderboards
- daily challenge
- result overlays
- winner claim flow
- AI voice/personality layer

## Phase 6 — reward verification boundary

Implement mock reward mode first.

Then wire the production adapter interface without requiring treasury credentials.

The product must run cleanly when production reward variables are absent.

## Phase 7 — actual testing

Run commands from `docs/qa-test-plan.md`.

Use available browser automation when possible.

Do not claim browser QA when only static checks were performed.

## Phase 8 — winning-trick discovery

This is required and must happen after the games work.

For each game:
- start from a known seed
- play it repeatedly
- identify the actual trap/betrayal
- find the counterplay
- reproduce the win at least twice if deterministic
- record the exact steps

Then write:

`docs/WINNING-GUIDE.md`

## Phase 9 — final QA

Fix blocking problems.

Re-run build and typecheck after fixes.

Then write:

`docs/QA-REPORT.md`

## Phase 10 — final report

Report:
- files created
- commands run
- build result
- typecheck result
- visual/browser QA result
- winning trick for every game
- known limitations

Do not write generic claims such as "everything works" without test evidence.
