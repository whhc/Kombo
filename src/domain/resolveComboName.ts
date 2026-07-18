import type { TargetCombo } from './types'

const PRESET_PREFIX = 'preset.'

/** 连招 name 是否为 i18n key(预设连招用 key,用户自建用原样文本) */
export function isPresetKey(name: string): boolean {
  return name.startsWith(PRESET_PREFIX)
}

/**
 * 解析连招展示名:
 * - name 以 "preset." 开头 → 走 i18n 翻译
 * - 否则(用户自建)→ 原样返回
 *
 * t 函数由调用方传入(绑定 locale),保持纯函数、易测。
 */
export function resolveComboName(combo: TargetCombo, t: (key: string) => string): string {
  return isPresetKey(combo.name) ? t(combo.name) : combo.name
}
