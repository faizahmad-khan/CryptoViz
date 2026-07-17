'use client'

import { useState } from 'react'
import { breakCaesarByFrequency, type CaesarBreakResult } from '@/lib/attacks/frequencyAnalysis'

const DEFAULT_CIPHERTEXT =
  'Wkh txlfn eurzq ira mxpsv ryhu wkh odcb grj zkloh wkh vxq vhwv vorzob ehklqg wkh glvwdqw prxqwdlqv'

export default function FrequencyAnalysisSimulator() {
  const [ciphertext, setCiphertext] = useState(DEFAULT_CIPHERTEXT)
  const [result, setResult] = useState<CaesarBreakResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function runAttack() {
    setError(null)
    setResult(null)
    try {
      setResult(breakCaesarByFrequency(ciphertext))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const maxChi = result ? Math.max(...result.chiSquaredByShift.map((s) => s.chiSquared)) : 1

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Ciphertext only — no key provided
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Caesar-shifted text preserves English letter frequencies, just relabeled. Comparing the ciphertext&apos;s
          histogram against standard English frequencies recovers the shift without ever guessing a key.
        </p>
        <textarea
          className="mb-4 h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          value={ciphertext}
          onChange={(e) => setCiphertext(e.target.value)}
        />
        <button
          onClick={runAttack}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
          Break with frequency analysis
        </button>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {result && (
        <>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
              Chi-squared score by shift (lower = more English-like)
            </h2>
            <div className="space-y-1.5">
              {result.chiSquaredByShift.map(({ shift, chiSquared }) => (
                <div key={shift} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-zinc-500 dark:text-zinc-500">{shift}</span>
                  <div className="h-3 flex-1 rounded bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-3 rounded ${shift === result.bestShift ? 'bg-teal-500' : 'bg-zinc-400 dark:bg-zinc-600'}`}
                      style={{ width: `${Math.max(4, (chiSquared / maxChi) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs text-zinc-500 dark:text-zinc-500">
                    {chiSquared.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
              Recovered shift: {result.bestShift}
            </h2>
            <p className="break-words text-sm text-zinc-700 dark:text-zinc-300">{result.decryptedGuess}</p>
          </div>
        </>
      )}
    </div>
  )
}
