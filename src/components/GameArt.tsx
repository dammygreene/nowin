import type { GameId } from '../game-core/types'

/** Hand-built poster scenes; each keeps the title safe in the lower panel. */
export function GameArt({ game, large = false }: { game: GameId; large?: boolean }) {
  const cls = `game-art game-art--${game}${large ? ' game-art--large' : ''}`
  if (game === 'snake') return <div className={cls}><i className="art-grid"/><b className="snake-body">●●●</b><b className="snake-eye">● ●</b><span className="apple">✦</span><span className="art-label">NOM</span></div>
  if (game === 'flap') return <div className={cls}><i className="cloud cloud-a"/><i className="cloud cloud-b"/><b className="bird">●</b><i className="pipe pipe-a"/><i className="pipe pipe-b"/><span className="flap-crown">♛</span></div>
  if (game === 'tetris') return <div className={cls}><i className="block-stack"/><b className="block b-one"/><b className="block b-two"/><b className="block b-three">!</b><span className="tetris-spark">✦</span></div>
  if (game === 'cross') return <div className={cls}><i className="road"/><b className="tiny-car car-a">▰</b><b className="tiny-car car-b">▰</b><b className="cross-person">●</b><span className="traffic-light">●</span></div>
  if (game === 'pong') return <div className={cls}><i className="pong-line"/><b className="paddle p-left"/><b className="paddle p-right"/><b className="pong-ball"/></div>
  return <div className={cls}><i className="ttt-grid"/><b className="ttt-nought">○</b><b className="cross-mark">×</b><span className="ttt-burst">!</span></div>
}
