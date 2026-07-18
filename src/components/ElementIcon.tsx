import type { Element } from '../domain/types'
import { elementIconUrl, type IconTheme } from '../domain/icons'

interface Props {
  element: Element
  tooltipName: string
  size?: number
  className?: string
  theme?: IconTheme
}

/** 元素球图标(Q/W/E)。DOTA2 圆形,dota1 方框 */
export function ElementIcon({ element, tooltipName, size = 56, className, theme = 'DOTA2' }: Props) {
  // dota1 头像/球用方框,dota2 用圆形,保持主题视觉一致
  const shape = theme === 'DOTA1' ? 'rounded-md border-2 border-white/30' : 'rounded-full border-2 border-white/30'
  return (
    <img
      src={elementIconUrl(element, theme)}
      alt={tooltipName}
      title={tooltipName}
      width={size}
      height={size}
      className={`${shape} object-cover ${className ?? ''}`}
      loading="lazy"
    />
  )
}
