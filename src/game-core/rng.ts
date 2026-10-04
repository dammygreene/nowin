/** A tiny reproducible RNG: same seed and action sequence, same board. */
export class SeededRng {
  private value: number
  constructor(seed: number) { this.value = seed >>> 0 || 0x6d2b79f5 }
  next() {
    let x = this.value += 0x6d2b79f5
    x = Math.imul(x ^ x >>> 15, x | 1)
    x ^= x + Math.imul(x ^ x >>> 7, x | 61)
    return ((x ^ x >>> 14) >>> 0) / 4294967296
  }
  int(max: number) { return Math.floor(this.next() * max) }
  pick<T>(items: T[]) { return items[this.int(items.length)] }
}
