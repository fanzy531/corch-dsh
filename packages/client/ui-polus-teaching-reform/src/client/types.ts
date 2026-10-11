import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { GlobalReferenceDocument } from './InterviewSettings.tsx'

export type InterviewProfile = {
  name: string
  industry: string
  role: string
  years: string
  stage: string
  experience: string
  materials?: readonly ExpertMaterial[]
}

export type ExpertMaterial = {
  id: string
  name: string
  sourceType: 'pdf' | 'word' | 'excel' | 'markdown' | 'text' | 'other'
  markdown: string
  status: 'ready' | 'processing' | 'failed'
  uploadedAt: string
  error?: string
}

export type TeachingReformProps = PropsRuntime<'conversation.details.context'> & {
  sessionId: SessionId
  generateInterview: (id: SessionId, profile: InterviewProfile) => Promise<string>
  observeInterviewCommands: (id: SessionId, listener: (command: 'regenerate') => void) => () => void
  openExpertMaterialPreview?: (sessionId: SessionId, material: ExpertMaterial) => void
  openGlobalReferencePreview?: (document: GlobalReferenceDocument) => void
}
