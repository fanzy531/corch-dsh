/**
 * REAL-composition coverage: a test-only cordis.yml booted through the Loader
 * mounts the real Web server and firethorn package, then observes its PNG route
 * and route disposal over HTTP.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import LocalCredentialProvider from '@deepseek-ai/dsh-credentials-local'
import WebServer from '@deepseek-ai/dsh-host-webserver'
import InvariantRegistry from '@deepseek-ai/dsh-invariants'
import { FIRETHORN_PET_ACCOUNT_URL, FIRETHORN_PET_ASSET_URLS } from '../src/shared.ts'
import * as FirethornPet from '../src/index.ts'
import * as FirethornPetInvariant from '../src/invariant.ts'

const WEB_SERVER = '@deepseek-ai/dsh-host-webserver'
const CREDENTIALS = '@deepseek-ai/dsh-credentials-local'
const PET = '@deepseek-ai/dsh-client-ui-firethorn-pet'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

async function loadComposition(): Promise<Context> {
  root = await mkdtemp(join(tmpdir(), 'dsh-firethorn-pet-'))
  const configPath = join(root, 'cordis.yml')
  await writeFile(configPath, [
    `- name: '${CREDENTIALS}'`,
    '  config:',
    `    path: '${join(root, 'credentials.yaml')}'`,
    '    watch: false',
    `- name: '${WEB_SERVER}'`,
    '  config:',
    "    host: '127.0.0.1'",
    '    port: 0',
    `- name: '${PET}'`,
    '',
  ].join('\n'))
  context = new Context()
  context.baseUrl = pathToFileURL(root).href + '/'
  await context.plugin(Loader)
  context.loader.builtins.include = Include
  const modules = new Map<string, unknown>([
    [CREDENTIALS, LocalCredentialProvider],
    [WEB_SERVER, WebServer],
    [PET, FirethornPet],
  ])
  context.loader.internal = {
    version: 'v2',
    async import(specifier: string) {
      if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
      return modules.get(specifier)
    },
  } as unknown as NonNullable<typeof context.loader.internal>
  await context.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await context.loader.await()
  return context
}

describe('firethorn pet Host composition', () => {
  it('serves the packaged transparent PNG and removes the route with its fiber', async () => {
    const ctx = await loadComposition()
    const url = `http://127.0.0.1:${String(ctx.webServer.port)}${FIRETHORN_PET_ASSET_URLS.default}`
    const response = await fetch(url)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    const bytes = new Uint8Array(await response.arrayBuffer())
    expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    for (const path of Object.values(FIRETHORN_PET_ASSET_URLS)) {
      const stateResponse = await fetch(`http://127.0.0.1:${String(ctx.webServer.port)}${path}`)
      expect(stateResponse.status).toBe(200)
      expect(stateResponse.headers.get('content-type')).toBe('image/png')
    }
    const accountResponse = await fetch(`http://127.0.0.1:${String(ctx.webServer.port)}${FIRETHORN_PET_ACCOUNT_URL}`)
    expect(accountResponse.status).toBe(200)
    expect(accountResponse.headers.get('access-control-allow-origin')).toBeNull()

    const entry = [...ctx.loader.entries()].find(candidate => candidate.options.name === PET)!
    await entry.fiber!.dispose()
    for (const path of Object.values(FIRETHORN_PET_ASSET_URLS)) {
      expect((await fetch(`http://127.0.0.1:${String(ctx.webServer.port)}${path}`)).status).toBe(404)
    }
    expect((await fetch(`http://127.0.0.1:${String(ctx.webServer.port)}${FIRETHORN_PET_ACCOUNT_URL}`)).status).toBe(404)
  })

  it('registers its invariant companion under the package name', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantRegistry, { enabled: true })
    await expect(ctx.plugin(FirethornPetInvariant).await()).resolves.toBeDefined()
    await ctx.fiber.dispose()
  })
})
