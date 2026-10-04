import { useEffect, useMemo, useState } from 'react'
import './styles/index.css'
import './styles/rebuild.css'
import { Arrow } from './components/Arrow'
import { ClaimPanel } from './components/ClaimPanel'
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
  return <header className="topbar"><button className="wordmark" onClick={() => go('/')} aria-label="COPECADE home"><span>COPE</span>CADE<i>™</i></button><nav><button className={route === '/' ? 'active' : ''} onClick={() => go('/')}>PLAY</button><button className={route === '/about' ? 'active' : ''} onClick={() => go('/about')}>HOW IT WORKS</button></nav><button className={`sound-toggle ${muted ? '' : 'sound-toggle--on'}`} onClick={onSound} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button></header>
}

function GameCard({ game, index }: { game: GameMeta; index: number }) {
  const play = () => go(`/play/${game.id}`)
  const moods: Record<GameId, 'idle' | 'taunt' | 'laugh' | 'angry' | 'smug' | 'happy'> = { snake: 'taunt', flap: 'happy', tetris: 'angry', cross: 'laugh', pong: 'smug', tictactoe: 'taunt' }
  return <article className={`game-card game-card--${game.className} card-offset-${index % 3}`} style={{ '--card-color': game.color, '--card-accent': game.accent } as React.CSSProperties} onClick={play} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); play() } }} role="button" tabIndex={0} aria-label={`Play ${game.title}: ${game.tagline}`}><div className="poster-pin">{game.eyebrow === 'SOLO' ? 'SOLO' : 'VS COPECADE'}</div><GameArt game={game.id}/><Mascot mood={moods[game.id]} className={`card-mascot card-mascot--${game.id}`}/><div className="game-card__copy"><p className="card-index">0{index + 1}</p><h3>{game.title}</h3><p>{game.tagline}</p></div><div className="game-card__footer"><span>{game.target}</span><button className="cabinet-play" onClick={event => { event.stopPropagation(); play() }} aria-label={`Play ${game.title}`}>PLAY <Arrow/></button></div></article>
}

function Lobby() {
  return <main className="lobby page-enter"><section className="hero"><div className="hero-copy"><p className="kicker"><span/> THE ARCADE HATES YOU <span/></p><p className="hero-logo"><span>COPE</span>CADE</p><h1><span>GAMES YOU</span><em>KNOW.</em><span>WINS YOU</span><strong>DON&apos;T.</strong></h1><p className="hero-sub">Someone has to win. It probably won&apos;t be you.</p><div className="hero-actions"><button className="arcade-button button--pink" onClick={() => go('/play/snake')}>PLAY NOW <Arrow /></button><button className="secondary-button" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>PICK A CABINET <Arrow direction="down"/></button></div></div><div className="hero-art"><div className="burst">SKILL<br/>ISSUE</div><div className="hero-speech">someone<br/>has to win.</div><Mascot mood="taunt"/><i className="hero-star star-1">✦</i><i className="hero-star star-2">✷</i><i className="hero-star star-3">✦</i><div className="floor-shadow"/></div></section><section className="arcade-heading" id="games"><div><p className="kicker">PICK YOUR PROBLEM</p><h2>THE <span>ARCADE</span></h2></div><p>Six perfectly normal games.<br/><b>Probably.</b></p></section><section className="game-grid">{GAMES.map((game, index) => <GameCard game={game} index={index} key={game.id}/>)}</section><section className="bottom-cta"><Mascot mood="laugh"/><div><p className="kicker">THE FINE PRINT</p><h2>THE GAMES ARE FAIR.<br/><span className="brand-inline"><b>COPE</b>CADE</span> ISN&apos;T NICE.</h2></div><button className="arcade-button button--lime" onClick={() => go('/about')}>HOW IT WORKS</button></section></main>
}

function AboutPage() {
  return <main className="info-page page-enter"><section className="info-hero"><Mascot mood="smug"/><div><p className="kicker">SIX GAMES. ONE PROBLEM.</p><h1>HOW COPECADE WORKS</h1><p>Every cabinet has a deterministic tell. Lose once, learn it, then make the arcade regret underestimating you.</p></div></section><section className="rules-grid"><article><b>01</b><h2>PLAY FREE.</h2><p>No wallet. No token. No boost. The cabinet starts when you press READY.</p></article><article><b>02</b><h2>GET BETRAYED.</h2><p>Every twist is authored and learnable. The game can deceive you. It cannot secretly roll your loss.</p></article><article><b>03</b><h2>BEAT COPECADE.</h2><p>Rewards are reviewed manually. Rankings and daily competitions remain unavailable until a server-side verifier exists.</p></article></section><button className="arcade-button button--pink" onClick={() => go('/')}>BACK TO ARCADE</button></main>
}

function ResultScreen({ result, game, attemptNumber, onRetry, onLeave }: { result: GameResult; game: GameMeta; attemptNumber: number; onRetry: () => void; onLeave: () => void }) {
  const won = result.result === 'won'
  useEffect(() => { audio.play(won ? 'win' : 'fail') }, [won])
  return <div className={`result-screen ${won ? 'result-screen--win' : ''}`}><div className="result-stars">✦ ✷ ✦</div><Mascot mood={won ? 'celebrate' : 'laugh'}/><p className="kicker">{won ? 'RUN COMPLETE' : 'RUN TERMINATED'}</p><h2>{won ? 'YOU WON.' : 'SKILL ISSUE.'}</h2><p className="result-shout">{won ? 'YOU ARE IN THE 1%.' : result.detail}</p><div className="result-score"><span><b>{game.title}</b> GAME</span><span><b>{result.score}</b> SCORE</span><span><b>{Math.max(1, Math.round((result.endedAt - result.startedAt) / 1000))}S</b> TIME</span></div>{won ? <><ClaimPanel result={result} attemptNumber={attemptNumber}/><button className="secondary-button" onClick={onRetry}>PLAY AGAIN <Arrow direction="retry"/></button></> : <><button className="arcade-button button--pink" onClick={onRetry}>TRY AGAIN <Arrow direction="retry"/></button><button className="secondary-button" onClick={onLeave}><Arrow direction="left"/> BACK TO ARCADE</button></>}</div>
}

