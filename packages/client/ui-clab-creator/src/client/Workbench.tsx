import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { PropsHooks, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ClabPlatform, ClabProject, ClabProjectSource } from './model.ts'
import { newProject, readFileAsDataUrl } from './model.ts'
import type { ClabCreatorKey } from './locales.ts'
import css from './Workbench.module.css'

type WorkbenchTab = 'overview' | 'materials' | 'outline' | 'content' | 'checks'

const FALLBACK_PROJECT = newProject('xiaohongshu', '未命名创作')

interface WorkbenchInjected {
  hooks: { projects: ClabProjectSource }
  updateProject: (id: SessionId, patch: Partial<ClabProject>) => void
  runSearch: (id: SessionId, query: string) => Promise<void>
  uploadMaterials: (id: SessionId, files: readonly File[]) => Promise<void>
  addMaterialsToConversation: (id: SessionId, materialIds: readonly string[]) => void
  removeMaterialFromConversation: (id: SessionId, materialId: string) => void
}

/** Full props for the physical details-column creator workbench. */
export type WorkbenchProps =
  & PropsRuntime<'conversation.details.context'>
  & PropsHooks<WorkbenchInjected['hooks']>
  & Omit<WorkbenchInjected, 'hooks'>
  & PropsLocale<'clabCreator'>

const tabs: readonly { id: WorkbenchTab; key: ClabCreatorKey }[] = [
  { id: 'overview', key: 'overview' }, { id: 'materials', key: 'materials' },
  { id: 'outline', key: 'outline' }, { id: 'content', key: 'content' }, { id: 'checks', key: 'checks' },
]

function platformLabel(platform: ClabPlatform, t: WorkbenchProps['t']): string {
  return platform === 'xiaohongshu' ? t('xiaohongshu') : t('wordpress')
}

function statusLabel(status: ClabProject['status'], t: WorkbenchProps['t']): string {
  const key: Record<ClabProject['status'], ClabCreatorKey> = { draft: 'draft', final: 'final', published: 'published' }
  return t(key[status])
}

