# NOWIN QA Test Plan

## Commands
```bash
npm install
npm test
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

## Browser pass required before release
At 390×844, 430×932, 768×1024, 1280×800, and 1440×900:

- inspect lobby, exactly six cards, Play/How It Works navigation, motion, focus, and visual overflow;
- confirm retired-game, leaderboard, and club paths do not expose obsolete surfaces;
- start, lose, retry, discover counterplay, and win Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe from fresh runs;
- reproduce each winning route at least three times where practical and retain input traces;
- verify game-over and full-screen win experience;
- check keyboard, pointer, and touch controls;
- verify result screens do not collect wallet data or imply a claimed/pending payout;
- inspect browser console and network requests, including the external font request.

## Production gate
Do not mark browser QA passed without actual browser interaction. Do not enable rewards without authentication, server replay verification, authoritative result storage, rate limiting, claim idempotency, payout security, and legal review.
