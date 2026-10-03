import type { GameId } from '../game-core/types'

/** Original vector-like game poster art. Shapes are deliberately different per cabinet. */
export function GameArt({ game, large = false }: { game: GameId; large?: boolean }) {
  const cls = `game-art game-art--${game}${large ? ' game-art--large' : ''}`
  if (game === 'snake') return <div className={cls}><i className="art-grid"/><b className="snake-body">●●●</b><b className="snake-eye">● ●</b><span className="apple">✦</span><span className="art-label">NOM</span></div>
  if (game === 'flap') return <div className={cls}><i className="cloud cloud-a"/><i className="cloud cloud-b"/><b className="bird">›●</b><i className="pipe pipe-a"/><i className="pipe pipe-b"/></div>
  if (game === 'merge') return <div className={cls}><b className="tile t-one">2</b><b className="tile t-two">4</b><b className="tile t-three">8</b><span className="merge-flash">+</span></div>
  if (game === 'mines') return <div className={cls}><i className="mine-grid"/><b className="mine-bomb">✹</b><b className="mine-flag">⚑</b></div>
  if (game === 'cross') return <div className={cls}><i className="road"/><b className="tiny-car car-a">▰</b><b className="tiny-car car-b">▰</b><b className="cross-person">●</b><span className="traffic-light">●</span></div>
  if (game === 'noughts') return <div className={cls}><i className="ttt-grid"/><b className="nought">○</b><b className="cross-mark">×</b></div>
  if (game === 'pong') return <div className={cls}><i className="pong-line"/><b className="paddle p-left"/><b className="paddle p-right"/><b className="pong-ball"/></div>
  return <div className={cls}><i className="connect-board"/>{[0,1,2,3,4,5].map(n => <b className={`connect-disc disc-${n}`} key={n}/>)}</div>
}
