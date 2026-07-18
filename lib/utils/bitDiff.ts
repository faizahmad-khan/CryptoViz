/**
 * Bit-diff helpers for the avalanche-effect visualizer.
 *
 * Pure, dependency-free utilities for measuring how far two byte strings
 * diverge at the bit level — the Hamming distance and the percentage of bits
 * that changed. A good cryptographic primitive should turn a single-bit input
 * change into roughly a 50% output change, so these numbers are the core of
 * the diffusion story the UI tells.
 */

/** A single byte in the diff grid, ready to render in the heatmap. */
export interface ByteCell {
  /** Zero-based byte index. */
  index: number
  /** Two-character hex value of this byte in the (modified) output. */
  hex: string
  /** Whether any bit in this byte differs between the two outputs. */
  changed: boolean
  /** Number of bits (0–8) that differ in this byte. */
  changedBits: number
}

/** Summary statistics for a full avalanche diff. */
export interface BitDiffStats {
  /** Total bits compared (based on the longer output). */
  totalBits: number
  /** Number of bits that differ (the Hamming distance). */
  changedBits: number
  /** Percentage of bits that changed, 0–100. Ideal ≈ 50. */
  percentChanged: number
}

const HEX_RE = /^[0-9a-fA-F]*$/

/**
 * Parse a hex string into bytes. Ignores surrounding whitespace and is
 * case-insensitive. Throws on odd length or non-hex characters so callers
 * fail loudly rather than silently mis-measuring.
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim()
  if (clean.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters')
  }
  if (!HEX_RE.test(clean)) {
    throw new Error('Hex string contains non-hexadecimal characters')
  }
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Count the set bits (population count) of a byte value 0–255. */
export function popcount(byte: number): number {
  let value = byte & 0xff
  let count = 0
  while (value) {
    value &= value - 1
    count++
  }
  return count
}

/**
 * Hamming distance between two byte arrays: the number of differing bits.
 * If the arrays differ in length, every bit of each extra trailing byte counts
 * as a difference.
 */
export function hammingDistanceBytes(a: Uint8Array, b: Uint8Array): number {
  const max = Math.max(a.length, b.length)
  let distance = 0
  for (let i = 0; i < max; i++) {
    const byteA = i < a.length ? a[i] : 0
    const byteB = i < b.length ? b[i] : 0
    distance += popcount(byteA ^ byteB)
  }
  return distance
}

/** Hamming distance between two hex strings. */
export function hammingDistanceHex(hexA: string, hexB: string): number {
  return hammingDistanceBytes(hexToBytes(hexA), hexToBytes(hexB))
}

/**
 * Percentage of changed bits, clamped to 0–100. Returns 0 when there are no
 * bits to compare so the meter never shows NaN.
 */
export function percentChanged(changedBits: number, totalBits: number): number {
  if (totalBits <= 0) return 0
  return (changedBits / totalBits) * 100
}

/**
 * Build the per-byte grid for the heatmap. The `hex` of each cell comes from
 * the modified output (`hexB`) — that's the value the user sees as the "new"
 * digest — while `changed` reflects any bit difference against the original.
 */
export function computeByteCells(hexA: string, hexB: string): ByteCell[] {
  const bytesA = hexToBytes(hexA)
  const bytesB = hexToBytes(hexB)
  const max = Math.max(bytesA.length, bytesB.length)
  const cells: ByteCell[] = []
  for (let i = 0; i < max; i++) {
    const byteA = i < bytesA.length ? bytesA[i] : 0
    const byteB = i < bytesB.length ? bytesB[i] : 0
    const changedBits = popcount(byteA ^ byteB)
    cells.push({
      index: i,
      hex: byteB.toString(16).padStart(2, '0'),
      changed: changedBits > 0,
      changedBits,
    })
  }
  return cells
}

/** Compute the headline avalanche statistics from two hex outputs. */
export function diffStats(hexA: string, hexB: string): BitDiffStats {
  const bytesA = hexToBytes(hexA)
  const bytesB = hexToBytes(hexB)
  const totalBits = Math.max(bytesA.length, bytesB.length) * 8
  const changedBits = hammingDistanceBytes(bytesA, bytesB)
  return {
    totalBits,
    changedBits,
    percentChanged: percentChanged(changedBits, totalBits),
  }
}

/**
 * Return a copy of `input` with a single bit flipped in the character at
 * `charIndex`. `bitIndex` (0 = least-significant) selects the bit within that
 * character's code unit. For ASCII text this is exactly a per-byte bit flip —
 * the essence of the avalanche demonstration.
 */
export function flipInputBit(
  input: string,
  charIndex: number,
  bitIndex: number,
): string {
  if (charIndex < 0 || charIndex >= input.length) {
    throw new Error('charIndex is out of range')
  }
  if (bitIndex < 0 || bitIndex > 15) {
    throw new Error('bitIndex must be between 0 and 15')
  }
  const code = input.charCodeAt(charIndex)
  const flipped = code ^ (1 << bitIndex)
  return input.slice(0, charIndex) + String.fromCharCode(flipped) + input.slice(charIndex + 1)
}
