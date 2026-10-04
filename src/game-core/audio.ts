export type Sound = 'click' | 'start' | 'fail' | 'win' | 'blip'
class ArcadeAudio {
  muted = true
  private ctx?: AudioContext
  toggle() { this.muted = !this.muted; return this.muted }
  play(sound: Sound) {
    if (this.muted) return
    this.ctx ??= new AudioContext()
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain()
    const notes: Record<Sound, [number, number, number]> = { click: [260, .04, .06], start: [540, .09, .1], fail: [120, .15, .12], win: [740, .2, .13], blip: [390, .04, .04] }
    const [freq, duration, volume] = notes[sound]; osc.frequency.value = freq; osc.type = sound === 'fail' ? 'sawtooth' : 'square'; gain.gain.value = volume
    osc.connect(gain).connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + duration)
  }
}
export const audio = new ArcadeAudio()
