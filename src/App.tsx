import { useEffect, useMemo, useState } from 'react'
import './styles/index.css'
import './styles/rebuild.css'
import { Arrow } from './components/Arrow'
import { GameArt } from './components/GameArt'
import { Mascot } from './components/Mascot'
import { audio } from './game-core/audio'
import { GAMES, getGame, type GameId, type GameMeta, type GameResult } from './game-core/types'
import { GameIntro, PauseCover, useRun, type ActiveGameProps } from './games/GameShell'
import { SnakeGame } from './games/SnakeGame'
import { FlapGame } from './games/FlapGame'
import { TetrisGame } from './games/TetrisGame'
import { CrossGame } from './games/CrossGame'
import { PongGame } from './games/PongGame'
import { TicTacToeGame } from './games/TicTacToeGame'

const routeOf = () => window.location.hash.slice(1) || '/'
const go = (path: string) => { window.location.hash = path; window.scrollTo({ top: 0, behavior: 'smooth' }) }
const newRunSeed = () => (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0

function Header({ route, muted, onSound }: { route: string; muted: boolean; onSound: () => void }) {
  return <header className="topbar"><button className="wordmark" onClick={() => go('/')} aria-label="NOWIN home"><span>NO</span>WIN<i>™</i></button><nav><button className={route === '/' ? 'active' : ''} onClick={() => go('/')}>PLAY</button><button className={route === '/about' ? 'active' : ''} onClick={() => go('/about')}>HOW IT WORKS</button></nav><button className={`sound-toggle ${muted ? '' : 'sound-toggle--on'}`} onClick={onSound} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button></header>
}

function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const play = () => go(`/play/${game.id}`)
  const moods: Record<GameId, 'idle' | 'taunt' | 'laugh' | 'angry' | 'smug' | 'happy'> = { snake: 'taunt', flap: 'happy', tetris: 'angry', cross: 'laugh', pong: 'smug', tictactoe: 'taunt' }
  return <article className={`game-card game-card--${game.className} card-offset-${index % 3}`} style={{ '--card-color': game.color, '--card-accent': game.accent } as React.CSSProperties} onClick={play} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); play() } }} role="button" tabIndex={0} aria-label={`Play ${game.title}: ${game.tagline}`}><div className="poster-pin">{game.eyebrow === 'SOLO' ? 'SOLO' : 'VS NOWIN'}</div><GameArt game={game.id}/><Mascot mood={moods[game.id]} className={`card-mascot card-mascot--${game.id}`}/><div className="game-card__copy"><p className="card-index">0{index + 1}</p><h3>{game.title}</h3><p>{game.tagline}</p></div><div className="game-card__footer"><span>{game.target}</span><button className="cabinet-play" onClick={event => { event.stopPropagation(); play() }} aria-label={`Play ${game.title}`}>PLAY <Arrow/></button></div></article>
}

function Lobby() {
  return <main className="lobby page-enter"><section className="hero"><div className="hero-copy"><p className="kicker"><span/> THE ARCADE HATES YOU <span/></p><p className="hero-logo">NOWIN</p><h1><span>GAMES YOU</span><em>KNOW.</em><span>WINS YOU</span><strong>DON&apos;T.</strong></h1><p className="hero-sub">Someone has to win. It probably won&apos;t be you.</p><div className="hero-actions"><button className="arcade-button button--pink" onClick={() => go('/play/snake')}>PLAY NOW <Arrow /></button><button className="secondary-button" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>PICK A CABINET <Arrow direction="down"/></button></div></div><div className="hero-art"><div className="burst">SKILL<br/>ISSUE</div><div className="hero-speech">someone<br/>has to win.</div><Mascot mood="taunt"/><i className="hero-star star-1">✦</i><i className="hero-star star-2">✷</i><i className="hero-star star-3">✦</i><div className="floor-shadow"/></div></section><section className="arcade-heading" id="games"><div><p className="kicker">PICK YOUR PROBLEM</p><h2>THE <span>ARCADE</span></h2></div><p>Six perfectly normal games.<br/><b>Probably.</b></p></section><section className="game-grid">{GAMES.map((game, index) => <GameCard game={game} index={index} key={game.id}/>)}</section><section className="bottom-cta"><Mascot mood="laugh"/><div><p className="kicker">THE FINE PRINT</p><h2>THE GAMES ARE FAIR.<br/><span>NOWIN ISN&apos;T NICE.</span></h2></div><button className="arcade-button button--lime" onClick={() => go('/about')}>HOW IT WORKS</button></section></main>
}

function AboutPage() {
  return <main className="info-page page-enter"><section className="info-hero"><Mascot mood="smug"/><div><p className="kicker">SIX GAMES. ONE PROBLEM.</p><h1>HOW NOWIN WORKS</h1><p>Every cabinet has a deterministic tell. Lose once, learn it, then make the arcade regret underestimating you.</p></div></section><section className="rules-grid"><article><b>01</b><h2>PLAY FREE.</h2><p>No wallet. No token. No boost. The cabinet starts when you press READY.</p></article><article><b>02</b><h2>GET BETRAYED.</h2><p>Every twist is authored and learnable. The game can deceive you. It cannot secretly roll your loss.</p></article><article><b>03</b><h2>BEAT NOWIN.</h2><p>Rewards, rankings, and daily competitions remain unavailable until a server-side verifier exists.</p></article></section><button className="arcade-button button--pink" onClick={() => go('/')}>BACK TO ARCADE</button></main>
}

