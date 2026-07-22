import type { KeybindScheme } from './keymap'

/** 用户设置(doc.md §2.4) */
export interface UserSettings {
  iconTheme: 'DOTA1' | 'DOTA2'
  /** raw 值,实际生效受 iconTheme 约束 */
  keybindScheme: KeybindScheme
  /** 是否显示连招的最优键序提示(求解器输出);默认 true */
  showOptimalPath: boolean
}

/**
 * 计算实际生效的键位方案(doc.md §2.4 绑定关系):
 * - DOTA1 图标 → 强制 LEGACY
 * - DOTA2 图标 → 尊重 raw scheme
 */
export function effectiveScheme(s: UserSettings): KeybindScheme {
  return s.iconTheme === 'DOTA1' ? 'LEGACY' : s.keybindScheme
}

/** 默认设置:DOTA2 图标 + DOTA2 键位(grill 共识) */
export const DEFAULT_SETTINGS: UserSettings = {
  iconTheme: 'DOTA2',
  keybindScheme: 'DOTA2',
  showOptimalPath: true,
}
