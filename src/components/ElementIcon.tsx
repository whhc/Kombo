import type { Element } from '../domain/types'
import { elementIconUrl, type IconTheme } from '../domain/icons'

interface Props {
  element: Element
  tooltipName: string
  size?: number
  className?: string
  theme?: IconTheme
}

/** 元素球图标(Q/W/E) */
export function ElementIcon({ element, tooltipName, size = 56, className, theme = 'DOTA2' }: Props) {
  return (
    <img
      src={elementIconUrl(element, theme)}
      alt={tooltipName}
      title={tooltipName}
      width={size}
      height={size}
      className={`rounded-full border-2 border-white/30 ${className ?? ''}`}
      loading="lazy"
    />
  )
}
