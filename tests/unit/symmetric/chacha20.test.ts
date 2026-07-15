import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/chacha20'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('ChaCha20 Unit Tests', () => {
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

  it('throws INVALID_KEY_LENGTH for a key that is not 64 hex characters', () => {
    expect(() => encrypt('hi', 'aabb|000000000000004a00000000')).toThrowError(CipherError)
  })

  it('throws INVALID_KEY_LENGTH for a nonce that is not 24 hex characters', () => {
    const key = '00'.repeat(32)
    expect(() => encrypt('hi', `${key}|aabb`)).toThrowError(CipherError)
  })

  it('throws INVALID_KEY when no nonce is supplied', () => {
    const key = '00'.repeat(32)
    expect(() => encrypt('hi', key)).toThrowError(CipherError)
  })

  it('encrypt and decrypt are the same XOR operation (round-trip)', () => {
    const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f|000000000000004a00000000:5'
    const enc = encrypt('The quick brown fox jumps over the lazy dog', key)
    const dec = decrypt(enc.output, key)
    expect(dec.output).toBe('The quick brown fox jumps over the lazy dog')
  })

  it('round-trips correctly across multi-block inputs and varying counters (fuzz)', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 300 }), fc.nat({ max: 1000 }), (text: string, counter: number) => {
        const keyHex = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
        const nonceHex = '000000000000004a00000000'
        const key = `${keyHex}|${nonceHex}:${counter}`
        const enc = encrypt(text, key)
        const dec = decrypt(enc.output, key)
        expect(dec.output).toBe(text)
      }),
      { numRuns: 200 }
    )
  })

  it('changing the counter changes the keystream (different ciphertext for same plaintext)', () => {
    const keyHex = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'
    const nonceHex = '000000000000004a00000000'
    const a = encrypt('same plaintext', `${keyHex}|${nonceHex}:0`)
    const b = encrypt('same plaintext', `${keyHex}|${nonceHex}:1`)
    expect(a.output).not.toBe(b.output)
  })

  it('generates initial-state and add-state milestone steps per block in instrumented mode', () => {
    const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f|000000000000004a00000000:0'
    const result = encrypt('short text', key, { instrument: true })
    expect(result.steps.some((s) => s.label.includes('initial state'))).toBe(true)
    expect(result.steps.some((s) => s.label.includes('keystream ready'))).toBe(true)
  })
})
