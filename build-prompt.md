# NOWIN Current Build Brief

Build a polished cartoony arcade with exactly six games: Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe.

Every game needs a finite win condition, deterministic learnable NOWIN betrayal, mobile controls, fast retry, and a genuine winning route. Runs must never establish a client-side ranking, global record, or automatic payout entitlement.

After a displayed win, the player may submit a Solana public key to create one private, durable, **manual-review** claim. The claim API must use server-only Vercel Blob credentials, validate the public key server-side, protect duplicate run IDs, and expose CSV/status administration only behind a server-side secret. It must never auto-pay, sign transactions, expose a treasury, or misrepresent an unverified client result as approved.

Before declaring release readiness, run build, tests, lint, typecheck, and real browser/device QA. Never present client-only results as verified or global data.
