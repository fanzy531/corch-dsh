/** Host half of CLAB Creator: a small Conversation-backed Markdown save tool. */
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'

export { type ClabContentEventData, type ClabContentStage } from './types.ts'

/** Cordis plugin name. */
export const name = 'tool-clab-creator'
/** Services consumed by the model-facing tool. */
export const inject = ['tools', 'systemPrompt']

/** Register the Conversation-backed creator save tool. */
export function apply(ctx: Context): void {
  ctx.systemPrompt.section({
    name: 'tool:clab-creator',
    order: 116,
    text: 'When the user is working on a social content project, use clab_creator to save an outline, draft, or final Markdown snapshot into the creator Conversation. Do not create a second chat system. The tool is optional and only applies to the current project.',
  })
  ctx.tools.register(defineTool({
    name: 'clab_creator',
    description: 'Save one Markdown snapshot from the current content-creation Conversation. Use this after searching, outlining, drafting, or finalizing content.',
    parameters: {
      stage: { type: 'string', required: true, description: 'Snapshot stage: outline, draft, or final.', enum: ['outline', 'draft', 'final'] },
      title: { type: 'string', required: true, description: 'Current project title.' },
      markdown: { type: 'string', required: true, description: 'The complete Markdown snapshot to save.' },
      platform: { type: 'string', required: true, description: 'Target platform: xiaohongshu or wordpress.', enum: ['xiaohongshu', 'wordpress'] },
      status: { type: 'string', required: true, description: 'Project status after saving: draft, final, or published.', enum: ['draft', 'final', 'published'] },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { saved: { type: 'boolean', required: true }, stage: { type: 'string', required: true } },
      },
      render: (_args, value) => [{ type: 'text', text: `creator snapshot saved: ${value.stage}` }],
    },
    execute(args, exec) {
      if (exec.agent === undefined) throw new Error('clab_creator requires a calling agent')
      exec.agent.session.append('clab/content', {
        stage: args.stage,
        title: args.title,
        markdown: args.markdown,
        platform: args.platform,
        status: args.status,
      })
      return Promise.resolve({ saved: true, stage: args.stage })
    },
  }))
}
