import mascotFront from '../assets/mascot/nowin-mascot.png'
import mascotThreeQuarter from '../assets/mascot/nowin-three-quarter-ui.webp'
import mascotBack from '../assets/mascot/nowin-back-ui.webp'

type Mood = 'idle' | 'happy' | 'taunt' | 'laugh' | 'shock' | 'angry' | 'defeated' | 'celebrate' | 'smug'
const pose: Record<Mood, string> = { idle: mascotFront, happy: mascotThreeQuarter, taunt: mascotThreeQuarter, laugh: mascotThreeQuarter, shock: mascotFront, angry: mascotFront, defeated: mascotBack, celebrate: mascotThreeQuarter, smug: mascotFront }
export function Mascot({ mood = 'smug', className = '' }: { mood?: Mood; className?: string }) {
  return <div className={`mascot mascot--${mood} ${className}`} aria-label={`COPECADE mascot: ${mood}`}><img src={pose[mood]} alt="" /></div>
}
