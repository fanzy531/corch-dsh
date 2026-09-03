/** Invariant companion for the CLAB Creator host tool. */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-tool-clab-creator'

/** Cordis companion plugin name. */
export const name = 'tool-clab-creator-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']
/** No additional cross-event invariant is needed for the demo snapshot event. */
const install: InvariantInstaller = () => {}
/** Register the companion invariant. */
export const apply = (ctx: Context): Promise<() => void> => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
