/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-firethorn-pet`.
 * @module @deepseek-ai/dsh-client-ui-firethorn-pet/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-firethorn-pet'

/** Cordis companion plugin name. */
export const name = 'client-ui-firethorn-pet-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: Host state is one Web route owned by its effect, and
 * browser state is one DOM subtree whose disposer removes every listener.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
