import { useEffect, useState, type ReactNode } from 'react'
import type { GlobalReferenceDocument } from './InterviewSettings.tsx'
import { hydrateCorpusDocument } from './globalReferenceCorpus.ts'
import css from './InterviewWorkbench.module.css'

export function GlobalReferenceSidebarTab({ document }: { document: GlobalReferenceDocument }): ReactNode {
  const [content, setContent] = useState(document.markdown)
  useEffect(() => { void hydrateCorpusDocument(document).then(value => setContent(value.markdown)) }, [document])
  return <article className={css.materialPreview}><header className={css.materialPreviewHeader}><div><strong>{document.id} · {document.title}</strong><small>{document.tier ?? '用户文献'}级 · v{document.version} · 全局基础文献池</small></div><span className={css.pill}>{document.enabled ? '启用中' : '已停用'}</span></header><div className={css.materialPreviewBody}><p className={css.muted}>以下为文献池 Markdown 原文预览。它用于问题生成的方法论和来源依据，不代表当前专家事实。</p><pre>{content || '正在加载文献正文…'}</pre></div></article>
}
