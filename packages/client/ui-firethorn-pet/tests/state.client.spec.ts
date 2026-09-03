import { describe, expect, it } from 'vitest'
import { DEFAULT_STATE } from '../src/client/geometry.ts'
import { parsePetState, readPetState, writePetState } from '../src/client/state.ts'

describe('firethorn pet browser state', () => {
  it('accepts a valid record and clamps the dock offset', () => {
    expect(parsePetState('{"side":"left","offset":2,"unused":99}')).toEqual({
      side: 'left', offset: 1,
    })
    expect(parsePetState('{"side":"top","offset":-1}')).toEqual({
      side: 'top', offset: 0,
    })
  })

  it.each([
    null,
    'null',
    '[]',
    '{"side":"diagonal","offset":0}',
    '{"side":1,"offset":0}',
    '{"side":"right","offset":"0"}',
    '{"side":"right","offset":null}',
    '{',
  ])('falls back atomically for %j', (raw) => {
    expect(parsePetState(raw)).toEqual(DEFAULT_STATE)
  })

  it('contains storage read and write failures', () => {
    const stored: string[] = []
    const storage = {
      getItem: () => '{"side":"bottom","offset":0.25,"unused":1.2}',
      setItem: (_key: string, value: string) => { stored.push(value) },
    } as unknown as Storage
    expect(readPetState(storage)).toEqual({ side: 'bottom', offset: 0.25 })
    writePetState(storage, { side: 'bottom', offset: 0.25 })
    expect(JSON.parse(stored[0]!)).toEqual({ side: 'bottom', offset: 0.25 })

    const denied = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
    } as unknown as Storage
    expect(readPetState(denied)).toEqual(DEFAULT_STATE)
    expect(() => { writePetState(denied, { ...DEFAULT_STATE }) }).not.toThrow()
    expect(readPetState(undefined)).toEqual(DEFAULT_STATE)
    expect(() => { writePetState(undefined, { ...DEFAULT_STATE }) }).not.toThrow()
  })
})
