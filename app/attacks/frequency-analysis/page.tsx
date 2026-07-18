import FrequencyAnalysisSimulator from "@/components/attacks/FrequencyAnalysisSimulator";

export const metadata = {
  title: "Frequency Analysis Attack Simulator (Caesar Cipher) — CryptoViz",
  description:
    "Break a Caesar-shifted ciphertext with no key guessing: score all 26 shifts against standard English letter frequencies and recover the plaintext by statistics alone.",
};

export default function FrequencyAnalysisAttackPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-white">
        Frequency Analysis Attack Simulator
      </h1>
      <p className="mb-6 max-w-2xl text-slate-600 dark:text-zinc-400">
        A 1:1 substitution cipher — Caesar, ROT-N, monoalphabetic substitution — never changes how often each letter
        appears, only which symbol represents it. Comparing a ciphertext&apos;s letter histogram against known
        English frequencies (chi-squared distance) recovers the key from ciphertext alone, with no brute-force key
        guessing. This is the classical attack that makes these ciphers unsafe for anything beyond education.
      </p>
      <FrequencyAnalysisSimulator />
    </main>
  );
}
