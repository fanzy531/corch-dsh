import { DEFAULT_STATE, clamp, type DockSide, type PetState } from './geometry.ts'

/** Local browser key for the pet's placement. */
export const PET_STATE_KEY = 'dsh.firethorn-pet.v1'

const SIDES = new Set<DockSide>(['left', 'right', 'top', 'bottom'])

/**
 * Parse the stored placement record, falling back atomically on malformed data.
 * @param raw - localStorage value or null.
 * @returns validated state with a bounded offset.
 */
export function parsePetState(raw: string | null): PetState {
  if (raw === null) return { ...DEFAULT_STATE }
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return { ...DEFAULT_STATE }
    const record = value as Record<string, unknown>
    if (typeof record.side !== 'string' || !SIDES.has(record.side as DockSide)) return { ...DEFAULT_STATE }
    if (typeof record.offset !== 'number' || !Number.isFinite(record.offset)) return { ...DEFAULT_STATE }
    return {
      side: record.side as DockSide,
      offset: clamp(record.offset, 0, 1),
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

/**
 * Read placement without making unavailable browser storage fatal to the UI.
 * @param storage - browser storage, or undefined when the browser denies it.
 * @returns validated state or the default.
 */
export function readPetState(storage: Storage | undefined): PetState {
  if (storage === undefined) return { ...DEFAULT_STATE }
  try {
    return parsePetState(storage.getItem(PET_STATE_KEY))
  } catch {
    return { ...DEFAULT_STATE }
  }
}

/**
 * Persist one validated state; storage refusal leaves the live widget usable.
 * @param storage - browser storage, or undefined when the browser denies it.
 * @param state - current dock preference.
 */
export function writePetState(storage: Storage | undefined, state: PetState): void {
  if (storage === undefined) return
  try {
    storage.setItem(PET_STATE_KEY, JSON.stringify(state))
  } catch {
    // Browser storage can be unavailable in private or policy-restricted contexts; placement remains in memory.
  }
}
