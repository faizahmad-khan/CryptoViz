import MeetInTheMiddleSimulator from "@/components/attacks/MeetInTheMiddleSimulator";

export const metadata = {
  title: "Meet-in-the-Middle Attack Simulator (Double-DES) — CryptoViz",
  description:
    "See why chaining two DES keys only buys ~57 bits of security instead of 112: recover both keys from one known plaintext/ciphertext pair using a meet-in-the-middle search.",
};

export default function MeetInTheMiddleAttackPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-white">
        Meet-in-the-Middle Attack Simulator
      </h1>
      <p className="mb-6 max-w-2xl text-slate-600 dark:text-zinc-400">
        Double encryption <code>C = E_k2(E_k1(P))</code> looks like it should need 2^112 work to break — but an
        attacker with one known plaintext/ciphertext pair can build a lookup table from one direction and search from
        the other, meeting in the middle for roughly <code>2×2^n</code> work instead of <code>2^(2n)</code>. This is
        exactly why 3DES uses three keys, not two. The demo below runs the real algorithm over a reduced keyspace so
        it finishes in your browser.
      </p>
      <MeetInTheMiddleSimulator />
    </main>
  );
}
