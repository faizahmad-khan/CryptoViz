'use client'

import type { StepAnnotation } from '../../lib/utils/stepAnnotations'

interface BookmarkedStepItem extends StepAnnotation {
  stepIndex: number
}

interface BookmarkedStepsProps {
  steps: BookmarkedStepItem[]
  currentStep: number
  onOpenStep: (stepIndex: number) => void
  onClearAll: () => void
}

export default function BookmarkedSteps({
  steps,
  currentStep,
  onOpenStep,
  onClearAll,
}: BookmarkedStepsProps) {
  if (steps.length === 0) return null

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Bookmarked steps
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Jump directly to locally bookmarked parts of this trace.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Clear all notes
        </button>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.stepId}>
            <button
              type="button"
              onClick={() => onOpenStep(step.stepIndex)}
              aria-current={currentStep === step.stepIndex ? 'step' : undefined}
              className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                currentStep === step.stepIndex
                  ? 'border-amber-400 bg-white dark:border-amber-700 dark:bg-zinc-900'
                  : 'border-amber-200 bg-amber-50 hover:bg-white dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:bg-zinc-900'
              }`}
            >
              <span className="block text-xs font-bold text-zinc-900 dark:text-white">
                Step {step.stepIndex + 1}: {step.stepLabel}
              </span>
              {step.note && (
                <span className="mt-1 block line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {step.note}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
