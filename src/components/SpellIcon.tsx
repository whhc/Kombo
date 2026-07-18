import type { SpellName } from '../domain/types'
import { spellIconUrl, type IconTheme } from '../domain/icons'

interface Props {
  spell: SpellName
  tooltipName: string
  size?: number
  className?: string
  theme?: IconTheme
}

/** 技能图标。tooltip 走原生 title 属性(零依赖) */
export function SpellIcon({ spell, tooltipName, size = 40, className, theme = 'DOTA2' }: Props) {
  return (
    <img
      src={spellIconUrl(spell, theme)}
      alt={tooltipName}
      title={tooltipName}
      width={size}
      height={size}
      className={`rounded ${className ?? ''}`}
      loading="lazy"
    />
  )
}
