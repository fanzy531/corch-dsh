import { useSyncExternalStore } from 'react'

/** The workbench surfaces that share the sidebar browser region. */
export type SidebarMode = 'sessions' | 'curriculum' | 'interviews' | 'jd-search'

let currentMode: SidebarMode = 'sessions'
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function getMode(): SidebarMode {
  return currentMode
}

/** Subscribe to workbench selection changes for non-React plugin routing. */
export function subscribeSidebarMode(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Read the current workbench selection outside a React render. */
export function getSidebarMode(): SidebarMode {
  return getMode()
}

/** Read the shared workbench selection from both the App Rail and sidebar. */
export function useSidebarMode(): SidebarMode {
  return useSyncExternalStore(subscribe, getMode, getMode)
}

/** Select the workbench surface shown in the sidebar browser region. */
export function selectSidebarMode(mode: SidebarMode): void {
  if (currentMode === mode) return
  currentMode = mode
  for (const listener of listeners) listener()
}
