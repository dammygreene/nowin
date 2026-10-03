# NOWIN QA Test Plan

## Commands
```bash
npm install
npm test
npm run lint
npm run typecheck
npm run build
npm run dev -- --host 0.0.0.0
```

## Browser pass required before release
At 390×844, 430×932, 768×1024, 1280×800, and 1440×900:
- inspect lobby, six cards, navigation, demo labels, motion, and focus states;
- start, lose, retry, and win Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe;
- verify game-over and full-screen win experience;
- check keyboard and touch controls;
- check claim form rejects malformed wallet input and never sends a payout;
- inspect console/network errors.

## Production gate
Do not mark browser QA passed without actual browser interaction. Do not enable rewards without server replay verification, rate limiting, claim idempotency, payout security, and legal review.
