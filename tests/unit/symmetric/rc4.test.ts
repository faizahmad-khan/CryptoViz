import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/rc4'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('RC4 Unit Tests', () => {
  it('passes standard test vectors (encrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('passes standard test vectors (decrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const result = decrypt(vector.expected, vector.key)
      expect(result.output).toBe(vector.input)
    }
  })

  it('throws INPUT_REQUIRED for empty input', () => {
    expect(() => encrypt('', 'Key')).toThrowError(CipherError)
  })

  it('throws INVALID_KEY for empty key', () => {
    expect(() => encrypt('Plaintext', '')).toThrowError(CipherError)
  })

  it('throws INVALID_KEY for a key over 256 bytes', () => {
    const longKey = 'a'.repeat(257)
    expect(() => encrypt('Plaintext', longKey)).toThrowError(CipherError)
  })

  it('throws INVALID_INPUT when decrypting non-hex ciphertext', () => {
    expect(() => decrypt('not valid hex!!', 'Key')).toThrowError(CipherError)
  })

  it('generates a KSA milestone step plus one step per traced byte in instrumented mode', () => {
    const result = encrypt('Plaintext', 'Key', { instrument: true })
    // "Plaintext" is 9 bytes -> 1 KSA milestone + 9 PRGA byte steps (under the 48-byte trace cap)
    expect(result.steps.length).toBe(10)
    expect(result.steps[0].isMilestone).toBe(true)
  })

  it('property-based fuzzing: encrypt then decrypt returns the original plaintext', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), fc.string({ minLength: 1, maxLength: 64 }), (input, key) => {
        const enc = encrypt(input, key)
        const dec = decrypt(enc.output, key)
        expect(dec.output).toBe(input)
      }),
      { numRuns: 500 }
    )
  })
})
