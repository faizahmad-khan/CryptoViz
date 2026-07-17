import { describe, it, expect } from 'vitest'
import { doubleDesEncrypt, meetInTheMiddleAttack } from '@/lib/attacks/meetInTheMiddle'

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16)
  return out
}

describe('meetInTheMiddleAttack', () => {
  it('recovers a key pair from a single known plaintext/ciphertext pair (12-bit reduced keyspace)', () => {
    const plaintext = hexToBytes('0123456789abcdef')
    const keyA = hexToBytes('0000000000000ab3') // low 12 bits = 0xab3
    const keyB = hexToBytes('0000000000000c7e') // low 12 bits = 0xc7e
    const ciphertext = doubleDesEncrypt(plaintext, keyA, keyB)

    const result = meetInTheMiddleAttack(plaintext, ciphertext, 12)

    // The recovered keys must re-encrypt the plaintext to the same ciphertext
    // (there can be multiple colliding key pairs in a reduced keyspace, so we
    // verify functional equivalence rather than exact key equality).
    const recovered = doubleDesEncrypt(
      plaintext,
      hexToBytes(result.foundKeyAHex),
      hexToBytes(result.foundKeyBHex)
    )
    expect(Buffer.from(recovered).toString('hex')).toBe(Buffer.from(ciphertext).toString('hex'))
    expect(result.attemptsUntilMatch).toBeGreaterThan(0)
    expect(result.attemptsUntilMatch).toBeLessThanOrEqual(result.keyASearchSpace)
    expect(result.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('rejects block sizes other than 8 bytes', () => {
    expect(() =>
      meetInTheMiddleAttack(new Uint8Array(4), new Uint8Array(8), 8)
    ).toThrowError(/8 bytes/)
  })

  it('rejects out-of-range keySpaceBits', () => {
    expect(() =>
      meetInTheMiddleAttack(new Uint8Array(8), new Uint8Array(8), 30)
    ).toThrowError(/between 4 and 24/)
  })
})
