import type { TargetCombo, SpellName } from './types'
import { spellName } from './i18n'
import type { Locale, IconTheme } from './i18n'

const AUTO_PREFIX = 'auto.'

export function isAutoName(name: string): boolean {
  return name.startsWith(AUTO_PREFIX)
}

/**
 * 解析连招展示名:
 * - auto.* → 按 locale+theme 动态拼接技能全称(例"强袭飓风 → 电磁脉冲")
 * - 其他 → 原样(用户自建)
 *
 * 注:v1.0 预设曾用 preset.* 格式,已迁移至 auto.*(seed 时 comboId 覆盖)。
 */
export function resolveComboName(
  combo: TargetCombo,
  _t: (key: string) => string,
  locale?: Locale,
  theme?: IconTheme,
): string {
  if (isAutoName(combo.name)) {
    const parts = combo.name.slice(AUTO_PREFIX.length).split('.')
    const spells = parts.filter((p): p is string => p.length > 0)
    if (spells.length === 0 || !locale || !theme) return combo.name
    return spells.map((s) => spellName(locale, theme, s as SpellName)).join(' → ')
  }
  return combo.name
}
