# NOWIN Product Specification

## Thesis
**GAMES YOU KNOW. WINS YOU DON'T.**

NOWIN is a colorful browser arcade of six familiar games with authored, deterministic anti-win moments. Players learn the betrayal and eventually beat it.

## Information architecture
- `/` arcade lobby
- `/play/:gameId` cabinet
- `/club` local/demo 1% Club
- `/leaderboard` local wins
- `/about` rules

## Demo versus production
The current app clearly labels local/demo statistics and its UTC demo challenge. Production requires server-generated daily challenge data, verified winners, and authoritative run replay before any global data or rewards are presented.

## Launch games
Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe.

## Rewards
Play never requires a wallet. The reward form appears only after a win and remains unavailable until a server-side verifier and payout service exist.
