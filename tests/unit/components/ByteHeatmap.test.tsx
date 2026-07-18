import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ByteHeatmap from '../../../components/ui/ByteHeatmap'
import { computeByteCells } from '../../../lib/utils/bitDiff'

const CELLS = computeByteCells('000f', 'ff0f')
// byte 0: 00 -> ff  (changed), byte 1: 0f -> 0f (unchanged)

describe('ByteHeatmap', () => {
  it('renders nothing when there are no bytes', () => {
    const { container } = render(<ByteHeatmap bytes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('exposes the grid with an accessible name', () => {
    render(<ByteHeatmap bytes={CELLS} label="Output byte diff heatmap" />)
    expect(
      screen.getByRole('grid', { name: 'Output byte diff heatmap' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(2)
  })

  it('labels each cell exactly per the GUIDELINES a11y contract', () => {
    render(<ByteHeatmap bytes={CELLS} />)
    // aria-label="Byte ${index}: ${hex} (${changed ? 'changed' : 'unchanged'})"
    expect(
      screen.getByLabelText('Byte 0: ff (changed)'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Byte 1: 0f (unchanged)'),
    ).toBeInTheDocument()
  })

  it('uses a roving tabindex so only one cell is tabbable', () => {
    render(<ByteHeatmap bytes={CELLS} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells[0]).toHaveAttribute('tabindex', '0')
    expect(cells[1]).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus with arrow keys', () => {
    render(<ByteHeatmap bytes={CELLS} columns={8} />)
    const cells = screen.getAllByRole('gridcell')
    act(() => cells[0].focus())
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' })
    expect(cells[1]).toHaveFocus()
  })

  it('does not move focus past the grid edges', () => {
    render(<ByteHeatmap bytes={CELLS} />)
    const cells = screen.getAllByRole('gridcell')
    act(() => cells[0].focus())
    fireEvent.keyDown(cells[0], { key: 'ArrowLeft' })
    expect(cells[0]).toHaveFocus()
  })
})
