/** Firethorn pet browser plugin: one reversible floating DOM widget. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import { FirethornPetSettingsCard } from './FirethornPetSettingsCard.tsx'
import { FirethornPetSettingsController, type FirethornPetSettings } from './firethorn-pet-settings-controller.ts'
import { en, zh } from './locales.ts'
import { mountFirethornPet } from './widget.ts'
import { firethornTaskNotice } from './task-notices.ts'
import type { FirethornTaskState } from './task-notices.ts'
import { FIRETHORN_PET_SETTINGS_NAMESPACE, FIRETHORN_PET_TASK_EVENT } from '../shared.ts'

export { mountFirethornPet } from './widget.ts'
export type { FirethornPetEnvironment, FirethornPetHandle } from './widget.ts'
export {
  FIRETHORN_PET_ACCOUNT_URL, FIRETHORN_PET_ASSET_URL, FIRETHORN_PET_ASSET_URLS,
  FIRETHORN_PET_SETTINGS_NAMESPACE,
} from '../shared.ts'
export {
  BASE_SIZE, DEFAULT_STATE, EDGE_GAP,
  nearestDock, positionForDock,
} from './geometry.ts'
export type { DockSide, PetState, PetViewport } from './geometry.ts'
export { parsePetState, PET_STATE_KEY, readPetState, writePetState } from './state.ts'
export {
  parsePetVisualState, PET_VISUAL_STATE_EVENT, PET_VISUAL_STATE_QUERY, visualStateFromLocation,
} from './visual-state.ts'
export type { FirethornPetVisualState } from './visual-state.ts'

/** Required client services: the runtime's current-session list. */
export const inject = ['sessions', 'slots', 'locale', 'settingsScope']

/**
 * Mount the pet into the browser document for this client fiber.
 * @param ctx - Client root context owning the widget lifecycle.
 */
export function apply(ctx: ClientContext): void {
  let storage: Storage | undefined
  try {
    storage = window.localStorage
  } catch {
    // Browser policy may deny localStorage; the widget remains usable for this page lifetime.
  }
  const settings = ctx.settingsScope.bind<FirethornPetSettings>({ namespace: FIRETHORN_PET_SETTINGS_NAMESPACE })
  const settingsCard = new FirethornPetSettingsController(settings)
  ctx.effect(() => () => { settingsCard.dispose() }, 'firethorn-pet: settings controller')
  ctx.effect(() => ctx.locale.register(FIRETHORN_LOCALE_NAMESPACE, { zh, en }), 'firethorn-pet: settings dictionaries')
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: FIRETHORN_PET_SETTINGS_NAMESPACE,
    locale: FIRETHORN_LOCALE_NAMESPACE,
    inject: () => settingsCard.inject(),
  }, FirethornPetSettingsCard))

  let pet: ReturnType<typeof mountFirethornPet> | undefined
  const syncVisibility = (): void => {
    pet?.setVisible(settings.getSnapshot().value?.enabled !== false)
  }
  ctx.effect(() => {
    const mounted = mountFirethornPet({
      document, window, storage,
      visible: settings.getSnapshot().value?.enabled !== false,
    })
    pet = mounted
    const disposeSettings = settings.subscribe(syncVisibility)
    return () => {
      disposeSettings()
      mounted()
      pet = undefined
    }
  }, 'firethorn-pet: browser widget')
  let previous: FirethornTaskState | undefined
  const observeTask = (): void => {
    const snapshot = ctx.sessions.list.getSnapshot()
    const id = snapshot.current
    const summary = id === undefined ? undefined : snapshot.byId[id]
    if (id === undefined || summary === undefined) {
      previous = undefined
      return
    }
    const next = { id, running: summary.running, displayTitle: summary.displayTitle }
    const notice = firethornTaskNotice(previous, next)
    if (notice !== undefined) {
      window.dispatchEvent(new CustomEvent(FIRETHORN_PET_TASK_EVENT, {
        detail: { text: notice },
      }))
    }
    previous = next
  }
  ctx.effect(() => {
    observeTask()
    return ctx.sessions.list.subscribe(observeTask)
  }, 'firethorn-pet: task notices')
}

/** Locale namespace owned by the firethorn settings card. */
export const FIRETHORN_LOCALE_NAMESPACE = 'settings.firethornPet'
