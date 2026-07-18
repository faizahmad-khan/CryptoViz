/**
 * Frequency Analysis Attack against classical substitution/shift ciphers.
 * Demonstrates why Caesar, ROT13, and monoalphabetic substitution ciphers
 * are trivially breakable from ciphertext alone: English letter frequencies
 * survive a 1:1 substitution, so matching the ciphertext's letter histogram
 * against the known English frequency table recovers the shift (or full
 * substitution key) without brute force.
 * @see CIPHER_ENGINE.md "Attack simulators" conventions
 */

import { CipherError } from '../utils/errors'

export interface FrequencyAnalysisStep {
  label: string
  detail: string
}

export interface CaesarBreakResult {
  bestShift: number
  chiSquaredByShift: { shift: number; chiSquared: number }[]
  decryptedGuess: string
  steps: FrequencyAnalysisStep[]
}

/** Standard English letter frequency table (percent), NIST/Cornell corpus-derived, A–Z. */
export const ENGLISH_FREQUENCIES: Record<string, number> = {
  A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1, I: 7.0,
  J: 0.15, K: 0.77, L: 4.0, M: 2.4, N: 6.7, O: 7.5, P: 1.9, Q: 0.095, R: 6.0,
  S: 6.3, T: 9.1, U: 2.8, V: 0.98, W: 2.4, X: 0.15, Y: 2.0, Z: 0.074,
}

function letterCounts(text: string): number[] {
  const counts = new Array(26).fill(0)
  for (const ch of text.toUpperCase()) {
    const code = ch.charCodeAt(0) - 65
    if (code >= 0 && code < 26) counts[code]++
  }
  return counts
}

function shiftChar(ch: string, shift: number): string {
  const code = ch.charCodeAt(0)
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65)
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97)
  }
  return ch
}

function decryptCaesar(ciphertext: string, shift: number): string {
  return Array.from(ciphertext).map((ch) => shiftChar(ch, shift)).join('')
}

/** Pearson's chi-squared statistic between observed letter counts and the expected English distribution. Lower = more English-like. */
function chiSquared(observedCounts: number[], totalLetters: number): number {
  let sum = 0
  const letters = Object.keys(ENGLISH_FREQUENCIES)
  for (let i = 0; i < 26; i++) {
    const expected = (ENGLISH_FREQUENCIES[letters[i]] / 100) * totalLetters
    if (expected === 0) continue
    const diff = observedCounts[i] - expected
    sum += (diff * diff) / expected
  }
  return sum
}

/**
 * Breaks a Caesar/ROT-N cipher purely from ciphertext, by trying all 26
 * shifts and scoring each candidate plaintext's letter distribution against
 * standard English frequencies. No key is required as input.
 */
export function breakCaesarByFrequency(ciphertext: string, onStep?: (step: FrequencyAnalysisStep) => void): CaesarBreakResult {
  const letters = ciphertext.replace(/[^a-zA-Z]/g, '')
  if (letters.length === 0) {
    throw new CipherError('INPUT_REQUIRED', 'Ciphertext must contain at least one alphabetic character.')
  }
  if (letters.length < 20) {
    throw new CipherError(
      'INVALID_INPUT',
      `Ciphertext has only ${letters.length} letters — frequency analysis is unreliable below ~20 letters. Provide a longer sample.`
    )
  }

  const steps: FrequencyAnalysisStep[] = []
  const emit = (s: FrequencyAnalysisStep) => { steps.push(s); onStep?.(s) }

  emit({
    label: 'Build ciphertext histogram',
    detail: `Counted ${letters.length} letters in the ciphertext, ignoring case, spaces, and punctuation.`,
  })

  const chiSquaredByShift: { shift: number; chiSquared: number }[] = []
  for (let shift = 0; shift < 26; shift++) {
    const candidate = decryptCaesar(letters, shift)
    const counts = letterCounts(candidate)
    const score = chiSquared(counts, letters.length)
    chiSquaredByShift.push({ shift, chiSquared: score })
  }

  emit({
    label: 'Score all 26 shifts',
    detail: 'Decrypted the ciphertext under every possible shift and computed a chi-squared distance between each candidate\'s letter distribution and standard English — the true shift produces by far the lowest score.',
  })

  chiSquaredByShift.sort((a, b) => a.chiSquared - b.chiSquared)
  const bestShift = chiSquaredByShift[0].shift

  emit({
    label: 'Lowest chi-squared score selected',
    detail: `Shift ${bestShift} scored ${chiSquaredByShift[0].chiSquared.toFixed(2)}, the lowest of all 26 candidates — no brute-force key guessing or dictionary needed.`,
  })

  return {
    bestShift,
    chiSquaredByShift: chiSquaredByShift.sort((a, b) => a.shift - b.shift),
    decryptedGuess: decryptCaesar(ciphertext, bestShift),
    steps,
  }
}
