# NOWIN Product Specification

## Thesis
**GAMES YOU KNOW. WINS YOU DON'T.**

NOWIN is a colorful browser arcade of six familiar games with authored, deterministic anti-win moments. Players learn the betrayal and eventually beat it.

## Information architecture
- `/` arcade lobby
- `/play/:gameId` cabinet
- `/about` rules

The visible navigation exposes Play and How It Works. Invalid or retired paths fall back to the arcade lobby.

## Launch games
Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe.

## Production-system boundaries
The shipped client does not expose a leaderboard, player rank, global statistics, daily challenge, shared seed, winner feed, wallet collection, reward claim, or payout. Active gameplay state exists only in memory for the current session.

Any future competitive or reward system requires authenticated server-issued challenges, server-side replay verification, authoritative result storage, rate limiting, payout integration, security review, and legal review. Until then, those capabilities remain hidden or plainly unavailable rather than simulated.
