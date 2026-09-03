import type { ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClabContentChatData } from './definition.ts'
import type { ClabCreatorKey } from './locales.ts'
import css from './Workbench.module.css'

/** Props for the keyed content-snapshot renderer. */
export type ContentNodePanelProps = PropsRuntime<'conversation.chat.node', 'clab-content'> & PropsLocale<'clabCreator'>

/** Render one saved Markdown snapshot inside the normal Conversation record. */
export function ContentNodePanel({ node, t }: ContentNodePanelProps): ReactNode {
  const data = node.data
  const stageKey: Record<ClabContentChatData['stage'], ClabCreatorKey> = { outline: 'outline', draft: 'content', final: 'final' }
  return (
    <article className={css.contentNode} data-stage={data.stage}>
      <header><strong>{data.title}</strong><span>{t(stageKey[data.stage])} · {data.platform === 'xiaohongshu' ? t('xiaohongshu') : t('wordpress')}</span></header>
      <pre>{data.markdown}</pre>
    </article>
  )
}
