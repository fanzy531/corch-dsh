/** Copy owned by the firethorn pet settings card. */

/** Simplified Chinese dictionary and the source of the card key set. */
export const zh = {
  title: '火棘宠物',
  description: '控制 DSH 页面中的火棘桌面宠物。',
  enabled: '显示宠物',
  enabledHint: '关闭后只隐藏宠物，不会卸载火棘插件。',
  overridden: '已覆盖',
  reset: '恢复默认',
  readOnly: '本部署的设置为只读。',
  save: '保存',
  saving: '保存中…',
  discard: '放弃修改',
  unsaved: '未保存',
  saveFailed: '设置没有保存成功，已保留供你修改。',
} as const

/** Locale key union for the firethorn settings card. */
export type FirethornPetLocaleKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  title: 'Firethorn pet',
  description: 'Control the Firethorn desktop pet in the DSH page.',
  enabled: 'Show pet',
  enabledHint: 'Turning this off hides the pet without unloading the plugin.',
  overridden: 'Overridden',
  reset: 'Reset to default',
  readOnly: 'This deployment stores settings read-only.',
  save: 'Save',
  saving: 'Saving…',
  discard: 'Discard',
  unsaved: 'Unsaved',
  saveFailed: 'The setting was not saved; it was left for you to correct.',
} satisfies Record<FirethornPetLocaleKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Firethorn pet settings card copy. */
    'settings.firethornPet': FirethornPetLocaleKey
  }
}