const GameComponent = ({ id, ...props }: ActiveGameProps & { id: GameId }) => {
  if (id === 'snake') return <SnakeGame {...props}/>
  if (id === 'flap') return <FlapGame {...props}/>
  if (id === 'tetris') return <TetrisGame {...props}/>
  if (id === 'cross') return <CrossGame {...props}/>
  if (id === 'pong') return <PongGame {...props}/>
  return <TicTacToeGame {...props}/>
}

function GameSession({ game, seed, paused, setHud, onDone, onSessionStart, autoStart }: { game: GameMeta; seed: number; paused: boolean; setHud: (text: string) => void; onDone: (result: GameResult) => void; onSessionStart?: () => void; autoStart?: boolean }) {
  const { finish, markStarted } = useRun(game.id, seed, onDone)
  const start = () => { markStarted(); onSessionStart?.() }
  return <GameComponent id={game.id} key={`${game.id}-${seed}`} seed={seed} paused={paused} setHud={setHud} onFinish={finish} onStart={onSessionStart ? start : undefined} autoStart={autoStart}/>
}

function GamePage({ id }: { id: string }) {
  const game = getGame(id)
  const isFlap = game.id === 'flap'
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [hud, setHud] = useState(game.target)
  const [seed, setSeed] = useState(newRunSeed)
  const [result, setResult] = useState<GameResult | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(0)
  const [autoStartFlap, setAutoStartFlap] = useState(false)

  useEffect(() => {
    setStarted(false)
    setPaused(false)
    setHud(game.target)
    setSeed(newRunSeed())
    setResult(null)
    setAttemptNumber(0)
    setAutoStartFlap(false)
  }, [game.id])

  const begin = () => {
    audio.play('start')
    setStarted(true)
    setPaused(false)
    setResult(null)
    setAttemptNumber(value => value + 1)
  }
  const beginFlapRun = () => {
    audio.play('start')
    setStarted(true)
    setPaused(false)
    setAutoStartFlap(false)
    setAttemptNumber(value => value + 1)
  }
  const retryFlap = () => {
    setSeed(newRunSeed())
    setStarted(false)
    setPaused(false)
    setResult(null)
    setAutoStartFlap(true)
  }
  const done = (run: GameResult) => { setResult(run); setPaused(true) }
  const sessionVisible = started || isFlap
  const cabinetStatus = started ? 'LIVE RUN · ANTI-WIN ENGINE ARMED' : isFlap ? 'READY · TAP TO FLAP' : 'INSERT COURAGE'

  return <main className={`play-page play-page--${game.className} page-enter`}><div className="play-top"><button className="back-button" onClick={() => go('/')}><Arrow direction="left"/> <span>ARCADE</span></button><div className="cabinet-title"><p>{game.eyebrow}</p><h1>{game.title}</h1></div><div className="hud-readout"><b>{hud}</b><span>PLAY FAIR. PROVE IT.</span></div><button className="pause-button" onClick={() => setPaused(value => !value)} disabled={!started || !!result}>{paused && !result ? 'RESUME' : 'PAUSE'}</button></div><section className="game-cabinet cabinet-enter"><div className="cabinet-top"><div className="status-light"/><span>{cabinetStatus}</span><span className="cabinet-controls">{game.controls}</span></div><div className={`game-area game-area--${game.className}`}><div className="game-area-art" aria-hidden="true"><GameArt game={game.id} large/></div><div className="game-area-content">{!started && !isFlap && <GameIntro game={game} onStart={begin}/>} {sessionVisible && !result && <GameSession game={game} seed={seed} paused={paused} setHud={setHud} onDone={done} onSessionStart={isFlap ? beginFlapRun : undefined} autoStart={isFlap ? autoStartFlap : undefined}/>}</div><PauseCover paused={paused && !result}/>{result && <ResultScreen result={result} game={game} attemptNumber={attemptNumber} onRetry={isFlap ? retryFlap : begin} onLeave={() => go('/')}/>}</div><div className="cabinet-bottom"><span>COPECADE SYSTEMS © 2026</span><span>PLAY FAIR. PROVE IT.</span></div></section></main>
}

export default function App() {
  const [route, setRoute] = useState(routeOf); const [muted, setMuted] = useState(audio.muted)
  useEffect(() => { const listener = () => setRoute(routeOf()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const page = useMemo(() => route.startsWith('/play/') ? <GamePage id={route.split('/')[2] || 'snake'}/> : route === '/about' ? <AboutPage/> : <Lobby/>, [route])
  return <><Header route={route} muted={muted} onSound={() => { setMuted(audio.toggle()); audio.play('click') }}/>{page}<footer><span>COPECADE // GAMES YOU KNOW. WINS YOU DON&apos;T.</span><span>NO WALLET REQUIRED TO PLAY.</span></footer></>
}
