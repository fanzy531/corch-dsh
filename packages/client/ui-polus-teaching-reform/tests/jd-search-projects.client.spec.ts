// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildJdSearchHtmlReport, buildJdSearchReport, jdSearchProjectPaths, readJdSearchProject, writeJdSearchProject } from '../src/client/jdSearchProjects.ts'
import { buildJdSearchPrompt } from '../src/client/jdSearchPrompt.ts'
import type { JdSearchProject, JdSearchRequest } from '../src/client/types.ts'

const request: JdSearchRequest = {
  major: '智慧养老服务',
  direction: '',
  roles: ['养老护理员'],
  platforms: ['公开网页'],
  region: '四川及西南地区',
  publishedWithin: '最近 90 天',
  targetCount: '5 条（测试）',
}

function project(sessionId = 'session/1'): JdSearchProject {
  return {
    sessionId,
    title: 'JD 搜索 · 智慧养老服务',
    request,
    jobs: [{ id: 'JD-001', title: '养老护理员', company: '示例机构', place: '成都', platform: '公开网页', score: 91, summary: '开展生活照料', body: '<script>alert(1)</script>提供生活照料。', sourceUrl: 'javascript:alert(1)' }],
    confirmedJobIds: ['JD-001'],
    analysis: {
      tasks: [{ title: '实施生活照料', freqHint: 1, description: '完成起居和饮食照护。', evidenceIds: ['JD-001'] }],
      abilities: [{ title: '生活照护能力', level: '高频', taskCount: 1, sourceCount: 1 }],
    },
    jobsPath: 'outputs/jd-search/session_1/jobs.json',
    updatedAt: '2026-10-25T12:00:00.000Z',
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe('JD search project artifacts', () => {
  it('isolates project artifacts by a sanitized session id', () => {
    expect(jdSearchProjectPaths('session/1')).toEqual({
      folder: 'outputs/jd-search/session_1',
      jobs: 'outputs/jd-search/session_1/jobs.json',
      report: 'outputs/jd-search/session_1/typical-work-tasks.md',
      htmlReport: 'outputs/jd-search/session_1/typical-work-tasks.html',
    })
  })

  it('keeps the project available in memory when browser storage rejects writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota exceeded', 'QuotaExceededError') })
    const record = project()
    writeJdSearchProject(record)
    expect(readJdSearchProject(record.sessionId)).toEqual(record)
  })

  it('renders sample frequency and source evidence in Markdown, escaping raw HTML and unsafe links', () => {
    const report = buildJdSearchReport(project())
    expect(report).toContain('| 实施生活照料 | 100% | JD-001 |')
    expect(report).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(report).not.toContain('[来源](javascript:')
  })

  it('renders a standalone template-styled HTML report and escapes JD content', () => {
    const report = buildJdSearchHtmlReport(project())
    expect(report).toContain('<title>智慧养老服务 · 典型工作任务报告</title>')
    expect(report).toContain('.cover h1')
    expect(report).toContain('实施生活照料')
    expect(report).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(report).not.toContain('<script>alert(1)</script>')
    expect(report).not.toContain('href="javascript:')
  })

  it('applies the five-result limit only to the explicit test option', () => {
    const prompt5 = buildJdSearchPrompt({ ...request, targetCount: '5 条（测试）' })
    const prompt50 = buildJdSearchPrompt({ ...request, targetCount: '50-100 条' })
    expect(prompt5).toContain('最多返回 5 条有效 JD')
    expect(prompt50).not.toContain('最多返回 5 条有效 JD')
  })
})
