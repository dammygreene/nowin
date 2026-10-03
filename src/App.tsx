import { useEffect, useMemo, useState } from 'react'
import './styles/index.css'
import { GameArt } from './components/GameArt'
import { Mascot } from './components/Mascot'
import { ClaimModal } from './components/ClaimModal'
import { audio } from './game-core/audio'
import { GAMES, getGame, seededDaily, type GameId, type GameMeta, type GameResult } from './game-core/types'
import { localPlayerStore } from './storage/playerStore'
import { SeedDebug, GameIntro, PauseCover, useRun, type ActiveGameProps } from './games/GameShell'
import { SnakeGame } from './games/SnakeGame'
import { FlapGame } from './games/FlapGame'
import { MergeGame } from './games/MergeGame'
import { MinesGame } from './games/MinesGame'
import { CrossGame } from './games/CrossGame'
import { NoughtsGame } from './games/NoughtsGame'
import { PongGame } from './games/PongGame'
import { ConnectGame } from './games/ConnectGame'

const samples = [
  ['SushiBoi', 'SNAKE', '02:18'], ['0xMila', 'PONG', '7–5'], ['mossy', 'MINES', '00:42'], ['neonpup', 'CROSS', '00:17'], ['solPlayer', '2048', '128']
]
const routeOf = () => window.location.hash.slice(1) || '/'
const go = (path: string) => { window.location.hash = path; window.scrollTo({ top: 0, behavior: 'smooth' }) }

function Header({ route, muted, onSound }: { route: string; muted: boolean; onSound: () => void }) {
  return <header className="topbar"><button className="wordmark" onClick={() => go('/')} aria-label="NOWIN home"><span>NO</span>WIN<i>™</i></button><nav><button className={route === '/' ? 'active' : ''} onClick={() => go('/')}>PLAY</button><button className={route === '/club' ? 'active' : ''} onClick={() => go('/club')}>1% CLUB</button><button className={route === '/leaderboard' ? 'active' : ''} onClick={() => go('/leaderboard')}>LEADERBOARD</button></nav><button className={`sound-toggle ${muted ? '' : 'sound-toggle--on'}`} onClick={onSound} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button></header>
}

function StatTicker({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`stat-ticker ${accent ? 'stat-ticker--accent' : ''}`}><b>{value}</b><span>{label}</span></div> }

function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const stats = localPlayerStore.getGameStats(game.id)
  return <article className={`game-card game-card--${game.className} card-offset-${index % 4}`} style={{ '--card-color': game.color, '--card-accent': game.accent } as React.CSSProperties}><div className="poster-pin">{game.eyebrow === 'SOLO' ? 'SOLO' : 'VS AI'}</div><GameArt game={game.id}/><div className="game-card__copy"><p className="card-index">0{index+1}</p><h3>{game.title}</h3><p>{game.tagline}</p></div><div className="game-card__footer"><span>{stats.attempts || 0} ATTEMPTS</span>{stats.wins > 0 && <b>✓ WON</b>}<button className="round-play" onClick={() => go(`/play/${game.id}`)} aria-label={`Play ${game.title}`}>▶</button></div></article>
}

