import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { SettingsProvider, type SettingsNamespace, installSettingsSection } from '@deepseek-ai/dsh-settings'
import { Config, SETTINGS_NAMESPACE } from '../src/index.ts'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('firethorn pet Host settings', () => {
  it('exposes a live firethorn-pet namespace with the visibility default', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const changes = vi.fn()
    installSettingsSection(ctx, SETTINGS_NAMESPACE, Config, { enabled: true }, {
      setSource: () => {},
      onChange: changes,
    })
    await vi.waitFor(() => {
      expect(ctx.settings.get(SETTINGS_NAMESPACE)).toEqual({ enabled: true })
    })
    expect(ctx.settings.describe().find(row => row.ns === SETTINGS_NAMESPACE)?.applies).toBe('live')
    await ctx.settings.update(SETTINGS_NAMESPACE, { enabled: false })
    await vi.waitFor(() => { expect(changes).toHaveBeenCalled() })
    expect(ctx.settings.get(SETTINGS_NAMESPACE)).toEqual({ enabled: false })
    await ctx.fiber.dispose()
  })
})
