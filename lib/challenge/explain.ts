import type { ChallengeDifficulty } from './generator'

export interface WrongAnswerExplanation {
  title: string
  details: string[]
}

interface ExplainArgs {
  cipherId: string
  difficulty: ChallengeDifficulty
}

/**
 * Per-cipher hints shown after an incorrect Challenge Mode answer, to turn a
 * wrong guess into a learning moment. Any cipher not listed here falls back to
 * the generic explanation below, so this is safe for the full registry.
 */
const CIPHER_HINTS: Record<string, string[]> = {
  caesar: [
    'Caesar shifts every letter by a fixed amount — make sure you shifted the right way (encrypt moves forward through the alphabet, decrypt moves back).',
    'Only letters are shifted; digits, spaces and punctuation pass through unchanged.',
    'The alphabet wraps around: after Z you come back to A (arithmetic mod 26).',
  ],
  rot13: [
    'ROT13 is just Caesar with a fixed shift of 13, so encrypting and decrypting are the same operation.',
    'Applying ROT13 twice returns the original text — a handy way to sanity-check your answer.',
  ],
  atbash: [
    'Atbash mirrors the alphabet: A↔Z, B↔Y, C↔X … so it is its own inverse.',
    'Map each letter to (25 − index) and leave non-letters alone.',
  ],
  vigenere: [
    'Vigenère uses a repeating keyword, so each position can shift by a different amount — line the key up under the text and shift letter by letter.',
    'Non-letters are normally skipped and do not consume a key character; double-check your key alignment after any spaces or punctuation.',
  ],
  affine: [
    'Affine encryption is E(x) = (a·x + b) mod 26; decryption needs the modular inverse of a, not just subtraction.',
    '`a` must be coprime with 26 for the cipher to be reversible.',
  ],
  railfence: [
    'Rail Fence writes the text in a zig-zag across N rails, then reads row by row — recount your rails and the up/down direction.',
    'For decryption the trick is to work out how many characters land on each rail first, then refill the zig-zag.',
  ],
  playfair: [
    'Playfair works on letter pairs using a 5×5 key square — remember the same-row (shift right), same-column (shift down) and rectangle rules.',
    'I/J share a cell, and doubled letters in a pair are split with a filler (usually X).',
  ],
  xor: [
    'XOR is symmetric: the same key turns plaintext into ciphertext and back. Check that you XORed against the correct (repeating) key bytes.',
    'It helps to work in hex/bytes rather than characters so byte alignment is obvious.',
  ],
  base64: [
    'Base64 is an encoding, not encryption — every 3 bytes map to 4 characters from the A–Z a–z 0–9 + / alphabet.',
    'Watch the `=` padding at the end; it signals how many bytes the final group really held.',
  ],
  morse: [
    'Morse maps each character to dots and dashes — mind the separators: one space between letters, a longer gap (often `/`) between words.',
  ],
}

const DIFFICULTY_NOTE: Record<ChallengeDifficulty, string> = {
  easy: 'This was an easy one — re-read the cipher’s core rule and try again, you’re close.',
  medium: 'Medium challenges add a longer key or message, so a small alignment slip changes everything downstream. Recheck step by step.',
  hard: 'Hard challenges are unforgiving about edge cases (wrap-around, padding, key repetition). Work through it slowly and verify each block.',
}

const GENERIC_HINTS: string[] = [
  'Walk back through the cipher one step at a time and confirm each transformation matches its definition.',
  'A common slip is direction — encrypting when the challenge asked you to decrypt (or vice-versa).',
  'Double-check how non-alphabetic characters, casing and any key/IV are meant to be handled.',
]

/**
 * Build a friendly, educational explanation for why a Challenge Mode answer was
 * wrong, tailored to the cipher and difficulty. Pure and deterministic.
 */
export function getWrongAnswerExplanation({ cipherId, difficulty }: ExplainArgs): WrongAnswerExplanation {
  const cipherHints = CIPHER_HINTS[cipherId] ?? GENERIC_HINTS
  const details = [...cipherHints, DIFFICULTY_NOTE[difficulty]]

  return {
    title: 'Not quite — here’s what to look at',
    details,
  }
}
