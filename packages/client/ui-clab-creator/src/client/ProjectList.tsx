import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type { PropsHooks, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import type { ClabPlatform, ClabProject, ClabProjectSource, ClabProjectStore } from './model.ts'
import { newProject, readFileAsDataUrl } from './model.ts'
import type { ClabCreatorKey } from './locales.ts'
import css from './Workbench.module.css'

interface ProjectListInjected {
  hooks: { projects: ClabProjectSource }
  createProject: (title: string, platform: ClabPlatform, cover?: string) => Promise<void>
  openProject: (id: SessionId) => void
  deleteProject: (id: SessionId) => void
}

/** Full props for the sidebar browsing-region browser. */
export type ProjectListProps =
  & PropsRuntime<'sidebar.workspaces'>
  & PropsHooks<ProjectListInjected['hooks']>
  & Omit<ProjectListInjected, 'hooks'>
  & PropsLocale<'clabCreator'>

function projectForRow(projects: Readonly<Record<string, ClabProject>>, id: SessionId, title: string): ClabProject {
  return projects[String(id)] ?? newProject('xiaohongshu', title || '未命名创作')
}

function platformLabel(platform: ClabPlatform, t: ProjectListProps['t']): string {
  return platform === 'xiaohongshu' ? t('xiaohongshu') : t('wordpress')
}

function statusLabel(status: ClabProject['status'], t: ProjectListProps['t']): string {
  const key: Record<ClabProject['status'], ClabCreatorKey> = {
    draft: 'draft', final: 'final', published: 'published',
  }
  return t(key[status])
}

function ProjectModal({ onCancel, onCreate, t }: {
  readonly onCancel: () => void
  readonly onCreate: ProjectListInjected['createProject']
  readonly t: ProjectListProps['t']
}) {
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<ClabPlatform>('xiaohongshu')
  const [cover, setCover] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  // Keep composition state outside React renders so a Chinese IME can finish
  // its candidate without a controlled-input update treating Enter as submit.
  const composingRef = useRef(false)
  const chooseCover = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.currentTarget.files?.[0]
    if (file === undefined) return
    void readFileAsDataUrl(file).then(setCover).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : String(reason))
    })
  }
  const submit = (): void => {
    const normalized = (titleInputRef.current?.value ?? title).trim()
    if (normalized === '' || busy) return
    setError(null)
    setBusy(true)
    void onCreate(normalized, platform, cover)
      .catch((reason: unknown) => { setError(reason instanceof Error ? reason.message : String(reason)) })
      .finally(() => { setBusy(false) })
  }
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (composingRef.current) return
    submit()
  }
  const onCompositionStart = (): void => {
    composingRef.current = true
  }
  const onCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>): void => {
    // Preserve the committed candidate even if the browser batches the final
    // input event after compositionend.
    setTitle(event.currentTarget.value)
    window.setTimeout(() => { composingRef.current = false }, 10)
  }
  return (
    <div className={css.modalBackdrop} role="presentation" onClick={onCancel}>
      <div className={css.modal} role="dialog" aria-modal="true" aria-labelledby="clab-create-title" onClick={(event) => { event.stopPropagation() }}>
        <h2 id="clab-create-title">{t('createTitle')}</h2>
        <form onSubmit={onSubmit}>
          <label className={css.field} htmlFor="clab-project-title">
            <span>{t('titlePlaceholder')}</span>
            <input
              id="clab-project-title"
              type="text"
              autoFocus
              ref={titleInputRef}
              defaultValue=""
              onChange={(event) => { setTitle(event.target.value) }}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={onCompositionEnd}
            />
          </label>
          <fieldset className={css.fieldset}>
            <legend>{t('choosePlatform')}</legend>
            <label><input type="radio" checked={platform === 'xiaohongshu'} onChange={() => { setPlatform('xiaohongshu') }} /> {t('xiaohongshu')}</label>
            <label><input type="radio" checked={platform === 'wordpress'} onChange={() => { setPlatform('wordpress') }} /> {t('wordpress')}</label>
          </fieldset>
          <label className={css.field}>
            <span>{t('cover')}</span>
            <input type="file" accept="image/*" onChange={chooseCover} />
          </label>
          {error !== null && <div className={css.errorLine} role="alert">{t('createFailed')}: {error}</div>}
          <div className={css.modalActions}>
            <button type="button" onClick={onCancel}>{t('cancel')}</button>
            <button type="submit" className={css.primaryButton} disabled={title.trim() === '' || busy}>{t('create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** Render the compact recent-first creator project list. */
export function ProjectList({
  wide, expandSidebar, useSessions, useProjects,
  createProject, openProject, deleteProject, t,
}: ProjectListProps): ReactNode {
  const [modalOpen, setModalOpen] = useState(false)
  const sessions = useSessions((state: SessionListState) => state)
  const projectState = useProjects(state => state)
  const visible = useMemo(() => sessions.ids
    .flatMap((id) => {
      const summary = sessions.byId[id]
      const project = projectState.projects[String(id)]
      if (summary === undefined || project?.deleted === true || (summary.blank && project === undefined)) return []
      return [{ id, summary, project: project ?? projectForRow(projectState.projects, id, summary.displayTitle) }]
    })
    .sort((a, b) => b.project.updatedAt - a.project.updatedAt), [projectState.projects, sessions])

  return (
    <div className={css.projectListRegion}>
      {wide ? (
        <div className={css.regionHeader}>
          <span>{t('projects')}</span>
          <button type="button" className={css.addButton} aria-label={t('newProject')} onClick={() => { setModalOpen(true) }}>＋</button>
        </div>
      ) : (
        <button type="button" className={css.railAdd} aria-label={t('newProject')} onClick={() => { expandSidebar(); setModalOpen(true) }}>＋</button>
      )}
      {wide && visible.length === 0 && <div className={css.emptyList}>{t('empty')}</div>}
      {wide && visible.map(({ id, summary, project }) => {
        // Older projects may retain an object URL that cannot survive a refresh;
        // use the persisted image entry when it is available.
        const cardImage = project.cover?.startsWith('blob:') === true
          ? project.images[0]?.src
          : project.cover ?? project.images[0]?.src
        return (
          <div key={String(id)} className={css.projectCardWrap}>
            <button type="button" className={sessions.current === id ? css.projectCardActive : css.projectCard} onClick={() => { openProject(id) }}>
              <div className={css.cardCover} aria-hidden>
                {cardImage === undefined
                  ? <span>✦</span>
                  : <img className={css.cardCoverImage} src={cardImage} alt="" />}
              </div>
              <div className={css.cardText}>
                <strong>{project.title || summary.displayTitle}</strong>
                <span>{platformLabel(project.platform, t)} · {statusLabel(project.status, t)}</span>
                <small>{new Date(project.updatedAt || summary.updatedAt).toLocaleString()}</small>
              </div>
            </button>
            <button type="button" className={css.deleteProjectButton} aria-label={`${t('deleteProject')}: ${project.title || summary.displayTitle}`} onClick={(event) => {
              event.stopPropagation()
              const title = project.title || summary.displayTitle
              if (window.confirm(t('deleteConfirm', { title }))) deleteProject(id)
            }}>×</button>
          </div>
        )
      })}
      {modalOpen && (
        <ProjectModal
          t={t}
          onCancel={() => { setModalOpen(false) }}
          onCreate={async (title, platform, cover) => {
            await createProject(title, platform, cover)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export type { ClabProjectStore }