function Lobby() {
  const all = localPlayerStore.getAllStats(); const attempts = Object.values(all).reduce((total, stat) => total + stat.attempts, 0); const wins = Object.values(all).reduce((total, stat) => total + stat.wins, 0); const nextGame = GAMES.find(game => !localPlayerStore.getGameStats(game.id).wins) || GAMES[0]
  return <main className="lobby"><section className="hero"><div className="hero-copy"><p className="kicker"><span/> THE ARCADE HATES YOU <span/></p><h1><span>GAMES YOU</span><em>KNOW.</em><span>WINS YOU</span><strong>DON&apos;T.</strong></h1><p className="hero-sub">Someone has to win. It probably won&apos;t be you.</p><div className="hero-actions"><button className="arcade-button button--pink" onClick={() => go(`/play/${nextGame.id}`)}>PLAY NOW <span>→</span></button><button className="text-button" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>PICK A CABINET ↓</button></div><div className="hero-stats"><StatTicker label="YOUR ATTEMPTS" value={String(attempts).padStart(2, '0')}/><StatTicker label="YOUR WINS" value={String(wins).padStart(2, '0')} accent/><StatTicker label="GLOBAL WIN RATE" value="0.71%"/></div></div><div className="hero-art"><div className="burst">SKILL<br/>ISSUE</div><div className="hero-speech">someone<br/>has to win.</div><Mascot mood="idle"/><i className="hero-star star-1">✦</i><i className="hero-star star-2">✷</i><i className="hero-star star-3">✦</i><div className="floor-shadow"/></div></section><section className="daily-ribbon"><div className="daily-sticker">DAILY<br/>DOOM</div><div><p className="kicker">TODAY&apos;S SHARED SEED</p><h2>BEAT <span>{nextGame.title}</span> BEFORE MIDNIGHT.</h2></div><div className="daily-facts"><span>SEED <b>{seededDaily()}</b></span><span>ATTEMPTS <b>12,480</b></span><span>WINNERS <b>79</b></span></div><button className="arcade-button button--cream" onClick={() => go(`/play/${nextGame.id}`)}>TAKE IT ON</button></section><section className="arcade-heading" id="games"><div><p className="kicker">SELECT YOUR PROBLEM</p><h2>THE <span>ARCADE</span></h2></div><p>Eight perfectly normal games.<br/><b>Probably.</b></p></section><section className="game-grid">{GAMES.map((game, index) => <GameCard game={game} index={index} key={game.id}/>)}</section><section className="bottom-cta"><Mascot mood="laugh"/><div><p className="kicker">THE FINE PRINT</p><h2>THE GAMES ARE FAIR.<br/><span>NOWIN ISN&apos;T NICE.</span></h2></div><button className="arcade-button button--lime" onClick={() => go('/about')}>HOW IT WORKS</button></section></main>
}

function ListPage({ kind }: { kind: 'club' | 'leaderboard' | 'about' }) {
  const title = kind === 'club' ? 'THE 1% CLUB' : kind === 'leaderboard' ? 'LEADERBOARD' : 'HOW NOWIN WORKS'
  return <main className="info-page"><section className="info-hero"><Mascot mood={kind === 'club' ? 'shock' : 'smug'}/><div><p className="kicker">{kind === 'club' ? 'VERIFIED LOCAL WINS + DEMO DATA' : kind === 'leaderboard' ? 'TODAY’S LEAST UNLUCKY' : 'YOU KNOW THE RULES. SORT OF.'}</p><h1>{title}</h1><p>{kind === 'about' ? 'Every cabinet is seeded. Every betrayal has a tell. We will not give you the tell.': 'These people did something we cannot explain.'}</p></div></section>{kind === 'about' ? <section className="rules-grid"><article><b>01</b><h2>PLAY FREE.</h2><p>No wallet. No token. No boost. The cabinet starts when you press GO.</p></article><article><b>02</b><h2>GET BETRAYED.</h2><p>Every twist is deterministic. Lose once, learn the signal, punish the game back.</p></article><article><b>03</b><h2>GET VERIFIED.</h2><p>Local demo wins create a mock reward claim. Live rewards require server verification.</p></article></section> : <section className="leader-list">{samples.map(([name, game, score], index) => <article key={name}><b className="rank">0{index + 1}</b><span className="avatar">{name.slice(0,1)}</span><h3>{name}</h3><span>{game}</span><strong>{score}</strong><i>VERIFIED</i></article>)}</section>}<button className="arcade-button button--pink" onClick={() => go('/')}>BACK TO ARCADE</button></main>
}

function ResultScreen({ result, game, onRetry, onLeave }: { result: GameResult; game: GameMeta; onRetry: () => void; onLeave: () => void }) {
  const [claim, setClaim] = useState(false); const won = result.result === 'won';
  useEffect(() => { audio.play(won ? 'win' : 'fail') }, [won])
  return <div className={`result-screen ${won ? 'result-screen--win' : ''}`}><div className="result-stars">✦ ✷ ✦</div><Mascot mood={won ? 'shock' : 'laugh'}/><p className="kicker">{won ? 'VERIFIED LOCAL RUN' : 'RUN TERMINATED'}</p><h2>{won ? 'YOU WON.' : 'NOPE.'}</h2><p className="result-shout">{won ? 'WELCOME TO THE 1%.' : result.detail}</p><div className="result-score"><span><b>{game.title}</b> CABINET</span><span><b>{result.score}</b> SCORE</span><span><b>{Math.max(1, Math.round((result.endedAt-result.startedAt)/1000))}S</b> RUN</span></div>{won ? <><button className="arcade-button button--lime" onClick={() => setClaim(true)}>CLAIM YOUR WIN</button><button className="text-button" onClick={onRetry}>PLAY AGAIN</button></> : <><button className="arcade-button button--pink" onClick={onRetry}>TRY AGAIN <span>↻</span></button><button className="text-button" onClick={onLeave}>BACK TO ARCADE</button></>} {claim && <ClaimModal runId={result.runId} onClose={() => setClaim(false)}/>}</div>
}

