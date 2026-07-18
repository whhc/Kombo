import type { SpellName } from '../domain/types'
import { spellIconUrl, type IconTheme } from '../domain/icons'

interface Props {
  spell: SpellName
  tooltipName: string
  size?: number
  className?: string
  theme?: IconTheme
}

/** 技能图标。tooltip 走原生 title 属性(零依赖)。
 *  CSS 显式 width/height + object-cover 保证资源比例差异下仍对齐。 */
export function SpellIcon({ spell, tooltipName, size = 40, className, theme = 'DOTA2' }: Props) {
  return (
    <img
      src={spellIconUrl(spell, theme)}
      alt={tooltipName}
      title={tooltipName}
      className={`rounded object-cover ${className ?? ''}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}
