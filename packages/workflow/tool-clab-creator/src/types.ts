/** Durable event types shared by the CLAB Creator tool and browser renderer. */

/** The stages a creator can persist from the existing Conversation. */
export type ClabContentStage = 'outline' | 'draft' | 'final'

/** Durable creator content event, one event per explicit model save. */
export interface ClabContentEventData {
  /** Content stage selected by the model-facing tool. */
  stage: ClabContentStage
  /** Project title shown in the node. */
  title: string
  /** Markdown snapshot saved by the tool. */
  markdown: string
  /** Target platform selected for the project. */
  platform: 'xiaohongshu' | 'wordpress'
  /** Project status after the save. */
  status: 'draft' | 'final' | 'published'
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** One creator content snapshot saved from Conversation; log-only. @mode emit */
    'clab/content': ClabContentEventData
  }
}
