# COPECADE Product Specification

## Thesis

**GAMES YOU KNOW. WINS YOU DON'T.**

COPECADE is a colorful browser arcade of six familiar games with authored, deterministic anti-win moments. Players learn the betrayal and eventually beat it.

## Information architecture

- `/` arcade lobby
- `/play/:gameId` cabinet
- `/about` rules
- `POST /api/claims` manual-review claim submission after a client win
- `GET /api/admin/export` protected private CSV export
- `PATCH /api/admin/claims` protected manual status update

The visible navigation exposes Play and How It Works. Invalid or retired paths fall back to the arcade lobby.

## Launch games

Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe.

## Reward-claim boundary

A player can play every game without an account, wallet connection, transaction, token, payment, or login. On a win, the client shows the game result and a Solana wallet form. A successful API save shows only `CLAIM RECEIVED` and states that rewards are reviewed manually.

Claims are private durable records in Vercel Blob and begin as `PENDING`. There is no public claim history, rank, global statistic, social proof, daily challenge, shared seed, winner feed, automatic payout, wallet display, or transaction confirmation.

This build does not have server-side replay verification. Claim submissions are explicitly `PENDING_REVIEW`; they must not be regarded as verified wins or paid rewards until the team performs an appropriate review. See [`docs/REWARD-CLAIMS.md`](./docs/REWARD-CLAIMS.md) for storage and admin constraints.
