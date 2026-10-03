import { useEffect, useMemo, useState } from 'react'
import './styles/index.css'
import './styles/rebuild.css'
import { GameArt } from './components/GameArt'
import { Mascot } from './components/Mascot'
import { ClaimModal } from './components/ClaimModal'
import { Arrow } from './components/Arrow'
import { audio } from './game-core/audio'
import { GAMES, getGame, seededDaily, type GameId, type GameMeta, type GameResult } from './game-core/types'
import { localPlayerStore } from './storage/playerStore'
import { SeedDebug, GameIntro, PauseCover, useRun, type ActiveGameProps } from './games/GameShell'
import { SnakeGame } from './games/SnakeGame'
import { FlapGame } from './games/FlapGame'
import { TetrisGame } from './games/TetrisGame'
import { CrossGame } from './games/CrossGame'
import { TicTacToeGame } from './games/TicTacToeGame'
import { PongGame } from './games/PongGame'

const routeOf = () => window.location.hash.slice(1) || '/'
const go = (path: string) => { window.location.hash = path; window.scrollTo({ top: 0, behavior: 'smooth' }) }

function Header({ route, muted, onSound }: { route: string; muted: boolean; onSound: () => void }) {
  return <header className="topbar"><button className="wordmark" onClick={() => go('/')} aria-label="NOWIN home"><span>NO</span>WIN<i>™</i></button><nav><button className={route === '/' ? 'active' : ''} onClick={() => go('/')}>PLAY</button><button className={route === '/club' ? 'active' : ''} onClick={() => go('/club')}>1% CLUB</button><button className={route === '/leaderboard' ? 'active' : ''} onClick={() => go('/leaderboard')}>LOCAL WINS</button></nav><button className={`sound-toggle ${muted ? '' : 'sound-toggle--on'}`} onClick={onSound} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button></header>
}
function StatTicker({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`stat-ticker ${accent ? 'stat-ticker--accent' : ''}`}><b>{value}</b><span>{label}</span></div> }
function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const stats = localPlayerStore.getGameStats(game.id); const play = () => go(`/play/${game.id}`)
  return <article className={`game-card game-card--${game.className} card-offset-${index % 3}`} style={{ '--card-color': game.color, '--card-accent': game.accent } as React.CSSProperties} onClick={play} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); play() } }} role="button" tabIndex={0} aria-label={`Play ${game.title}: ${game.tagline}`}><div className="poster-pin">{game.eyebrow === 'SOLO' ? 'SOLO' : 'VS NOWIN'}</div><GameArt game={game.id}/><div className="game-card__copy"><p className="card-index">0{index + 1}</p><h3>{game.title}</h3><p>{game.tagline}</p></div><div className="game-card__footer"><span>{stats.attempts || 0} LOCAL RUNS</span>{stats.wins > 0 && <b>✓ WON</b>}<button className="round-play" onClick={event => { event.stopPropagation(); play() }} aria-label={`Play ${game.title}`}>▶</button></div></article>
}
function Lobby() {
  const stats = localPlayerStore.getAllStats(); const attempts = Object.values(stats).reduce((total, stat) => total + stat.attempts, 0); const wins = Object.values(stats).reduce((total, stat) => total + stat.wins, 0); const nextGame = GAMES.find(game => !localPlayerStore.getGameStats(game.id).wins) || GAMES[0]
  return <main className="lobby page-enter"><section className="hero"><div className="hero-copy"><p className="kicker"><span/> THE ARCADE HATES YOU <span/></p><p className="hero-logo">NOWIN</p><h1><span>GAMES YOU</span><em>KNOW.</em><span>WINS YOU</span><strong>DON&apos;T.</strong></h1><p className="hero-sub">Someone has to win. It probably won&apos;t be you.</p><div className="hero-actions"><button className="arcade-button button--pink" onClick={() => go(`/play/${nextGame.id}`)}>PLAY NOW <Arrow /></button><button className="secondary-button" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>PICK A CABINET <Arrow direction="down"/></button></div><div className="hero-stats"><StatTicker label="LOCAL ATTEMPTS" value={String(attempts).padStart(2, '0')}/><StatTicker label="LOCAL WINS" value={String(wins).padStart(2, '0')} accent/><StatTicker label="DATA MODE" value="DEMO"/></div></div><div className="hero-art"><div className="burst">SKILL<br/>ISSUE</div><div className="hero-speech">someone<br/>has to win.</div><Mascot mood="taunt"/><i className="hero-star star-1">✦</i><i className="hero-star star-2">✷</i><i className="hero-star star-3">✦</i><div className="floor-shadow"/></div></section><section className="daily-ribbon"><div className="daily-sticker">DEMO<br/>DOOM</div><div><p className="kicker">DEMO CHALLENGE · SHARED UTC SEED</p><h2>BEAT <span>SNAKE</span> BEFORE MIDNIGHT.</h2></div><div className="daily-facts"><span>SEED <b>{seededDaily()}</b></span><span>MODE <b>LOCAL DEMO</b></span></div><button className="arcade-button button--cream" onClick={() => go('/play/snake')}>TAKE IT ON</button></section><section className="arcade-heading" id="games"><div><p className="kicker">PICK YOUR PROBLEM</p><h2>THE <span>ARCADE</span></h2></div><p>Six perfectly normal games.<br/><b>Probably.</b></p></section><section className="game-grid">{GAMES.map((game, index) => <GameCard game={game} index={index} key={game.id}/>)}</section><section className="bottom-cta"><Mascot mood="laugh"/><div><p className="kicker">THE FINE PRINT</p><h2>THE GAMES ARE FAIR.<br/><span>NOWIN ISN&apos;T NICE.</span></h2></div><button className="arcade-button button--lime" onClick={() => go('/about')}>HOW IT WORKS</button></section></main>
}
function LocalWins() {
  const wins = localPlayerStore.getRecentResults().filter(result => result.result === 'won')
  return <section className="leader-list">{wins.length ? wins.map((result, index) => <article key={result.runId}><b className="rank">0{index + 1}</b><span className="avatar">1%</span><h3>LOCAL PLAYER</h3><span>{getGame(result.gameId).title}</span><strong>{Math.max(1, Math.round((result.endedAt - result.startedAt) / 1000))}S</strong><i>LOCAL VERIFIED</i></article>) : <div className="empty-local"><Mascot mood="defeated"/><h2>NO LOCAL WINNERS YET.</h2><p>Someone has to be first.</p><button className="arcade-button button--pink" onClick={() => go('/play/snake')}>PROVE IT</button></div>}</section>
}
function ListPage({ kind }: { kind: 'club' | 'leaderboard' | 'about' }) {
  const title = kind === 'club' ? 'THE 1% CLUB' : kind === 'leaderboard' ? 'LOCAL WINNERS' : 'HOW NOWIN WORKS'
  return <main className="info-page page-enter"><section className="info-hero"><Mascot mood={kind === 'club' ? 'shock' : 'smug'}/><div><p className="kicker">{kind === 'club' ? 'LOCAL DEMO RECORDS ONLY' : kind === 'leaderboard' ? 'NO FAKE GLOBAL COUNTS' : 'YOU KNOW THE RULES. SORT OF.'}</p><h1>{title}</h1><p>{kind === 'about' ? 'Every cabinet is seeded. Every betrayal has a tell. We will not give you the tell.' : 'Production winners appear only after server verification is connected.'}</p></div></section>{kind === 'about' ? <section className="rules-grid"><article><b>01</b><h2>PLAY FREE.</h2><p>No wallet. No token. No boost. The cabinet starts when you press READY.</p></article><article><b>02</b><h2>GET BETRAYED.</h2><p>Every twist is deterministic. Lose once, learn the signal, punish the game back.</p></article><article><b>03</b><h2>GET VERIFIED.</h2><p>Production rewards require an authoritative server replay. This build is clearly local demo mode.</p></article></section> : <LocalWins/>}<button className="arcade-button button--pink" onClick={() => go('/')}>BACK TO ARCADE</button></main>
}
function ResultScreen({ result, game, onRetry, onLeave }: { result: GameResult; game: GameMeta; onRetry: () => void; onLeave: () => void }) {
  const [claim, setClaim] = useState(false); const won = result.result === 'won'; const attempts = localPlayerStore.getGameStats(game.id).attempts
  useEffect(() => { audio.play(won ? 'win' : 'fail') }, [won])
  return <div className={`result-screen ${won ? 'result-screen--win' : ''}`}><div className="result-stars">✦ ✷ ✦</div><Mascot mood={won ? 'celebrate' : 'laugh'}/><p className="kicker">{won ? 'LOCAL RUN RECORDED' : 'RUN TERMINATED'}</p><h2>{won ? 'YOU WON.' : 'SKILL ISSUE.'}</h2><p className="result-shout">{won ? 'YOU ARE IN THE 1%.' : result.detail}</p><div className="result-score"><span><b>{game.title}</b> GAME</span><span><b>{attempts}</b> ATTEMPTS</span><span><b>{Math.max(1, Math.round((result.endedAt-result.startedAt)/1000))}S</b> TIME</span><span><b>DEMO</b> RANK OFFLINE</span></div>{won ? <><button className="arcade-button button--lime" onClick={() => setClaim(true)}>CLAIM YOUR REWARD</button><button className="secondary-button" onClick={onRetry}>PLAY AGAIN <Arrow direction="retry"/></button></> : <><button className="arcade-button button--pink" onClick={onRetry}>TRY AGAIN <Arrow direction="retry"/></button><button className="secondary-button" onClick={onLeave}><Arrow direction="left"/> BACK TO ARCADE</button></>} {claim && <ClaimModal runId={result.runId} onClose={() => setClaim(false)}/>}</div>
}
const GameComponent = ({ id, ...props }: ActiveGameProps & { id: GameId }) => {
  if (id === 'snake') return <SnakeGame {...props}/>
  if (id === 'flap') return <FlapGame {...props}/>
  if (id === 'tetris') return <TetrisGame {...props}/>
  if (id === 'cross') return <CrossGame {...props}/>
  if (id === 'pong') return <PongGame {...props}/>
  return <TicTacToeGame {...props}/>
}
function GameSession({ game, seed, paused, setHud, onDone }: { game: GameMeta; seed: number; paused: boolean; setHud: (text: string) => void; onDone: (result: GameResult) => void }) { const finish = useRun(game.id, seed, onDone); return <GameComponent id={game.id} key={`${game.id}-${seed}`} seed={seed} paused={paused} setHud={setHud} onFinish={finish}/> }
function GamePage({ id }: { id: string }) {
  const game = getGame(id); const [started, setStarted] = useState(false); const [paused, setPaused] = useState(false); const [hud, setHud] = useState(game.target); const [seed, setSeed] = useState(seededDaily); const [result, setResult] = useState<GameResult | null>(null)
  useEffect(() => { setStarted(false); setPaused(false); setHud(game.target); setSeed(seededDaily()); setResult(null) }, [game.id])
  const begin = () => { audio.play('start'); setStarted(true); setPaused(false); setResult(null) }
  const done = (run: GameResult) => { localPlayerStore.saveAttempt(run); setResult(run); setPaused(true) }
  return <main className={`play-page play-page--${game.className} page-enter`}><div className="play-top"><button className="back-button" onClick={() => go('/')}><Arrow direction="left"/> <span>ARCADE</span></button><div className="cabinet-title"><p>{game.eyebrow}</p><h1>{game.title}</h1></div><div className="hud-readout"><b>{hud}</b><span>DEMO DAILY SEED · {seed}</span></div><button className="pause-button" onClick={() => setPaused(value => !value)} disabled={!started || !!result}>{paused && !result ? 'RESUME' : 'PAUSE'}</button></div><section className="game-cabinet cabinet-enter"><div className="cabinet-top"><div className="status-light"/><span>{started ? 'LIVE RUN · ANTI-WIN ENGINE ARMED' : 'INSERT COURAGE'}</span><span className="cabinet-controls">{game.controls}</span></div><div className="game-area">{!started && <GameIntro game={game} onStart={begin}/>} {started && !result && <GameSession game={game} seed={seed} paused={paused} setHud={setHud} onDone={done}/>}<PauseCover paused={paused && !result}/>{result && <ResultScreen result={result} game={game} onRetry={begin} onLeave={() => go('/')}/>}</div><div className="cabinet-bottom"><span>NOWIN SYSTEMS © 2026</span><span>DEMO MODE · FAIR? TECHNICALLY.</span></div></section><SeedDebug seed={seed} onSeed={next => { setSeed(next); setStarted(false); setResult(null) }}/></main>
}
export default function App() {
  const [route, setRoute] = useState(routeOf); const [muted, setMuted] = useState(audio.muted)
  useEffect(() => { const listener = () => setRoute(routeOf()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const page = useMemo(() => route.startsWith('/play/') ? <GamePage id={route.split('/')[2] || 'snake'}/> : route === '/club' ? <ListPage kind="club"/> : route === '/leaderboard' ? <ListPage kind="leaderboard"/> : route === '/about' ? <ListPage kind="about"/> : <Lobby/>, [route])
  return <><Header route={route} muted={muted} onSound={() => { setMuted(audio.toggle()); audio.play('click') }}/>{page}<footer><span>NOWIN // GAMES YOU KNOW. WINS YOU DON&apos;T.</span><span>NO WALLET REQUIRED TO PLAY.</span></footer></>
}
