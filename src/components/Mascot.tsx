import mascot from '../assets/mascot/nowin.svg'

export function Mascot({ mood = 'smug', className = '' }: { mood?: 'smug' | 'shock' | 'laugh' | 'idle'; className?: string }) {
  return <div className={`mascot mascot--${mood} ${className}`} aria-label="NOWIN mascot"><img src={mascot} alt="" /></div>
}
