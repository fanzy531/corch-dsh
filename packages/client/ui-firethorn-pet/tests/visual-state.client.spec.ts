import { describe, expect, it } from 'vitest'
import {
  parsePetVisualState, PET_VISUAL_STATE_QUERY, visualStateFromLocation,
} from '../src/client/visual-state.ts'

describe('firethorn pet visual state', () => {
  it('accepts only supported visual states', () => {
    expect(parsePetVisualState('working')).toBe('working')
    expect(parsePetVisualState('exhausted')).toBe('exhausted')
    expect(parsePetVisualState('unknown')).toBeUndefined()
    expect(parsePetVisualState(undefined)).toBeUndefined()
  })

  it('reads a manual state from the page query', () => {
    expect(visualStateFromLocation({ search: `?${PET_VISUAL_STATE_QUERY}=working` })).toBe('working')
    expect(visualStateFromLocation({ search: '?firethorn-pet-state=exhausted' })).toBe('exhausted')
    expect(visualStateFromLocation({ search: '?firethorn-pet-state=invalid' })).toBeUndefined()
  })
})
