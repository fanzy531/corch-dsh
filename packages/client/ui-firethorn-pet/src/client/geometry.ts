/** Dock edge used to keep the pet reachable across viewport changes. */
export type DockSide = 'left' | 'right' | 'top' | 'bottom'

/** Persisted browser preference for the floating pet. */
export interface PetState {
  /** Viewport edge carrying the pet. */
  side: DockSide
  /** Unit offset along that edge. */
  offset: number
}

/** Viewport dimensions used by the pure docking geometry. */
export interface PetViewport {
  /** CSS pixel width. */
  width: number
  /** CSS pixel height. */
  height: number
}

/** Square occupied by the mascot. */
export const BASE_SIZE = 144
/** Gap retained between the mascot and its dock edge. */
export const EDGE_GAP = 12

/** Default bottom-right placement for a new browser profile. */
export const DEFAULT_STATE: Readonly<PetState> = Object.freeze({ side: 'right', offset: 1 })

/**
 * Clamp one finite value into an inclusive range.
 * @param value - finite value to clamp.
 * @param minimum - inclusive lower bound.
 * @param maximum - inclusive upper bound.
 * @returns the bounded value.
 */
export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

/**
 * Resolve one dock preference to a fixed-position top-left coordinate.
 * @param state - dock side and unit offset.
 * @param viewport - current viewport dimensions.
 * @returns pixel position and rendered square size.
 */
export function positionForDock(
  state: PetState,
  viewport: PetViewport,
): { left: number; top: number; size: number } {
  const size = BASE_SIZE
  const maxLeft = Math.max(EDGE_GAP, viewport.width - size - EDGE_GAP)
  const maxTop = Math.max(EDGE_GAP, viewport.height - size - EDGE_GAP)
  if (state.side === 'left' || state.side === 'right') {
    return {
      left: state.side === 'left' ? EDGE_GAP : maxLeft,
      top: EDGE_GAP + clamp(state.offset, 0, 1) * (maxTop - EDGE_GAP),
      size,
    }
  }
  return {
    left: EDGE_GAP + clamp(state.offset, 0, 1) * (maxLeft - EDGE_GAP),
    top: state.side === 'top' ? EDGE_GAP : maxTop,
    size,
  }
}

/**
 * Select the nearest viewport edge for a released mascot.
 * @param left - released top-left x coordinate.
 * @param top - released top-left y coordinate.
 * @param size - rendered mascot square size.
 * @param viewport - current viewport dimensions.
 * @returns dock side and normalized offset along it.
 */
export function nearestDock(
  left: number,
  top: number,
  size: number,
  viewport: PetViewport,
): Pick<PetState, 'side' | 'offset'> {
  const distances: Record<DockSide, number> = {
    left: Math.abs(left - EDGE_GAP),
    right: Math.abs(viewport.width - EDGE_GAP - (left + size)),
    top: Math.abs(top - EDGE_GAP),
    bottom: Math.abs(viewport.height - EDGE_GAP - (top + size)),
  }
  const side = (Object.keys(distances) as DockSide[])
    .reduce((best, candidate) => distances[candidate] < distances[best] ? candidate : best)
  const span = side === 'left' || side === 'right'
    ? Math.max(1, viewport.height - size - EDGE_GAP * 2)
    : Math.max(1, viewport.width - size - EDGE_GAP * 2)
  const offset = side === 'left' || side === 'right'
    ? (top - EDGE_GAP) / span
    : (left - EDGE_GAP) / span
  return { side, offset: clamp(offset, 0, 1) }
}
