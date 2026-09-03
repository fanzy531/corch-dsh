import { describe, expect, it } from 'vitest'
import { firethornTaskNotice } from '../src/client/task-notices.ts'

describe('firethorn task notices', () => {
  it('announces same-task idle/running transitions with the task title', () => {
    const idle = { id: 'task-1', running: false, displayTitle: '整理课程资料' }
    expect(firethornTaskNotice(idle, { ...idle, running: true })).toBe('处理中\n整理课程资料')
    expect(firethornTaskNotice({ ...idle, running: true }, idle)).toBe('已完成\n整理课程资料')
  })

  it('does not announce initial state, selection changes, or empty titles', () => {
    const current = { id: 'task-1', running: true, displayTitle: '任务' }
    expect(firethornTaskNotice(undefined, current)).toBeUndefined()
    expect(firethornTaskNotice(current, { ...current, id: 'task-2', running: false })).toBeUndefined()
    expect(firethornTaskNotice(current, { ...current, displayTitle: '  ' })).toBeUndefined()
  })
})
