# NOWIN Reward Safety

NOWIN’s browser client can submit a manual-review claim only after its UI reports a win. It does not connect a wallet, ask for a signature, send a payment, expose a treasury, or treat a client score as an approved reward.

## Present verification status

The game system has no server-issued run session or server replay verifier yet. The claim API validates payload shape and the Solana public key server-side, then routes the submission through an explicit verification boundary. That boundary records every accepted submission as `PENDING` with `PENDING_REVIEW`; it does not assert that the client result is genuine, approved, or paid.

A future authoritative flow must:

1. Authenticate or otherwise bind a server-issued run identity and challenge to the player/session.
2. Receive normalized input/replay data and independently replay or verify it on the server.
3. Issue a short-lived, single-use claim token only for a valid, unclaimed run.
4. Request a wallet only after successful verification, then create an idempotent manual-review or payout request.

The currently implemented manual-review records are private Vercel Blob objects keyed idempotently by run ID. Admin-only CSV export and status updates require a server-side `NOWIN_ADMIN_SECRET`.

Do not ship treasury keys, signing credentials, payout secrets, or authoritative reward logic to the browser. Complete security and legal/compliance review before changing a pending claim into a paid reward.