const GameComponent = ({ id, ...props }: ActiveGameProps & { id: GameId }) => {
  if (id === 'snake') return <SnakeGame {...props}/>
  if (id === 'flap') return <FlapGame {...props}/>
  if (id === 'merge') return <MergeGame {...props}/>
  if (id === 'mines') return <MinesGame {...props}/>
  if (id === 'cross') return <CrossGame {...props}/>
  if (id === 'noughts') return <NoughtsGame {...props}/>
  if (id === 'pong') return <PongGame {...props}/>
  return <ConnectGame {...props}/>
}

function GameSession({ game, seed, paused, setHud, onDone }: { game: GameMeta; seed: number; paused: boolean; setHud: (text: string) => void; onDone: (result: GameResult) => void }) {
  const finish = useRun(game.id, seed, onDone)
  return <GameComponent id={game.id} key={`${game.id}-${seed}`} seed={seed} paused={paused} setHud={setHud} onFinish={finish}/>
}
function GamePage({ id }: { id: string }) {
  const game = getGame(id); const [started, setStarted] = useState(false); const [paused, setPaused] = useState(false); const [hud, setHud] = useState(game.target); const [seed, setSeed] = useState(seededDaily); const [result, setResult] = useState<GameResult | null>(null)
  useEffect(() => { setStarted(false); setPaused(false); setHud(game.target); setSeed(seededDaily()); setResult(null) }, [game.id])
  const begin = () => { audio.play('start'); setStarted(true); setPaused(false); setResult(null) }
  const done = (run: GameResult) => { localPlayerStore.saveAttempt(run); setResult(run); setPaused(true) }
  return <main className={`play-page play-page--${game.className}`}><div className="play-top"><button className="back-button" onClick={() => go('/')}>← <span>ARCADE</span></button><div className="cabinet-title"><p>{game.eyebrow}</p><h1>{game.title}</h1></div><div className="hud-readout"><b>{hud}</b><span>DAILY SEED · {seed}</span></div><button className="pause-button" onClick={() => setPaused(value => !value)} disabled={!started || !!result}>{paused && !result ? 'RESUME' : 'PAUSE'}</button></div><section className="game-cabinet"><div className="cabinet-top"><div className="status-light"/><span>{started ? 'LIVE RUN' : 'INSERT COURAGE'}</span><span className="cabinet-controls">{game.controls}</span></div><div className="game-area">{!started && <GameIntro game={game} onStart={begin}/>} {started && !result && <GameSession game={game} seed={seed} paused={paused} setHud={setHud} onDone={done}/>}<PauseCover paused={paused && !result}/>{result && <ResultScreen result={result} game={game} onRetry={begin} onLeave={() => go('/')}/>}</div><div className="cabinet-bottom"><span>NOWIN SYSTEMS © 2026</span><span>FAIR? TECHNICALLY.</span></div></section><SeedDebug seed={seed} onSeed={next => { setSeed(next); setStarted(false); setResult(null) }}/></main>
}

export default function App() {
  const [route, setRoute] = useState(routeOf); const [muted, setMuted] = useState(audio.muted)
  useEffect(() => { const listener = () => setRoute(routeOf()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const page = useMemo(() => route.startsWith('/play/') ? <GamePage id={route.split('/')[2] || 'snake'}/> : route === '/club' ? <ListPage kind="club"/> : route === '/leaderboard' ? <ListPage kind="leaderboard"/> : route === '/about' ? <ListPage kind="about"/> : <Lobby/>, [route])
  return <><Header route={route} muted={muted} onSound={() => { setMuted(audio.toggle()); audio.play('click') }}/>{page}<footer><span>NOWIN // GAMES YOU KNOW. WINS YOU DON&apos;T.</span><span>NO WALLET REQUIRED TO PLAY.</span></footer></>
}
