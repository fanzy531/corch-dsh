/**
 * Firethorn pet Host half: serves the package-owned mascot asset while the
 * browser half owns all presentation and interaction state.
 * @module @deepseek-ai/dsh-client-ui-firethorn-pet
 */

import { readFileSync } from 'node:fs'
import type { ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { parseDeepSeekBalanceResponse } from './account.ts'
import {
  FIRETHORN_PET_ACCOUNT_URL, FIRETHORN_PET_ASSET_URLS, FIRETHORN_PET_SETTINGS_NAMESPACE,
  type FirethornPetVisualState,
} from './shared.ts'

const ASSET_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../assets')
const MASCOT_ASSETS: ReadonlyArray<readonly [FirethornPetVisualState, string, string]> = [
  ['default', FIRETHORN_PET_ASSET_URLS.default, resolve(ASSET_ROOT, 'firethorn-pet.png')],
  ['hover', FIRETHORN_PET_ASSET_URLS.hover, resolve(ASSET_ROOT, 'firethorn-pet-hover.png')],
  ['working', FIRETHORN_PET_ASSET_URLS.working, resolve(ASSET_ROOT, 'firethorn-pet-working.png')],
  ['exhausted', FIRETHORN_PET_ASSET_URLS.exhausted, resolve(ASSET_ROOT, 'firethorn-pet-exhausted.png')],
]
const DEEPSEEK_BALANCE_URL = 'https://api.deepseek.com/user/balance'
const DEEPSEEK_API_KEY = credentialRef('DEEPSEEK_API_KEY')

/** Host configuration for the firethorn pet's browser visibility. */
export interface Config {
  /** Whether the floating pet is shown when the client starts. */
  enabled: boolean
}

/** Schema for the firethorn pet settings namespace. */
export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true),
})

/** Settings namespace registered by this plugin. */
export const SETTINGS_NAMESPACE = settingsNamespace(FIRETHORN_PET_SETTINGS_NAMESPACE)

/** Cordis plugin name. */
export const name = 'client-ui-firethorn-pet'
/** Host services required to expose assets and resolve the upstream API key. */
export const inject = ['webServer', 'credentials']

function respondJson(res: ServerResponse, status: number, value: unknown): void {
  const body = Buffer.from(JSON.stringify(value))
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': String(body.length),
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(body)
}

/**
 * Register the mascot asset route for the browser plugin.
 * @param ctx - Host context carrying the Web route registry.
 */
export function apply(ctx: Context, config: Config): void {
  installSettingsSection(ctx, SETTINGS_NAMESPACE, Config, config, {
    setSource: () => {},
    onChange: () => {},
  })
  for (const [state, path, assetPath] of MASCOT_ASSETS) {
    const mascot = readFileSync(assetPath)
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path,
      handler: (_req, res) => {
        res.writeHead(200, {
          'Cache-Control': 'no-cache',
          'Content-Length': String(mascot.length),
          'Content-Type': 'image/png',
        })
        res.end(mascot)
      },
    }), `firethorn-pet: ${state} mascot route`)
  }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: FIRETHORN_PET_ACCOUNT_URL,
    handler: async (_req, res) => {
      const resolved = await ctx.credentials.resolve(DEEPSEEK_API_KEY)
      if (resolved === undefined) {
        respondJson(res, 200, { ok: false, code: 'NO_KEY', error: 'DEEPSEEK_API_KEY is not configured' })
        return
      }
      try {
        const response = await fetch(DEEPSEEK_BALANCE_URL, {
          headers: { Authorization: `Bearer ${resolved.value}` },
          signal: AbortSignal.timeout(20_000),
        })
        if (!response.ok) {
          respondJson(res, 200, { ok: false, code: 'UPSTREAM', error: 'DeepSeek balance service unavailable' })
          return
        }
        const values = parseDeepSeekBalanceResponse(await response.json() as unknown)
        if (values === undefined) {
          respondJson(res, 200, { ok: false, code: 'PARSE', error: 'DeepSeek balance response was not recognized' })
          return
        }
        respondJson(res, 200, { ok: true, ...values, updatedAt: new Date().toISOString() })
      } catch {
        respondJson(res, 200, { ok: false, code: 'UPSTREAM', error: 'DeepSeek balance service unavailable' })
      }
    },
  }), 'firethorn-pet: account route')
}
