/** Minimal current-session data needed to produce a pet task notice. */
export interface FirethornTaskState {
  id: string
  running: boolean
  displayTitle: string
}

/**
 * Derive a notice only from an idle/running transition for the same task.
 * @param previous - last observed current-task state.
 * @param current - current task state from the client session list.
 * @returns task notice text, or undefined when no task transition occurred.
 */
export function firethornTaskNotice(
  previous: FirethornTaskState | undefined,
  current: FirethornTaskState,
): string | undefined {
  if (previous === undefined || previous.id !== current.id || previous.running === current.running) return undefined
  if (current.displayTitle.trim() === '') return undefined
  return `${current.running ? '处理中' : '已完成'}\n${current.displayTitle}`
}
