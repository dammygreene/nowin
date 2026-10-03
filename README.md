# NOWIN Arcade — AI Agent Specification Pack

This folder contains the implementation instructions for the NOWIN browser arcade.

## Files

- `build-prompt.md` — master prompt. Give this to the coding agent first.
- `docs/product-spec.md` — product behavior and UX.
- `docs/game-specs.md` — exact game requirements and betrayal mechanics.
- `docs/tech-architecture.md` — implementation architecture.
- `docs/anti-cheat-rewards.md` — verified winner and reward system.
- `docs/qa-test-plan.md` — QA acceptance checklist.
- `docs/agent-runbook.md` — execution sequence and completion requirements.
- `docs/brand-spec.md` — NOWIN voice and messaging.

## Required generated files after build

The coding agent must additionally create:

- `docs/WINNING-GUIDE.md`
- `docs/QA-REPORT.md`

These two files must be based on actual implementation and testing.

## Suggested agent input

Point the agent at the repository containing this specification pack and give it:

> Read `build-prompt.md` and all files under `docs/`. Build NOWIN end-to-end according to the specification. Do not stop at scaffolding. Test the finished product, find and reproduce a legitimate win for every game, and write `docs/WINNING-GUIDE.md` and `docs/QA-REPORT.md` from the actual test results.
