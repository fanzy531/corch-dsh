import { describe, expect, it } from 'vitest'
import * as FirethornPetClient from '../src/client/index.ts'

describe('firethorn pet client entry', () => {
  it('keeps the loader-facing service injections on the client module', () => {
    expect('default' in FirethornPetClient).toBe(false)
    expect(FirethornPetClient.inject).toEqual(['sessions', 'slots', 'locale', 'settingsScope'])
    expect(typeof FirethornPetClient.apply).toBe('function')
  })
})
