import type { FirethornPetVisualState } from '../shared.ts'

export type { FirethornPetVisualState }

/** Query parameter used to force one visual state during manual testing. */
export const PET_VISUAL_STATE_QUERY = 'firethorn-pet-state'
/** Window event used by the host UI to preview or later connect a visual state. */
export const PET_VISUAL_STATE_EVENT = 'dsh:firethorn-pet-state'

/**
 * Parse an external visual-state value.
 * @param value - untrusted query or CustomEvent detail.
 * @returns a supported visual state, or undefined for an unknown value.
 */
export function parsePetVisualState(value: unknown): FirethornPetVisualState | undefined {
  if (value === 'default' || value === 'hover' || value === 'working' || value === 'exhausted') return value
  return undefined
}

/**
 * Read an optional manual visual-state override from the current page URL.
 * @param location - browser location carrying the query string.
 * @returns the requested state, or undefined when no valid override is present.
 */
export function visualStateFromLocation(location: Pick<Location, 'search'>): FirethornPetVisualState | undefined {
  return parsePetVisualState(new URLSearchParams(location.search).get(PET_VISUAL_STATE_QUERY))
}
