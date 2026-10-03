# NOWIN — Anti-Cheat and Reward Specification

## Goal

A winning run should feel exciting, while the reward system must not rely on a client-controlled boolean.

## Threat model

Assume a malicious player can:
- modify JavaScript
- alter localStorage
- call frontend APIs directly
- change score variables
- skip game states
- replay requests
- submit arbitrary wallet addresses

The production reward flow must resist these attacks.

## Run identity

On start, generate a run ID.

Create an authoritative run record containing:
- run ID
- game ID
- game version
- seed
- start time
- result time
- normalized inputs / action summary
- result
- score
- verification status

## Deterministic verification

For games with manageable input logs, keep enough input information to replay the run server-side.

For more complex games, use checkpoint hashes or compact action summaries.

The exact implementation can vary by game, but the principle remains:

> **The client proposes a result. The verifier decides whether it counts.**

## Claim flow

1. Player wins.
2. Client displays `YOU ARE IN THE 1%`.
3. Client requests verification using `runId`.
4. Server verifies the run.
5. If valid, server issues a short-lived claim token.
6. UI opens wallet entry.
7. Player submits Solana wallet address.
8. Server validates wallet format and claim token.
9. Server checks `runId` has not already been claimed.
10. Server creates reward payout request.
11. Payout status is stored.
12. UI displays confirmation.

## Idempotency

Every payout must be keyed by a unique run ID.

A duplicate claim for the same run must return the existing claim state rather than pay again.

## Mock reward mode

Default:

`REWARDS_ENABLED=false`

Local mock should simulate:
- verification
- claim creation
- payout pending
- payout success

Use a fake transaction signature in mock mode and label it clearly as mock.

## Production safety

Do not store treasury secrets in:
- VITE_* environment variables
- browser bundles
- public config
- localStorage

Use server-side environment variables only.

Before enabling actual prizes, the operator should complete a legal/compliance review for the jurisdictions in which the prize mechanic will be offered.

## Abuse controls

Add:
- rate limiting on verification requests
- rate limiting on claim attempts
- max claims per IP/session as a basic abuse layer
- server-side duplicate detection
- suspicious run logging
- admin-only manual review flag

Do not permanently ban based only on one heuristic.

## Wallet UX

Do not auto-connect wallets.

Use a plain wallet address field for the reward claim unless the product later chooses to support signed ownership proof.

The claim form should say:

> Paste the Solana wallet that should receive your verified winner reward.

And a small warning:

> Double-check your address. Rewards sent to the wrong address may not be recoverable.

## Token separation

$NOWIN is not required for:
- game access
- prize eligibility
- score submission
- leaderboard eligibility
- retries
- daily challenges

Never make gameplay balance dependent on $NOWIN price or holdings.