function Overview({ project, sessionId, updateProject, t }: Pick<WorkbenchProps, 'sessionId' | 'updateProject' | 't'> & { project: ClabProject }) {
  const addImages = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = [...(event.currentTarget.files ?? [])]
    if (files.length === 0) return
    void Promise.all(files.map(async file => ({
      id: `${file.name}-${file.lastModified}`,
      src: await readFileAsDataUrl(file),
      name: file.name,
    }))).then((images) => {
      const nextCover = project.cover ?? images[0]?.src
      updateProject(sessionId, { images: [...project.images, ...images], ...(nextCover === undefined ? {} : { cover: nextCover }) })
    })
    event.currentTarget.value = ''
  }
  return (
    <div className={css.tabBody}>
      <label className={css.titleEditor}>
        <span>{t('titlePlaceholder')}</span>
        <input
          defaultValue={project.title}
          onBlur={(event) => {
            const normalized = event.currentTarget.value.trim()
            if (normalized !== '' && normalized !== project.title) updateProject(sessionId, { title: normalized, status: 'draft' })
          }}
        />
      </label>
      <div className={css.mediaHeader}><span>{t('cover')}</span><label className={css.smallButton}>{t('addImages')}<input hidden type="file" accept="image/*" multiple onChange={addImages} /></label></div>
      <div className={css.imageGrid}>
        {project.images.length === 0 && <div className={css.imageEmpty}>{t('addImages')}</div>}
        {project.images.map(image => (
          <figure key={image.id} className={css.imageItem}>
            <img src={image.src} alt={image.name} />
            <figcaption>
              <span>{image.name}</span>
              <button type="button" onClick={() => {
                const nextCover = project.cover === image.src
                  ? project.images.find(item => item.id !== image.id)?.src
                  : project.cover
                updateProject(sessionId, {
                  images: project.images.filter(item => item.id !== image.id),
                  ...(nextCover === undefined ? {} : { cover: nextCover }),
                })
              }}>{t('remove')}</button>
              <button type="button" onClick={() => { updateProject(sessionId, { cover: image.src }) }}>{t('setCover')}</button>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={css.previewBlock}><h3>{t('outline')}</h3><pre>{project.outline}</pre></div>
      <div className={css.previewBlock}><h3>{t('content')}</h3><pre>{project.content}</pre></div>
    </div>
  )
}

function Materials({ project, sessionId, updateProject, runSearch, uploadMaterials, addMaterialsToConversation, t }: Pick<WorkbenchProps, 'sessionId' | 'updateProject' | 'runSearch' | 'uploadMaterials' | 'addMaterialsToConversation' | 't'> & { project: ClabProject }) {
  const [query, setQuery] = useState(project.searchQuery)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<readonly string[]>([])
  const [materialError, setMaterialError] = useState<string | null>(null)
  const selected = project.searchResults.filter(item => item.selected)
  const staged = new Set(project.pendingMaterialIds ?? [])
  const search = (): void => { const value = query.trim(); if (value !== '') void runSearch(sessionId, value) }
  const confirm = (): void => {
    const folder = `agent-reach｜${project.searchQuery || query}｜${new Date().toISOString().slice(0, 10)}`
    const additions = selected.map(result => ({
      id: result.id,
      name: `${result.title}.md`,
      type: 'search' as const,
      url: result.url,
      publisher: result.publisher,
      folder,
      status: 'ready' as const,
      preview: `# ${result.title}\n\n- 发布者：${result.publisher}\n- 原文 URL：${result.url}\n\n## 资料摘要\n这是 agent-reach 搜索结果的 Markdown 资料条目，可在 Conversation 中继续核验、改写和扩展。`,
      previewKind: 'text' as const,
    }))
    updateProject(sessionId, {
      materials: [...project.materials, ...additions],
      searchResults: project.searchResults.map(item => ({ ...item, selected: false })),
    })
  }
  const upload = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = [...(event.currentTarget.files ?? [])]
    if (files.length === 0) return
    setMaterialError(null)
    void uploadMaterials(sessionId, files).catch((reason: unknown) => {
      setMaterialError(reason instanceof Error ? reason.message : String(reason))
    })
    event.currentTarget.value = ''
  }
  const addToConversation = (materialIds: readonly string[]): void => {
    setMaterialError(null)
    try {
      addMaterialsToConversation(sessionId, materialIds)
      setSelectedMaterialIds([])
    } catch (reason: unknown) {
      setMaterialError(reason instanceof Error ? reason.message : String(reason))
    }
  }
  const toggle = (id: string): void => {
    updateProject(sessionId, {
      searchResults: project.searchResults.map(item => item.id === id ? { ...item, selected: !item.selected } : item),
    })
  }
  return (
    <div className={css.tabBody}>
      <div className={css.searchRow}>
        <input
          value={query}
          placeholder={t('searchPlaceholder')}
          onChange={(event) => { setQuery(event.target.value) }}
          onKeyDown={(event) => { if (event.key === 'Enter') search() }}
        />
        <button type="button" className={css.primaryButton} onClick={search}>{t('startSearch')}</button>
      </div>
      {materialError !== null && <div className={css.errorLine} role="alert">{materialError}</div>}
      {project.searchStatus === 'running' && <div className={css.statusLine}>{t('searchRunning')}</div>}
      {project.searchStatus === 'completed' && <div className={css.statusLine}>{t('searchDone')}</div>}
      {project.searchResults.length > 0 && (
        <div className={css.resultList}>
          {project.searchResults.map(result => (
            <label key={result.id} className={css.resultRow}>
              <input type="checkbox" checked={result.selected} onChange={() => { toggle(result.id) }} />
              <span><strong>{result.title}</strong><small>{result.publisher} · {result.url}</small></span>
            </label>
          ))}
          <button type="button" disabled={selected.length === 0} onClick={confirm}>
            {t('confirmMaterials')}（{selected.length}）
          </button>
        </div>
      )}
      <div className={css.materialHeader}><span>{t('materials')}</span><label className={css.smallButton}>{t('upload')}<input hidden type="file" multiple accept=".pdf,.docx,.md,.txt,image/*" onChange={upload} /></label></div>
      {selectedMaterialIds.length > 0 && <button type="button" className={css.primaryButton} onClick={() => { addToConversation(selectedMaterialIds) }}>{t('addSelectedToConversation')}（{selectedMaterialIds.length}）</button>}
      {project.materials.length === 0 ? <div className={css.emptyList}>{t('noMaterials')}</div> : <div className={css.materialTree}>{[...new Set(project.materials.map(item => item.folder))].map(folder => <div key={folder} className={css.folder}><strong>▾ {folder}</strong>{project.materials.filter(item => item.folder === folder).map(item => (
        <div key={item.id} className={css.materialEntry}>
          <div className={css.materialRow}>
            <label className={css.materialSelect}><input type="checkbox" checked={selectedMaterialIds.includes(item.id)} onChange={() => { setSelectedMaterialIds(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id]) }} /><span>▤ {item.name}</span></label>
            <small>{item.publisher ?? t('ready')}{item.url === undefined ? '' : ` · ${item.url}`}</small>
          </div>
          <div className={css.materialActions}>
            <button type="button" className={css.smallButton} onClick={() => { setPreviewId(previewId === item.id ? null : item.id) }}>{previewId === item.id ? t('closePreview') : t('preview')}</button>
            <button type="button" className={css.smallButton} disabled={staged.has(item.id)} onClick={() => { addToConversation([item.id]) }}>{staged.has(item.id) ? t('alreadyInConversation') : t('addToConversation')}</button>
          </div>
          {previewId === item.id && (
            item.previewKind === 'image' && item.preview !== undefined
              ? <img className={css.materialPreviewImage} src={item.preview} alt={item.name} />
              : <pre className={css.materialPreview}>{item.preview ?? t('previewUnavailable')}</pre>
          )}
        </div>
      ))}</div>)}</div>}
    </div>
  )
}

