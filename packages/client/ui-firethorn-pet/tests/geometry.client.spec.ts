import { describe, expect, it } from 'vitest'
import {
  BASE_SIZE, DEFAULT_STATE, EDGE_GAP, nearestDock, positionForDock,
} from '../src/client/geometry.ts'

const viewport = { width: 800, height: 600 }

describe('firethorn pet docking geometry', () => {
  it('resolves every dock side and clamps offsets', () => {
    expect(positionForDock({ side: 'left', offset: -1 }, viewport)).toEqual({
      left: EDGE_GAP,
      top: EDGE_GAP,
      size: BASE_SIZE,
    })
    expect(positionForDock({ side: 'right', offset: 2 }, viewport)).toEqual({
      left: 800 - BASE_SIZE - EDGE_GAP,
      top: 600 - BASE_SIZE - EDGE_GAP,
      size: BASE_SIZE,
    })
    expect(positionForDock({ side: 'top', offset: 0.5 }, viewport)).toEqual({
      left: 328,
      top: EDGE_GAP,
      size: BASE_SIZE,
    })
    expect(positionForDock({ side: 'bottom', offset: 0.5 }, viewport)).toEqual({
      left: 328,
      top: 600 - BASE_SIZE - EDGE_GAP,
      size: BASE_SIZE,
    })
    expect(positionForDock(DEFAULT_STATE, { width: 100, height: 100 })).toEqual({
      left: EDGE_GAP,
      top: EDGE_GAP,
      size: BASE_SIZE,
    })
  })

  it('selects the nearest edge with a bounded offset', () => {
    expect(nearestDock(10, 250, BASE_SIZE, viewport)).toMatchObject({ side: 'left' })
    expect(nearestDock(10, 250, BASE_SIZE, viewport).offset).toBeCloseTo(238 / 432)
    expect(nearestDock(650, 250, BASE_SIZE, viewport)).toMatchObject({ side: 'right' })
    expect(nearestDock(650, 250, BASE_SIZE, viewport).offset).toBeCloseTo(238 / 432)
    expect(nearestDock(300, 8, BASE_SIZE, viewport)).toMatchObject({ side: 'top' })
    expect(nearestDock(300, 8, BASE_SIZE, viewport).offset).toBeCloseTo(288 / 632)
    expect(nearestDock(300, 455, BASE_SIZE, viewport)).toMatchObject({ side: 'bottom' })
    expect(nearestDock(300, 455, BASE_SIZE, viewport).offset).toBeCloseTo(288 / 632)
    expect(nearestDock(-500, 0, 900, { width: 100, height: 100 })).toEqual({ side: 'top', offset: 0 })
  })
})
