# NOWIN QA Test Plan

## Commands

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

For Vercel Function integration tests with configured private storage:

```bash
npm run dev:vercel
```

## Browser pass required before release

At 390×844, 430×932, 768×1024, 1280×800, and 1440×900:

- inspect lobby, exactly six cards, Play/How It Works navigation, motion, focus, and visual overflow;
- confirm retired-game, leaderboard, and club paths do not expose obsolete surfaces;
- start, lose, retry, discover counterplay, and win Snake, Flap, Tetris, Cross, Pong, and Tic-Tac-Toe from fresh runs;
- reproduce each winning route at least three times where practical and retain input traces;
- verify the post-win claim panel matches the cabinet styling and does not ask for wallet connection/signature;
- submit a valid Solana public key from an actual winning result to a configured private Blob store;
- reject invalid/missing wallet values without creating a record;
- submit the same `run_id` again and verify the API returns duplicate status without creating another record;
- authenticate an admin export request and confirm the private CSV has exactly the saved row and safe field escaping;
- verify unauthenticated export/update attempts return `401` and cannot reveal claims;
- use the protected update endpoint to record `PAID` or `REJECTED` manually; confirm it cannot alter wallet/game/run fields;
- check keyboard, pointer, and touch controls;
- inspect browser console and network requests, including the external font request.

## Production gate

Do not mark browser QA, Blob persistence, CSV export, or reward claims passed without actual browser and configured-Vercel interaction. Do not enable automatic payout without server-issued runs, replay verification, durable distributed rate limiting, claim idempotency, payout security, and legal review.
