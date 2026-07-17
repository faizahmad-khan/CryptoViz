import { describe, it, expect } from 'vitest'
import { breakCaesarByFrequency, ENGLISH_FREQUENCIES } from '@/lib/attacks/frequencyAnalysis'

function caesarEncrypt(text: string, shift: number): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26) + 65)
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26) + 97)
      return ch
    })
    .join('')
}

const SAMPLE_ENGLISH =
  'The quick brown fox jumps over the lazy dog while the sun sets slowly behind the distant mountains ' +
  'and every creature in the forest prepares for the long quiet night that always follows a warm summer day'

describe('breakCaesarByFrequency', () => {
  it('recovers the correct shift for every possible Caesar key on a long English sample', () => {
    for (let shift = 1; shift < 26; shift++) {
      const ciphertext = caesarEncrypt(SAMPLE_ENGLISH, shift)
      const result = breakCaesarByFrequency(ciphertext)
      expect(result.bestShift).toBe(shift)
      expect(result.decryptedGuess.toLowerCase()).toContain('quick brown fox')
    }
  })

  it('returns a chi-squared score for all 26 shifts, sorted by shift', () => {
    const result = breakCaesarByFrequency(caesarEncrypt(SAMPLE_ENGLISH, 7))
    expect(result.chiSquaredByShift).toHaveLength(26)
    expect(result.chiSquaredByShift.map((s) => s.shift)).toEqual(
      Array.from({ length: 26 }, (_, i) => i)
    )
  })

  it('throws INPUT_REQUIRED for non-alphabetic input', () => {
    expect(() => breakCaesarByFrequency('12345 !!! ???')).toThrowError(/at least one alphabetic/)
  })

  it('throws for ciphertext shorter than the reliable analysis threshold', () => {
    expect(() => breakCaesarByFrequency('short text')).toThrowError(/frequency analysis is unreliable/)
  })

  it('exports a 26-letter English frequency table summing to ~100%', () => {
    const total = Object.values(ENGLISH_FREQUENCIES).reduce((a, b) => a + b, 0)
    expect(Object.keys(ENGLISH_FREQUENCIES)).toHaveLength(26)
    expect(total).toBeGreaterThan(95)
    expect(total).toBeLessThan(105)
  })
})
