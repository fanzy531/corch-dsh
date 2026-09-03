import { describe, expect, it } from 'vitest'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { createProjectStore, deleteProject, newProject, projectFor, setProject, updateProject } from '../src/client/model.ts'

const sessionId = 'clab-model-test' as SessionId

describe('CLAB Creator project model', () => {
  it('creates platform-specific demo content with the requested title', () => {
    const project = newProject('wordpress', '校园观察')
    expect(project.title).toBe('校园观察')
    expect(project.platform).toBe('wordpress')
    expect(project.status).toBe('draft')
    expect(project.outline).toContain('内容大纲')
    expect(project.content).toContain('WordPress')
  })

  it('stores projects by Session id and updates their editable metadata', () => {
    const store = createProjectStore()
    setProject(store, sessionId, newProject('xiaohongshu', '原始标题'))
    updateProject(store, sessionId, { title: '修改后的标题', status: 'final' })

    expect(projectFor(store, sessionId)).toMatchObject({
      title: '修改后的标题',
      platform: 'xiaohongshu',
      status: 'final',
    })
  })

  it('keeps a deletion tombstone so session synchronization does not recreate a project', () => {
    const store = createProjectStore()
    setProject(store, sessionId, newProject('xiaohongshu', '待删除'))
    deleteProject(store, sessionId)

    expect(projectFor(store, sessionId)).toMatchObject({ deleted: true })
  })
})
