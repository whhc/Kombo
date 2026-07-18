import { heroIconUrl, type IconTheme } from '../domain/icons'
import type { Locale } from '../domain/i18n'
import { t } from '../domain/i18n'

interface Props {
  theme?: IconTheme
  locale: Locale
  size?: number
  className?: string
}

/** 卡尔英雄头像 */
export function HeroIcon({ theme = 'DOTA2', locale, size = 48, className }: Props) {
  return (
    <img
      src={heroIconUrl(theme)}
      alt={t(locale, 'app.title')}
      title={t(locale, 'app.title')}
      width={size}
      height={size}
      className={`rounded-full border-2 border-amber-500/50 ${className ?? ''}`}
    />
  )
}
