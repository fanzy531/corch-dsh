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
  runJdSearch: (id: SessionId, request: JdSearchRequest) => Promise<readonly JdSearchJob[]>
  inferJdRoles: (id: SessionId, major: string, direction: string) => Promise<readonly string[]>
  analyzeJdSearch: (id: SessionId, jobs: readonly JdSearchJob[]) => Promise<JdSearchAnalysis>
}

export type JdSearchRequest = {
  major: string
  direction: string
  roles: readonly string[]
  platforms: readonly string[]
  region: string
  publishedWithin: string
  targetCount: string
}

export type JdSearchJob = {
  id: string
  title: string
  company: string
  place: string
  platform: string
  score: number
  summary: string
  sourceUrl?: string
}

export type JdSearchTask = {
  title: string
  count: string
  description: string
  evidenceIds: readonly string[]
}

export type JdSearchAbility = {
  title: string
  level: '高频' | '补充'
  taskCount: number
  sourceCount: number
}

export type JdSearchAnalysis = {
  tasks: readonly JdSearchTask[]
  abilities: readonly JdSearchAbility[]
}
