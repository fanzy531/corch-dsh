import type { ClabMaterial } from './model.ts'

const START = '【CLAB 参考资料开始：'
const END = '【CLAB 参考资料结束：'

/** Build the human-readable block inserted into the native Conversation draft. */
export function materialContextBlock(material: ClabMaterial): string {
  const preview = material.previewKind === 'image'
    ? `图片资料“${material.name}”已加入本次创作上下文，请结合资料库中的预览使用。`
    : material.preview ?? `资料“${material.name}”暂无可用预览内容。`
  return `\n\n${START}${material.name}】\n${preview}\n${END}${material.name}】`
}

/** Remove one exact staged block without removing user edits around it. */
export function removeMaterialContext(draft: string, material: ClabMaterial): string {
  return draft.replace(materialContextBlock(material), '').replace(/^\n{3,}/u, '\n\n').trimStart()
}
