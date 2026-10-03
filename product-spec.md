# NOWIN Arcade — Product Specification

## Product thesis

NOWIN is a browser arcade built around a single meme:

> **Games you know. Wins you don't.**

The player enters expecting familiar games, but the experience keeps producing surprising failures. The player is convinced a win is possible because other people are visibly winning.

## Product principles

### 1. Familiarity
The first interaction of every game should make sense without a tutorial longer than one sentence.

### 2. Betrayal
The game should occasionally appear to betray the player at the moment they become confident.

### 3. Fairness underneath
The betrayal is authored, deterministic, and ultimately learnable. A skilled player can discover the counterplay.

### 4. Speed
A failed attempt must restart within roughly one second after the result screen is dismissed.

### 5. Social proof
The site continuously shows that winners exist.

### 6. No crypto friction
No wallet connection to play. The $NOWIN token is completely separate from gameplay.

## Information architecture

- `/` Arcade lobby
- `/play/:gameId` Game
- `/leaderboard` Leaderboard
- `/daily` Daily challenge
- `/about` About

## Home screen

Hero:

**NOWIN**

**Games you know. Wins you don't.**

CTA:

**PLAY**

Secondary stats:
- attempts today
- verified wins today
- current overall win rate
- current daily challenge

Game grid:
- Snake
- Flap
- 2048
- Minesweeper
- Cross
- Noughts & Crosses
- Pong
- Connect Four

## Result states

### Loss

Show:
- score/result
- best score
- attempt number
- short NOWIN insult
- `TRY AGAIN`
- `BACK TO ARCADE`

Do not bury retry behind a menu.

### Win

Show:

**YOU WON**

**WELCOME TO THE 1%**

Show:
- game
- score/time
- attempts
- global rank if available
- reward amount or mock reward amount

Then:

**CLAIM YOUR WIN**

## 1% model

The "1%" is a cultural label, not a guarantee that exactly 1% will win.

Target a very low historical win rate, generally around 0.1%–1.0% depending on the game. Tune difficulty through testing.

Do not use hidden random loss rolls to force that number.

## Daily challenge

Once per day, each game can expose a seeded challenge shared across all players.

The daily challenge must be:
- deterministic
- replayable
- globally comparable
- reset on a scheduled UTC boundary

Show:
- total attempts
- verified wins
- lowest winning time / highest winning score
- top leaderboard

## Social sharing

Create share cards after wins.

Example:

> I beat NOWIN.
> 
> Pong
> 381 attempts
> 10–9
> 
> I'm in the 1%.

Share card should include a compact verification ID, not a private wallet address.
