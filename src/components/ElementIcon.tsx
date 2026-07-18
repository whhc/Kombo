import type { Element } from '../domain/types'
import { elementIconUrl } from '../domain/icons'

interface Props {
  element: Element
  /** tooltip/alt 文案(已翻译的元素名) */
  tooltipName: string
  size?: number
  className?: string
}

/** 元素球图标(Q/W/E) */
export function ElementIcon({ element, tooltipName, size = 56, className }: Props) {
  return (
    <img
      src={elementIconUrl(element)}
      alt={tooltipName}
      title={tooltipName}
      width={size}
      height={size}
      className={`rounded-full border-2 border-white/30 ${className ?? ''}`}
      loading="lazy"
    />
  )
}
