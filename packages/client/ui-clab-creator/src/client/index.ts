/** Browser half of the creator workbench. */
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ChatNode } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ContentNodePanel } from './ContentNodePanel.tsx'
import { materialContextBlock, removeMaterialContext } from './context.ts'
import { ProjectList } from './ProjectList.tsx'
import { PendingContextDock, Workbench } from './Workbench.tsx'
import { clabContentDefinition } from './definition.ts'
import { en, NS, zh } from './locales.ts'
import { createProjectStore, deleteProject, newProject, readFileAsDataUrl, setProject, updateProject, type ClabPlatform, type ClabProject } from './model.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Social content creator workbench copy. */
    clabCreator: import('./locales.ts').ClabCreatorKey
  }
}

/** Services used by the project list, workbench, and Conversation node. */
export const inject = ['conversationEvents', 'slots', 'sessions', 'workspaces', 'layout', 'locale', 'connection']

function demoResults(query: string) {
  return [
    { id: `${query}-1`, title: `${query}：真实体验与避坑清单`, publisher: '小红书演示账号', url: 'https://www.xiaohongshu.com/explore/demo-1', selected: true },
    { id: `${query}-2`, title: `${query} 选题的 5 个切入角度`, publisher: '小红书演示账号', url: 'https://www.xiaohongshu.com/explore/demo-2', selected: false },
  ] as const
}

function isTextFile(file: File): boolean {
  return file.type.startsWith('text/') || /\.(md|markdown|txt|csv|json)$/i.test(file.name)
}

