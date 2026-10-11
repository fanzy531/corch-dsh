import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dshHome = resolve(process.env.DSH_HOME ?? resolve(repoRoot, '.local-dsh'))
const profileDir = resolve(dshHome, 'profiles', 'web')
const pluginDir = resolve(repoRoot, 'packages/client/ui-polus-teaching-reform')
const patchPath = resolve(repoRoot, 'patches/dsh-better-sidebar@0.17.1.patch')

mkdirSync(resolve(profileDir, 'patches'), { recursive: true })
for (const filename of ['cordis.yml', 'cordis.patch.yml']) {
  copyFileSync(resolve(repoRoot, 'profiles/teaching-reform-web', filename), resolve(profileDir, filename))
}
copyFileSync(patchPath, resolve(profileDir, 'patches/dsh-better-sidebar@0.17.1.patch'))

// The generated profile is local and untracked. An absolute link is deliberate:
// it remains correct when DSH_HOME lives outside the checkout, while the
// committed repository never contains a machine-specific path.
const linkTarget = pluginDir
writeFileSync(resolve(profileDir, 'pnpm-workspace.yaml'), `packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\nallowBuilds:\n  node-pty: true\n\npatchedDependencies:\n  dsh-better-sidebar@0.17.1: patches/dsh-better-sidebar@0.17.1.patch\n`)
writeFileSync(resolve(profileDir, 'package.json'), `${JSON.stringify({
  name: 'dsh-profile-web-teaching-reform',
  private: true,
  dependencies: {
    '@polus-ai/dsh-client-ui-teaching-reform': `link:${linkTarget}`,
    'dsh-better-sidebar': '0.17.1',
  },
  dsh: {
    profile: {
      bundles: [
        '@deepseek-ai/dsh-base',
        '@deepseek-ai/dsh-web-app',
        '@polus-ai/dsh-client-ui-teaching-reform',
        'dsh-better-sidebar',
      ],
      patchReload: 'live',
    },
  },
}, null, 2)}\n`)

const result = spawnSync('pnpm', ['install', '--no-frozen-lockfile', '--ignore-scripts'], {
  cwd: profileDir,
  stdio: 'inherit',
})
if (result.status !== 0) process.exit(result.status ?? 1)
console.log(`Teaching reform profile is ready: ${profileDir}`)
console.log(`Start with: DSH_HOME="${dshHome}" pnpm dsh web --no-open`)
