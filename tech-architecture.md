# NOWIN Arcade — Technical Architecture

## Stack

- Vite 8
- React
- TypeScript
- Phaser 4.2.1
- Vercel-compatible server functions for production adapters
- Browser localStorage for local player stats and development persistence

Keep the frontend deployable as a static web app.

## Architecture layers

### React shell
Responsible for:
- routing
- arcade lobby
- game cards
- stats
- leaderboards
- modals
- claim flow
- global UI

### Phaser game runtime
Responsible for:
- game rendering
- physics/game loop
- input
- scoring
- deterministic state
- game events

### Shared game contract

Define a type-safe contract similar to:

```ts
interface GameDefinition {
  id: string;
  name: string;
  mode: 'solo' | 'vs-ai';
  description: string;
  create(config: GameConfig): GameInstance;
}

interface GameInstance {
  start(): void;
  pause(): void;
  restart(seed?: number): void;
  destroy(): void;
  getResult(): GameResult | null;
}
```

Use the actual types you prefer, but preserve the contract idea.

## Determinism

Create a shared seeded RNG utility.

Every game receives a seed.

The debug harness must be able to run:

`seed + normalized inputs -> exact result`

Use this to:
- reproduce wins
- test betrayals
- reproduce bugs
- verify claims

## State machine

Each game should use explicit states:

`idle -> countdown -> playing -> near-miss -> lost/won -> result`

Do not allow race conditions such as multiple win events, multiple claim events, or duplicate result submissions.

## Telemetry interface

Create an adapter instead of coupling game code to a specific analytics vendor.

```ts
interface TelemetryProvider {
  track(event: string, payload?: Record<string, unknown>): void;
}
```

Use a no-op/local provider by default.

## Persistence

Create:

```ts
interface PlayerStore {
  getGameStats(gameId: string): GameStats;
  saveAttempt(result: GameResult): void;
  getRecentResults(): GameResult[];
}
```

Development provider: localStorage.

Production persistence: provider boundary ready for Supabase/Postgres or another backend.

## Reward provider

Create a provider boundary so game code never knows treasury details.

```ts
interface RewardProvider {
  isEnabled(): boolean;
  beginClaim(runId: string): Promise<ClaimStart>;
  submitClaim(runId: string, wallet: string): Promise<ClaimResult>;
}
```

Production implementation must live server-side where secrets are protected.

## Solana wallet validation

The frontend may perform basic format validation for UX, but server-side validation remains authoritative.

Do not bundle or expose:
- private keys
- seed phrases
- RPC credentials with signing capability
- treasury credentials

## Debug tools

Add a developer-only debug panel enabled only in development mode.

Features:
- set seed
- force game state
- jump to late-game checkpoint
- toggle betrayal event
- simulate win
- inspect event log
- replay deterministic run

Do not expose this panel in production.

## Performance

Target:
- smooth 60fps gameplay on normal desktop hardware
- acceptable performance on modern mid-range mobile devices
- no unnecessary React rerenders during active game loops
- keep Phaser state inside Phaser while the game is running

## Error handling

Games should fail gracefully to a result state instead of crashing the entire SPA.

Wrap game mount/unmount boundaries with React error recovery where practical.

## Security

Never trust:
- score submitted by client
- game result submitted by client
- wallet ownership claim without server-side checks
- reward amount supplied by client

All reward eligibility must be generated or verified server-side.
