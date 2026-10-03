# NOWIN Arcade — Technical Architecture

## Shipped client

- Vite 8
- React
- TypeScript
- CSS and browser-native animation/game loops

The arcade is a static client application. It does not use Phaser, a database, server functions, authentication, analytics adapter, browser persistence, wallet library, or API client.

## Runtime layers

### React shell

The application shell owns hash-based navigation, the arcade lobby, six game cards, How It Works, sound toggle, game intro/countdown, pause state, result state, and responsive controls.

### Game modules

Each cabinet is a focused React game module. It receives the active run seed, paused state, HUD setter, and completion callback. Game state is held in component refs/state for the active session and is discarded when the cabinet is restarted or left.

### Shared run contract

`src/game-core/types.ts` defines the six game IDs, game metadata, and the in-memory result shape. `src/game-core/rng.ts` provides deterministic pseudo-randomness for a particular active run.

A seed supports reproducible development/debugging for the same action sequence. It is not exposed as a daily challenge, stored player record, shared challenge, anti-cheat credential, or claim token.

## State and security boundary

The shipped client intentionally has:

- no `localStorage` / `sessionStorage` player data;
- no authoritative score or winner storage;
- no leaderboard, rank, global metric, or social feed;
- no network endpoint for run submission;
- no wallet, transaction, claim, or reward provider;
- no production-visible developer seed controls.

A client-side score or result must never be treated as authoritative, competitive, or reward eligible.

## Future server requirements

Any authenticated competition, daily challenge, reward, or payout system must be implemented outside this static client. It needs server-issued run identities/challenges, authenticated requests, normalized input capture, server-side replay verification, authoritative storage, rate limiting, abuse monitoring, short-lived single-use claim tokens, idempotent payments, secrets management, security review, and legal/compliance review.

Do not place private keys, signing credentials, seed phrases, wallet data, or treasury logic in the browser bundle.

## Quality and error handling

Game completion guards prevent repeated result callbacks in a run. Automated tests cover application launch flow, cabinet inventory, and selected deterministic contracts. Real-browser gameplay, desktop/mobile interaction, console, and network verification remain separate release gates documented in [`docs/QA-REPORT.md`](./docs/QA-REPORT.md).