/** Register the complete browser demo. */
export function apply(ctx: ClientContext): void {
  const projectStore = createProjectStore()
  ctx.conversationEvents.register(clabContentDefinition)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-clab-creator: dictionaries')
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'clab-content',
    locale: NS,
  }, ContentNodePanel))

  const hooks = () => ({ hooks: { projects: projectStore } })
  const openProject = (id: SessionId): void => {
    ctx.sessions.open(id)
    // AppFrame closes details after a session change; open after that layout
    // transition so selecting any project leaves its workbench visible.
    queueMicrotask(() => { ctx.layout.openDetails() })
  }

  const createProject = async (title: string, platform: ClabPlatform, cover?: string): Promise<void> => {
    const workspaceState = ctx.workspaces.list.getSnapshot()
    const sessionState = ctx.sessions.list.getSnapshot()
    const current = sessionState.current
    const currentWorkspace = current === undefined
      ? undefined
      : workspaceState.items.find(item => item.sessionIds.includes(current))
    let workspaceId = currentWorkspace?.workspaceId ?? workspaceState.recentWorkspaceId ?? workspaceState.items[0]?.workspaceId
    if (workspaceId === undefined) {
      const connection = ctx.get('connection') as ConnectionHandle
      const cwd = connection.hostDescription.getSnapshot()?.cwd
      if (cwd === undefined) throw new Error('cannot create a work: Host working directory is not ready')
      const workspace = await ctx.workspaces.create({ path: cwd })
      workspaceId = workspace.workspaceId
    }
    // A creator project is a distinct entry even when the shared Workspace
    // currently has an eligible blank session for the generic New Session flow.
    const id = await ctx.workspaces.connectWorkspace(workspaceId, { reuseBlank: false })
    const session = ctx.sessions.binding(id)?.session
    if (session === undefined) throw new Error(`created session "${id}" is not available`)
    const rename = await session.rename(title)
    if (!rename.ok) throw new Error(rename.error.message)
    setProject(projectStore, id, newProject(platform, title, cover))
    ctx.sessions.open(id)
    queueMicrotask(() => { ctx.layout.openDetails() })
  }

  const runSearch = async (id: SessionId, query: string): Promise<void> => {
    updateProject(projectStore, id, { searchQuery: query, searchStatus: 'running', searchResults: [] })
    const session = ctx.sessions.binding(id)?.session
    if (session === undefined) {
      updateProject(projectStore, id, { searchStatus: 'failed' })
      return
    }
    const result = await session.prompt([{
      type: 'text',
      text: `请为当前${projectStore.getSnapshot().projects[String(id)]?.platform === 'wordpress' ? '网站文章' : '小红书笔记'}执行选题资料搜索：搜索“${query}”。优先使用 agent-reach；整理小红书结果时保留发布者和原文 URL；搜索完成后调用 clab_creator，以 Markdown 形式保存一份资料摘要。不要创建第二套聊天系统。`,
    }], 'queue')
    if (!result.ok) {
      updateProject(projectStore, id, { searchStatus: 'failed' })
      return
    }
    // The fallback keeps the workflow demonstrable when agent-reach is not
    // installed. Real model results can still be saved through clab_creator.
    window.setTimeout(() => {
      const current = projectStore.getSnapshot().projects[String(id)]
      if (current?.searchStatus !== 'running') return
      updateProject(projectStore, id, { searchStatus: 'completed', searchResults: [...demoResults(query)] })
    }, 800)
  }

  const uploadMaterials = async (id: SessionId, files: readonly File[]): Promise<void> => {
    const additions = await Promise.all(files.map(async (file) => {
      const materialId = `${file.name}-${file.lastModified}-${file.size}`
      if (file.type.startsWith('image/')) {
        const preview = await readFileAsDataUrl(file)
        return {
          id: materialId,
          name: `${file.name}.md`,
          type: 'upload' as const,
          folder: 'uploads',
          status: 'ready' as const,
          preview,
          previewKind: 'image' as const,
        }
      }
      let preview: string
      if (isTextFile(file)) {
        try {
          preview = await file.text()
        } catch (reason: unknown) {
          preview = `无法读取 ${file.name}：${reason instanceof Error ? reason.message : String(reason)}`
        }
      } else {
        preview = `文件：${file.name}\n\n此文件已加入资料库。后续可调用 markitdown skill 转换为 Markdown 后继续处理。`
      }
      return {
        id: materialId,
        name: `${file.name}.md`,
        type: 'upload' as const,
        folder: 'uploads',
        status: 'ready' as const,
        preview,
        previewKind: 'text' as const,
      }
    }))
    const project = projectStore.getSnapshot().projects[String(id)]
    if (project !== undefined) updateProject(projectStore, id, { materials: [...project.materials, ...additions] })
  }

  const addMaterialsToConversation = (id: SessionId, materialIds: readonly string[]): void => {
    const project = projectStore.getSnapshot().projects[String(id)]
    if (project === undefined) throw new Error(`project "${id}" is not available`)
    const materials = materialIds
      .map(materialId => project.materials.find(item => item.id === materialId))
      .filter((material): material is NonNullable<typeof material> => material !== undefined)
    if (materials.length !== materialIds.length) throw new Error('one or more materials are not available')
    const pending = new Set(project.pendingMaterialIds ?? [])
    const additions = materials.filter(material => !pending.has(material.id))
    if (additions.length === 0) return
    const actx = ctx.sessions.scope(id)
    if (actx === undefined) throw new Error(`session "${id}" is not available`)
    const conversation = actx.get('conversation')
    if (conversation === undefined) throw new Error('conversation service unavailable')
    const input = conversation.input.for(actx)
    const draft = input.state.getSnapshot().draft
    input.setDraft(`${draft}${additions.map(materialContextBlock).join('')}`)
    updateProject(projectStore, id, {
      pendingMaterialIds: [...pending, ...additions.map(material => material.id)],
    })
  }

  const removeMaterialFromConversation = (id: SessionId, materialId: string): void => {
    const project = projectStore.getSnapshot().projects[String(id)]
    const material = project?.materials.find(item => item.id === materialId)
    if (project === undefined || material === undefined) return
    const actx = ctx.sessions.scope(id)
    if (actx === undefined) return
    const conversation = actx.get('conversation')
    if (conversation === undefined) return
    const input = conversation.input.for(actx)
    input.setDraft(removeMaterialContext(input.state.getSnapshot().draft, material))
    updateProject(projectStore, id, {
      pendingMaterialIds: (project.pendingMaterialIds ?? []).filter(item => item !== materialId),
    })
  }

  const projectListInject = () => ({
    ...hooks(),
    createProject,
    openProject,
    deleteProject: (id: SessionId) => {
      deleteProject(projectStore, id)
      if (ctx.sessions.list.getSnapshot().current === id) ctx.layout.closeDetails()
    },
  })
  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
    name: 'sidebar.workspaces',
    priority: -10,
    select: owner => owner.sidebarMode === 'projects' ? {} : null,
    locale: NS,
    inject: projectListInject,
  }, ProjectList))

  const workbenchInject = () => ({
    ...hooks(),
    updateProject: (id: SessionId, patch: Partial<ClabProject>) => { updateProject(projectStore, id, patch) },
    runSearch,
    uploadMaterials,
    addMaterialsToConversation,
    removeMaterialFromConversation,
  })
  ctx.slots.inject('conversation.details.context', () => ctx.slots.register({
    name: 'conversation.details.context',
    locale: NS,
    inject: workbenchInject,
  }, Workbench))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'clab-context',
    order: 10,
    locale: NS,
    inject: () => ({
      ...hooks(),
      removeMaterialFromConversation,
    }),
  }, PendingContextDock))

  // Seed ordinary existing sessions into the lightweight project list.
  const syncExisting = (): void => {
    for (const id of ctx.sessions.list.getSnapshot().ids) {
      const key = String(id)
      if (projectStore.getSnapshot().projects[key] !== undefined) continue
      const title = ctx.sessions.list.getSnapshot().byId[id]?.displayTitle ?? '未命名创作'
      setProject(projectStore, id, newProject('xiaohongshu', title))
    }
  }
  ctx.effect(() => {
    syncExisting()
    return ctx.sessions.list.subscribe(syncExisting)
  }, 'ui-clab-creator: project list sync')

  // A successful native submission clears the staged context after the input
  // machine returns to an empty idle draft. Failed submissions retain it with
  // the restored draft, so the user can correct and retry.
  ctx.effect(() => {
    const watched = new Map<SessionId, () => void>()
    const submitted = new Set<SessionId>()
    const sync = (): void => {
      for (const id of ctx.sessions.list.getSnapshot().ids) {
        if (watched.has(id)) continue
        const actx = ctx.sessions.scope(id)
        const input = actx?.get('conversation')?.input.for(actx)
        if (input === undefined) continue
        watched.set(id, input.state.subscribe(() => {
          const state = input.state.getSnapshot()
          if (state.phase === 'submitting') submitted.add(id)
          if (!submitted.has(id) || state.phase !== 'plain' || state.draft !== '') return
          submitted.delete(id)
          const project = projectStore.getSnapshot().projects[String(id)]
          if ((project?.pendingMaterialIds ?? []).length > 0) updateProject(projectStore, id, { pendingMaterialIds: [] })
        }))
      }
    }
    sync()
    const off = ctx.sessions.list.subscribe(sync)
    return () => {
      off()
      for (const dispose of watched.values()) dispose()
    }
  }, 'ui-clab-creator: clear staged context after send')

  // Project the latest durable creator snapshot into the lightweight workbench
  // fields while keeping the Conversation node as the authoritative record.
  ctx.effect(() => {
    const watched = new Map<SessionId, () => void>()
    const sync = (): void => {
      for (const id of ctx.sessions.list.getSnapshot().ids) {
        if (watched.has(id)) continue
        const session = ctx.sessions.binding(id)?.session
        if (session === undefined) continue
        const consume = (): void => {
          const nodes = session.getSnapshot().chat.nodes.values()
          const snapshots = nodes.filter((node): node is ChatNode<'clab-content'> => node.kind === 'clab-content')
          if (snapshots.length === 0) return
          const latest = new Map<ClabProject['status'] | 'outline' | 'draft' | 'final', ChatNode<'clab-content'>>()
          for (const node of snapshots) latest.set(node.data.stage, node)
          const project = projectStore.getSnapshot().projects[String(id)]
          if (project === undefined) return
          const outline = latest.get('outline')?.data.markdown ?? project.outline
          const content = latest.get('final')?.data.markdown ?? latest.get('draft')?.data.markdown ?? project.content
          const finalSnapshot = latest.get('final')
          const draftSnapshot = latest.get('draft')
          const status = finalSnapshot?.data.status ?? draftSnapshot?.data.status ?? project.status
          if (project.outline === outline && project.content === content
            && project.status === status) return
          updateProject(projectStore, id, { outline, content, status })
        }
        watched.set(id, session.subscribe(consume))
        consume()
      }
    }
    sync()
    const off = ctx.sessions.list.subscribe(sync)
    return () => {
      off()
      for (const dispose of watched.values()) dispose()
    }
  }, 'ui-clab-creator: sync Conversation snapshots to workbench')
}