function ResultScreen({ result, game, onRetry, onLeave }: { result: GameResult; game: GameMeta; onRetry: () => void; onLeave: () => void }) {
  const won = result.result === 'won'
  useEffect(() => { audio.play(won ? 'win' : 'fail') }, [won])
  return <div className={`result-screen ${won ? 'result-screen--win' : ''}`}><div className="result-stars">✦ ✷ ✦</div><Mascot mood={won ? 'celebrate' : 'laugh'}/><p className="kicker">{won ? 'RUN COMPLETE' : 'RUN TERMINATED'}</p><h2>{won ? 'YOU WON.' : 'SKILL ISSUE.'}</h2><p className="result-shout">{won ? 'YOU FOUND THE WAY.' : result.detail}</p><div className="result-score"><span><b>{game.title}</b> GAME</span><span><b>{result.score}</b> SCORE</span><span><b>{Math.max(1, Math.round((result.endedAt - result.startedAt) / 1000))}S</b> TIME</span></div>{won ? <><p className="rewards-offline">REWARD SYSTEM COMING ONLINE<br/><small>No wallet or claim is collected in this build.</small></p><button className="secondary-button" onClick={onRetry}>PLAY AGAIN <Arrow direction="retry"/></button></> : <><button className="arcade-button button--pink" onClick={onRetry}>TRY AGAIN <Arrow direction="retry"/></button><button className="secondary-button" onClick={onLeave}><Arrow direction="left"/> BACK TO ARCADE</button></>}</div>
}

const GameComponent = ({ id, ...props }: ActiveGameProps & { id: GameId }) => {
  if (id === 'snake') return <SnakeGame {...props}/>
  if (id === 'flap') return <FlapGame {...props}/>
  if (id === 'tetris') return <TetrisGame {...props}/>
  if (id === 'cross') return <CrossGame {...props}/>
  if (id === 'pong') return <PongGame {...props}/>
  return <TicTacToeGame {...props}/>
}

function GameSession({ game, seed, paused, setHud, onDone }: { game: GameMeta; seed: number; paused: boolean; setHud: (text: string) => void; onDone: (result: GameResult) => void }) {
  const finish = useRun(game.id, seed, onDone)
  return <GameComponent id={game.id} key={`${game.id}-${seed}`} seed={seed} paused={paused} setHud={setHud} onFinish={finish}/>
}

function GamePage({ id }: { id: string }) {
  const game = getGame(id); const [started, setStarted] = useState(false); const [paused, setPaused] = useState(false); const [hud, setHud] = useState(game.target); const [seed, setSeed] = useState(newRunSeed); const [result, setResult] = useState<GameResult | null>(null)
  useEffect(() => { setStarted(false); setPaused(false); setHud(game.target); setSeed(newRunSeed()); setResult(null) }, [game.id])
  const begin = () => { audio.play('start'); setStarted(true); setPaused(false); setResult(null) }
  const done = (run: GameResult) => { setResult(run); setPaused(true) }
  return <main className={`play-page play-page--${game.className} page-enter`}><div className="play-top"><button className="back-button" onClick={() => go('/')}><Arrow direction="left"/> <span>ARCADE</span></button><div className="cabinet-title"><p>{game.eyebrow}</p><h1>{game.title}</h1></div><div className="hud-readout"><b>{hud}</b><span>PLAY FAIR. PROVE IT.</span></div><button className="pause-button" onClick={() => setPaused(value => !value)} disabled={!started || !!result}>{paused && !result ? 'RESUME' : 'PAUSE'}</button></div><section className="game-cabinet cabinet-enter"><div className="cabinet-top"><div className="status-light"/><span>{started ? 'LIVE RUN · ANTI-WIN ENGINE ARMED' : 'INSERT COURAGE'}</span><span className="cabinet-controls">{game.controls}</span></div><div className={`game-area game-area--${game.className}`}><div className="game-area-art" aria-hidden="true"><GameArt game={game.id} large/></div><div className="game-area-content">{!started && <GameIntro game={game} onStart={begin}/>} {started && !result && <GameSession game={game} seed={seed} paused={paused} setHud={setHud} onDone={done}/>}</div><PauseCover paused={paused && !result}/>{result && <ResultScreen result={result} game={game} onRetry={begin} onLeave={() => go('/')}/>}</div><div className="cabinet-bottom"><span>NOWIN SYSTEMS © 2026</span><span>PLAY FAIR. PROVE IT.</span></div></section></main>
}

export default function App() {
  const [route, setRoute] = useState(routeOf); const [muted, setMuted] = useState(audio.muted)
  useEffect(() => { const listener = () => setRoute(routeOf()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const page = useMemo(() => route.startsWith('/play/') ? <GamePage id={route.split('/')[2] || 'snake'}/> : route === '/about' ? <AboutPage/> : <Lobby/>, [route])
  return <><Header route={route} muted={muted} onSound={() => { setMuted(audio.toggle()); audio.play('click') }}/>{page}<footer><span>NOWIN // GAMES YOU KNOW. WINS YOU DON&apos;T.</span><span>NO WALLET REQUIRED TO PLAY.</span></footer></>
}
