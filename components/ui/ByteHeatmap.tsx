'use client'

/**
 * ByteHeatmap — a per-byte grid that highlights which bytes of an output
 * changed after a single-bit input flip. Changed bytes are tinted by how many
 * of their 8 bits differ, so the diffusion pattern is visible at a glance.
 *
 * Accessibility contract (GUIDELINES.md § ByteHeatmap):
 *   Every cell exposes
 *   `aria-label="Byte ${index}: ${hex} (${changed ? 'changed' : 'unchanged'})"`.
 *   The grid is keyboard-navigable with Tab + arrow keys (roving tabindex).
 */

import { useCallback, useRef, useState } from 'react'
import type { ByteCell } from '../../lib/utils/bitDiff'

interface ByteHeatmapProps {
  bytes: ByteCell[]
  /** Grid columns; defaults to 8 for a compact square-ish layout. */
  columns?: number
  /** Accessible name for the whole grid. */
  label?: string
}

/** Tailwind background classes keyed by how many bits changed in a byte. */
function cellTone(cell: ByteCell): string {
  if (!cell.changed) {
    return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-500'
  }
  // More changed bits → hotter colour.
  if (cell.changedBits >= 6) {
    return 'bg-red-600 text-white dark:bg-red-500'
  }
  if (cell.changedBits >= 4) {
    return 'bg-orange-500 text-white dark:bg-orange-500'
  }
  if (cell.changedBits >= 2) {
    return 'bg-amber-400 text-amber-950 dark:bg-amber-400 dark:text-amber-950'
  }
  return 'bg-amber-200 text-amber-900 dark:bg-amber-300/80 dark:text-amber-950'
}

export default function ByteHeatmap({
  bytes,
  columns = 8,
  label = 'Output byte diff heatmap',
}: ByteHeatmapProps) {
  const [focusIndex, setFocusIndex] = useState(0)
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])

  const focusCell = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(bytes.length - 1, index))
    setFocusIndex(clamped)
    cellRefs.current[clamped]?.focus()
  }, [bytes.length])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          focusCell(index + 1)
          break
        case 'ArrowLeft':
          event.preventDefault()
          focusCell(index - 1)
          break
        case 'ArrowDown':
          event.preventDefault()
          focusCell(index + columns)
          break
        case 'ArrowUp':
          event.preventDefault()
          focusCell(index - columns)
          break
        case 'Home':
          event.preventDefault()
          focusCell(0)
          break
        case 'End':
          event.preventDefault()
          focusCell(bytes.length - 1)
          break
        default:
          break
      }
    },
    [columns, focusCell, bytes.length],
  )

  if (bytes.length === 0) {
    return null
  }

  return (
    <div
      role="grid"
      aria-label={label}
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {bytes.map((cell, index) => (
        <div
          key={cell.index}
          ref={(node) => {
            cellRefs.current[index] = node
          }}
          role="gridcell"
          tabIndex={index === focusIndex ? 0 : -1}
          aria-label={`Byte ${cell.index}: ${cell.hex} (${cell.changed ? 'changed' : 'unchanged'})`}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onFocus={() => setFocusIndex(index)}
          className={`flex aspect-square items-center justify-center rounded-md font-mono text-[11px] font-semibold tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-950 ${cellTone(cell)}`}
        >
          {cell.hex}
        </div>
      ))}
    </div>
  )
}
