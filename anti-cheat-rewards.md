# NOWIN Reward Safety

The current browser build is demo-only. It never treats a client score, localStorage entry, or wallet format check as a reward-eligible win.

Production claim flow:
1. Server creates a run identity and challenge seed.
2. Server replays/verifies the submitted normalized inputs.
3. Server issues a short-lived claim token only for a valid unclaimed run.
4. Server validates wallet data and creates an idempotent payout request.

Do not ship treasury keys, signing credentials, or payout secrets to the browser. Complete legal/compliance review before rewards are enabled.
