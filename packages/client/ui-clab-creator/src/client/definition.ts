import type { ChatConversationViewNode, ConversationNodeContext, ConversationNodeDefinition } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ClabContentEventData } from '@deepseek-ai/dsh-tool-clab-creator/types'

/** Renderer payload for one content snapshot in the Conversation. */
export interface ClabContentChatData extends ClabContentEventData {}

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface ChatNodeDataMap {
    /** One outline, draft, or final Markdown snapshot saved by clab_creator. */
    'clab-content': ClabContentChatData
  }
}

/** Fold one log-only content event into one Conversation node. */
export const clabContentDefinition: ConversationNodeDefinition<ClabContentEventData> = {
  kind: 'clab-content',
  target: 'chat',
  match: event => event.type === 'clab/content'
    ? { id: String(event.seq), role: 'start' }
    : null,
  start: (_context, match) => (match.event as SessionEvent<'clab/content'>).data,
  update: context => context.state,
  buildViewNode: (context: ConversationNodeContext<ClabContentEventData>): ChatConversationViewNode | null => {
    if (context.start === undefined) return null
    return {
      key: context.key,
      kind: 'clab-content',
      id: context.id,
      target: 'chat',
      anchorSeq: context.start.event.seq,
      location: context.start.location,
      visibility: 'visible',
      data: context.state,
    }
  },
}
