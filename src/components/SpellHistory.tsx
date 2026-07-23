import type { SpellName } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { spellName as spellNameFn } from '../domain/i18n'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  spells: SpellName[]
  theme: IconTheme
  locale: Locale
}

/** 释放历史:FIFO 列表(最多 10 个),用于自由/内嵌模式。
 *  空历史时占位固定高度,避免增删条目时下方内容(如配方面板)位置抖动。 */
export function SpellHistory({ spells, theme, locale }: Props) {
  const recent = spells.slice(-10) // 只显示最近 10 个

  if (recent.length === 0) {
    // 占位:与有内容时的行高一致(图标 24px),保持布局稳定
    return <div className="h-6" aria-label="释放历史" />
  }

  return (
    <div className="flex gap-1 flex-wrap justify-center min-h-6" aria-label="释放历史">
      {recent.map((s, i) => (
        <SpellIcon key={i} spell={s} tooltipName={spellNameFn(locale, theme, s)} size={24} theme={theme} className="opacity-70" />
      ))}
    </div>
  )
}
