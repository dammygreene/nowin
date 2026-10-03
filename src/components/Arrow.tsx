type Direction = 'up' | 'down' | 'left' | 'right' | 'retry'

/** A single consistent, chunky vector arrow used for cabinet controls and CTAs. */
export function Arrow({ direction = 'right', className = '' }: { direction?: Direction; className?: string }) {
  const rotation: Record<Direction, number> = { right: 0, down: 90, left: 180, up: -90, retry: 0 }
  if (direction === 'retry') return <svg className={`arrow-icon arrow-icon--retry ${className}`} viewBox="0 0 32 32" aria-hidden="true"><path d="M25.5 12A10.5 10.5 0 1 0 26 20"/><path d="m22 5 5 7-8 1"/></svg>
  return <svg className={`arrow-icon ${className}`} viewBox="0 0 32 32" style={{ transform: `rotate(${rotation[direction]}deg)` }} aria-hidden="true"><path d="M4 16h21M18 7l9 9-9 9"/></svg>
}
