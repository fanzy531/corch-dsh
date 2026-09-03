import { describe, expect, it } from 'vitest'
import { parseDeepSeekBalanceResponse, parseFirethornPetAccountResponse } from '../src/account.ts'

describe('firethorn pet account payloads', () => {
  it('selects the CNY balance and preserves an optional points value', () => {
    expect(parseDeepSeekBalanceResponse({
      balance_infos: [
        { currency: 'USD', total_balance: '9' },
        { currency: 'CNY', total_balance: 18.25, points: 42 },
      ],
    })).toEqual({ balance: 18.25, currency: 'CNY', points: 42 })
  })

  it('does not invent points when the upstream balance response has none', () => {
    expect(parseDeepSeekBalanceResponse({ balance_infos: [{ currency: 'CNY', total_balance: 18.25 }] }))
      .toEqual({ balance: 18.25, currency: 'CNY', points: null })
  })

  it('rejects malformed browser responses and accepts structured errors', () => {
    expect(parseFirethornPetAccountResponse({ ok: true, balance: '18', currency: 'CNY' })).toBeUndefined()
    expect(parseFirethornPetAccountResponse({ ok: false, code: 'NO_KEY', error: 'missing' }))
      .toEqual({ ok: false, code: 'NO_KEY', error: 'missing' })
  })
})
