/** Package-owned invariant companion for the creator workbench. */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-clab-creator'

/** Cordis companion plugin name. */
export const name = 'client-ui-clab-creator-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** The demo owns only a log-only event and UI registrations; no extra invariant is needed yet. */
const install: InvariantInstaller = () => {}

/** Register the companion invariant. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
