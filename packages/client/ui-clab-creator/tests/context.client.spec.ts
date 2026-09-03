import { describe, expect, it } from 'vitest'
import { materialContextBlock, removeMaterialContext } from '../src/client/context.ts'
import type { ClabMaterial } from '../src/client/model.ts'

const material: ClabMaterial = {
  id: 'notes-1',
  name: '选题资料.md',
  type: 'upload',
  folder: 'uploads',
  status: 'ready',
  preview: '# 资料标题\n\n资料正文',
  previewKind: 'text',
}

describe('CLAB material Conversation context', () => {
  it('creates an editable draft block from a material preview', () => {
    expect(materialContextBlock(material)).toContain('【CLAB 参考资料开始：选题资料.md】')
    expect(materialContextBlock(material)).toContain('# 资料标题')
    expect(materialContextBlock(material)).toContain('【CLAB 参考资料结束：选题资料.md】')
  })

  it('removes only the exact material block and preserves surrounding instruction text', () => {
    const draft = `请整理以下资料${materialContextBlock(material)}\n\n输出一份大纲。`
    expect(removeMaterialContext(draft, material)).toBe('请整理以下资料\n\n输出一份大纲。')
  })
})
