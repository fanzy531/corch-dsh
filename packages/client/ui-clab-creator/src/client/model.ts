import { createSnapshotStore, type ObservableSnapshot, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

/** Fixed project destinations supported by the first creator demo. */
export type ClabPlatform = 'xiaohongshu' | 'wordpress'
/** Project lifecycle shown in cards and the overview. */
export type ClabStatus = 'draft' | 'final' | 'published'

/** One search or upload entry shown in the materials tree. */
export interface ClabMaterial {
  readonly id: string
  readonly name: string
  readonly type: 'search' | 'upload'
  readonly url?: string
  readonly publisher?: string
  readonly folder: string
  readonly status: 'ready' | 'converting' | 'failed'
  /** Local text or image preview retained for the lightweight browser demo. */
  readonly preview?: string
  /** Preview renderer selected from the uploaded file type. */
  readonly previewKind?: 'text' | 'image'
}

/** One local image reference used by the demo workbench. */
export interface ClabImage {
  readonly id: string
  readonly src: string
  readonly name: string
}

/** Candidate returned by the demo search flow. */
export interface ClabSearchResult {
  readonly id: string
  readonly title: string
  readonly publisher: string
  readonly url: string
  readonly selected: boolean
}

/** All browser-visible project fields; the model remains in the session log. */
export interface ClabProject {
  readonly title: string
  /** Soft-deleted projects stay as tombstones so session-list sync cannot recreate them. */
  readonly deleted?: boolean
  readonly platform: ClabPlatform
  readonly status: ClabStatus
  readonly updatedAt: number
  readonly cover?: string
  readonly images: readonly ClabImage[]
  readonly outline: string
  readonly content: string
  readonly materials: readonly ClabMaterial[]
  /** Material ids currently staged in the native Conversation draft. */
  readonly pendingMaterialIds?: readonly string[]
  readonly searchQuery: string
  readonly searchStatus: 'idle' | 'running' | 'completed' | 'failed'
  readonly searchResults: readonly ClabSearchResult[]
}

/** Root observable backing both the project-list browser and workbench. */
export interface ClabProjectState {
  projects: Record<string, ClabProject>
}

/** Read-only project state consumed by injected browser components. */
export type ClabProjectStore = SnapshotStore<ClabProjectState>
/** Observable project state exposed to the workbench and project list. */
export type ClabProjectSource = ObservableSnapshot<ClabProjectState>

/** Read a local file into a refresh-safe data URL for browser persistence. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error(`Could not read ${file.name} as a data URL`))
    }
    reader.onerror = () => { reject(reader.error ?? new Error(`Could not read ${file.name}`)) }
    reader.readAsDataURL(file)
  })
}

/** Create the small persisted browser state used by this demo package.
 * @returns A browser-persisted project store.
 */
export function createProjectStore(): ClabProjectStore {
  return createSnapshotStore({ projects: {} }, {
    persist: { name: 'dsh.clab.creator.v1' },
  })
}

/** Create the initial visible project content without invoking a model.
 * @param platform The destination content platform.
 * @param title The initial project title.
 * @param cover An optional initial cover image URL.
 * @returns The initial project metadata and demo content.
 */
export function newProject(platform: ClabPlatform, title: string, cover?: string): ClabProject {
  const outline = platform === 'xiaohongshu'
    ? '# 选题\n\n- 目标读者：对校园生活感兴趣的用户\n- 核心观点：用一个具体场景讲清楚价值\n- 配图节奏：封面 + 3 张内容图'
    : '# 内容大纲\n\n## 开场\n问题与读者场景\n\n## 正文\n事实、案例与方法\n\n## 结尾\n行动建议与下一步'
  const content = platform === 'xiaohongshu'
    ? '# 校园生活选题\n\n这是一份可继续加工的小红书草稿。\n\n## 为什么值得写\n从真实场景出发，给读者一个明确的参考。'
    : '# 网站文章草稿\n\n这是一份可继续加工的 WordPress 文章草稿。\n\n## 引言\n从一个真实问题开始，逐步展开事实、案例和建议。'
  return {
    title,
    platform,
    status: 'draft',
    updatedAt: Date.now(),
    ...(cover === undefined ? {} : { cover }),
    images: [],
    outline,
    content,
    materials: [],
    pendingMaterialIds: [],
    searchQuery: '',
    searchStatus: 'idle',
    searchResults: [],
  }
}

/** Read a project with a demo-safe fallback for a session opened before metadata existed.
 * @param source The observable project source.
 * @param sessionId The session whose project should be read.
 * @returns The stored project or a default project for the session.
 */
export function projectFor(source: ClabProjectSource, sessionId: SessionId): ClabProject {
  return source.getSnapshot().projects[String(sessionId)] ?? newProject('xiaohongshu', '未命名创作')
}

/** Add or replace a project in the observable state.
 * @param store The mutable project store.
 * @param sessionId The session that owns the project.
 * @param project The complete project value to store.
 */
export function setProject(store: ClabProjectStore, sessionId: SessionId, project: ClabProject): void {
  store.update((draft) => {
    draft.projects[String(sessionId)] = project
  })
}

/** Update project fields and make the card rise to the top of the recency list.
 * @param store The mutable project store.
 * @param sessionId The session that owns the project.
 * @param patch The project fields to replace.
 */
export function updateProject(
  store: ClabProjectStore,
  sessionId: SessionId,
  patch: Partial<ClabProject>,
): void {
  store.update((draft) => {
    const key = String(sessionId)
    const current = draft.projects[key] ?? newProject('xiaohongshu', '未命名创作')
    draft.projects[key] = { ...current, ...patch, updatedAt: Date.now() }
  })
}

/** Hide a project from the creator list while retaining its session association.
 * @param store The mutable project store.
 * @param sessionId The session that owns the project.
 */
export function deleteProject(store: ClabProjectStore, sessionId: SessionId): void {
  updateProject(store, sessionId, { deleted: true })
}
