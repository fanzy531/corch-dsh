/** Browser route serving the packaged transparent firethorn mascot asset. */
export const FIRETHORN_PET_ASSET_URL = '/firethorn-pet/firethorn-pet.png'

/** Host route queried when the user opens the pet account panel. */
export const FIRETHORN_PET_ACCOUNT_URL = '/firethorn-pet/account.json'

/** Settings namespace owned by the firethorn pet plugin. */
export const FIRETHORN_PET_SETTINGS_NAMESPACE = 'firethorn-pet'

/** Browser event carrying a task-specific notice for the pet bubble. */
export const FIRETHORN_PET_TASK_EVENT = 'dsh:firethorn-pet-task'

/** Visual states supported by the browser pet. */
export type FirethornPetVisualState = 'default' | 'hover' | 'working' | 'exhausted'

/** Host routes for every visual state used by the browser pet. */
export const FIRETHORN_PET_ASSET_URLS: Readonly<Record<FirethornPetVisualState, string>> = Object.freeze({
  default: FIRETHORN_PET_ASSET_URL,
  hover: '/firethorn-pet/firethorn-pet-hover.png',
  working: '/firethorn-pet/firethorn-pet-working.png',
  exhausted: '/firethorn-pet/firethorn-pet-exhausted.png',
})
