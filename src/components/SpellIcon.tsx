import type { SpellName } from '../domain/types'
import { spellIconUrl } from '../domain/icons'

interface Props {
  spell: SpellName
  /** tooltip 与 alt 文案(由父组件按 locale 传入已翻译的技能名) */
  tooltipName: string
  size?: number
  className?: string
}

/** 技能图标。tooltip 走原生 title 属性(零依赖) */
export function SpellIcon({ spell, tooltipName, size = 40, className }: Props) {
  return (
    <img
      src={spellIconUrl(spell)}
      alt={tooltipName}
      title={tooltipName}
      width={size}
      height={size}
      className={`rounded ${className ?? ''}`}
      loading="lazy"
    />
  )
}