/** Render the tabbed creator flow beside the project list. */
export function Workbench({
  sessionId, useProjects, updateProject, runSearch, uploadMaterials,
  addMaterialsToConversation, t,
}: WorkbenchProps): ReactNode {
  const [tab, setTab] = useState<WorkbenchTab>('overview')
  const project = useProjects(state => state.projects[String(sessionId)] ?? FALLBACK_PROJECT)
  const status = statusLabel(project.status, t)
  return (
    <section className={css.workbench}>
      <header className={css.workbenchHeader}>
        <div><strong>{project.title}</strong><span>{platformLabel(project.platform, t)}</span></div>
        <span className={css.statusPill} data-status={project.status}>{status}</span>
      </header>
      <nav className={css.tabs} aria-label={t('brand')}>{tabs.map(item => <button type="button" key={item.id} className={tab === item.id ? css.tabActive : css.tab} onClick={() => { setTab(item.id) }}>{t(item.key)}</button>)}</nav>
      {tab === 'overview' && <Overview key={String(sessionId)} project={project} sessionId={sessionId} updateProject={updateProject} t={t} />}
      {tab === 'materials' && <Materials project={project} sessionId={sessionId} updateProject={updateProject} runSearch={runSearch} uploadMaterials={uploadMaterials} addMaterialsToConversation={addMaterialsToConversation} t={t} />}
      {tab === 'outline' && <div className={css.tabBody}><pre className={css.markdown}>{project.outline}</pre></div>}
      {tab === 'content' && <div className={css.tabBody}><pre className={css.markdown}>{project.content}</pre><p className={css.hint}>{t('conversationHint')}</p></div>}
      {tab === 'checks' && (
        <div className={css.tabBody}>
          <div className={css.checkList}>
            <div>✓ {t('checkTitle')}</div>
            <div>✓ {t('checkContent')}</div>
            <div>✓ {t('checkImages')}</div>
          </div>
          <button type="button" className={css.primaryButton} onClick={() => { updateProject(sessionId, { status: 'final' }) }}>{t('markFinal')}</button>
          <button type="button" onClick={() => { updateProject(sessionId, { status: 'published' }) }}>{t('markPublished')}</button>
          <button type="button" disabled>{project.platform === 'xiaohongshu' ? t('publishXhs') : t('publishWordpress')}</button>
        </div>
      )}
    </section>
  )
}

/** Show materials staged in the native Conversation draft above its composer. */
export function PendingContextDock({ sessionId, useProjects, removeMaterialFromConversation, t }: Pick<WorkbenchProps, 'removeMaterialFromConversation' | 't'> & PropsHooks<WorkbenchInjected['hooks']> & PropsRuntime<'conversation.input.dock'>): ReactNode {
  const project = useProjects(state => state.projects[String(sessionId)])
  const pending = project?.pendingMaterialIds ?? []
  if (project === undefined || pending.length === 0) return null
  const materials = pending
    .map(id => project.materials.find(material => material.id === id))
    .filter((material): material is ClabProject['materials'][number] => material !== undefined)
  if (materials.length === 0) return null
  return (
    <div className={css.contextDock} data-clab-context-dock>
      <span className={css.contextLabel}>{t('conversationMaterials')}</span>
      <div className={css.contextList}>
        {materials.map(material => (
          <span key={material.id} className={css.contextChip}>
            <span title={material.name}>▤ {material.name}</span>
            <button type="button" aria-label={`${t('remove')} ${material.name}`} onClick={() => { removeMaterialFromConversation(sessionId, material.id) }}>×</button>
          </span>
        ))}
      </div>
      <span className={css.contextHint}>{t('conversationMaterialsHint')}</span>
    </div>
  )
}
