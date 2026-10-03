# NOWIN Reward Safety

The current browser build has no reward, wallet, claim, or payout flow. It does not collect wallet data, persist client results, or treat a browser score as reward eligible.

A future production claim flow must:

1. Authenticate the player and create a server-side run identity with a server-issued challenge.
2. Receive normalized input/replay data and independently replay or verify it on the server.
3. Issue a short-lived, single-use claim token only for a valid, unclaimed run.
4. Request wallet information only after successful verification, then create an idempotent payout request.

Do not ship treasury keys, signing credentials, payout secrets, or authoritative reward logic to the browser. Complete security and legal/compliance review before rewards are enabled.
