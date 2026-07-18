import { describe, it, expect } from 'vitest'
import {
  hexToBytes,
  popcount,
  hammingDistanceBytes,
  hammingDistanceHex,
  percentChanged,
  computeByteCells,
  diffStats,
  flipInputBit,
} from '../../lib/utils/bitDiff'

describe('hexToBytes', () => {
  it('parses a hex string into bytes', () => {
    expect(Array.from(hexToBytes('00ff10'))).toEqual([0, 255, 16])
  })

  it('is case-insensitive and trims whitespace', () => {
    expect(Array.from(hexToBytes('  DeadBEEF '))).toEqual([0xde, 0xad, 0xbe, 0xef])
  })

  it('returns an empty array for an empty string', () => {
    expect(hexToBytes('').length).toBe(0)
  })

  it('throws on odd length', () => {
    expect(() => hexToBytes('abc')).toThrow()
  })

  it('throws on non-hex characters', () => {
    expect(() => hexToBytes('zz')).toThrow()
  })
})

describe('popcount', () => {
  it('counts set bits', () => {
    expect(popcount(0x00)).toBe(0)
    expect(popcount(0xff)).toBe(8)
    expect(popcount(0b1010)).toBe(2)
  })

  it('masks to a single byte', () => {
    expect(popcount(0x1ff)).toBe(8)
  })
})

describe('hammingDistanceBytes', () => {
  it('is zero for identical arrays', () => {
    const a = new Uint8Array([1, 2, 3])
    expect(hammingDistanceBytes(a, a)).toBe(0)
  })

  it('counts differing bits', () => {
    // 0x00 vs 0xff -> 8 bits, 0x0f vs 0x00 -> 4 bits
    const a = new Uint8Array([0x00, 0x0f])
    const b = new Uint8Array([0xff, 0x00])
    expect(hammingDistanceBytes(a, b)).toBe(12)
  })

  it('treats extra trailing bytes as fully changed', () => {
    const a = new Uint8Array([0x00])
    const b = new Uint8Array([0x00, 0xff])
    expect(hammingDistanceBytes(a, b)).toBe(8)
  })
})

describe('hammingDistanceHex', () => {
  it('measures the distance between two hex strings', () => {
    expect(hammingDistanceHex('00', 'ff')).toBe(8)
    expect(hammingDistanceHex('ffff', 'ffff')).toBe(0)
  })
})

describe('percentChanged', () => {
  it('computes a percentage', () => {
    expect(percentChanged(4, 8)).toBe(50)
    expect(percentChanged(8, 8)).toBe(100)
  })

  it('returns 0 when there is nothing to compare', () => {
    expect(percentChanged(0, 0)).toBe(0)
  })
})

describe('computeByteCells', () => {
  it('flags changed bytes and reports per-byte bit counts', () => {
    const cells = computeByteCells('000f', 'ff00')
    expect(cells).toHaveLength(2)

    expect(cells[0].index).toBe(0)
    expect(cells[0].hex).toBe('ff')
    expect(cells[0].changed).toBe(true)
    expect(cells[0].changedBits).toBe(8)

    expect(cells[1].hex).toBe('00')
    expect(cells[1].changed).toBe(true)
    expect(cells[1].changedBits).toBe(4)
  })

  it('marks unchanged bytes', () => {
    const cells = computeByteCells('ab', 'ab')
    expect(cells[0].changed).toBe(false)
    expect(cells[0].changedBits).toBe(0)
    expect(cells[0].hex).toBe('ab')
  })
})

describe('diffStats', () => {
  it('summarises total, changed, and percentage', () => {
    const stats = diffStats('00', 'ff')
    expect(stats.totalBits).toBe(8)
    expect(stats.changedBits).toBe(8)
    expect(stats.percentChanged).toBe(100)
  })

  it('reports ~50% when half the bits change', () => {
    const stats = diffStats('0f0f', '000f')
    expect(stats.totalBits).toBe(16)
    expect(stats.changedBits).toBe(4)
    expect(stats.percentChanged).toBe(25)
  })
})

describe('flipInputBit', () => {
  it('flips a single bit in the chosen character', () => {
    // 'A' = 0x41 = 0b01000001; flipping bit 0 -> 0b01000000 = '@'
    expect(flipInputBit('A', 0, 0)).toBe('@')
  })

  it('only changes one character and leaves the rest intact', () => {
    const out = flipInputBit('ABC', 1, 1)
    expect(out[0]).toBe('A')
    expect(out[2]).toBe('C')
    expect(out[1]).not.toBe('B')
    expect(out).toHaveLength(3)
  })

  it('is reversible — flipping the same bit twice restores the input', () => {
    const once = flipInputBit('hello', 2, 3)
    expect(flipInputBit(once, 2, 3)).toBe('hello')
  })

  it('changes exactly one bit', () => {
    const before = 'x'.charCodeAt(0)
    const after = flipInputBit('x', 0, 5).charCodeAt(0)
    expect(popcount(before ^ after)).toBe(1)
  })

  it('throws when the character index is out of range', () => {
    expect(() => flipInputBit('ab', 5, 0)).toThrow()
    expect(() => flipInputBit('', 0, 0)).toThrow()
  })

  it('throws when the bit index is out of range', () => {
    expect(() => flipInputBit('ab', 0, 16)).toThrow()
    expect(() => flipInputBit('ab', 0, -1)).toThrow()
  })
})
