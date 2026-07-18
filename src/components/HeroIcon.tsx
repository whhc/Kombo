import { heroIconUrl, type IconTheme } from '../domain/icons'
import type { Locale } from '../domain/i18n'
import { t } from '../domain/i18n'

interface Props {
  theme?: IconTheme
  locale: Locale
  size?: number
  className?: string
  /** 点击切换图标主题(DOTA1↔DOTA2) */
  onClick?: () => void
}

/** 卡尔英雄头像。可点击切换 dota1/dota2 图标主题。dota1 方框,dota2 圆形 */
export function HeroIcon({ theme = 'DOTA2', locale, size = 48, className, onClick }: Props) {
  const shape = theme === 'DOTA1' ? 'rounded-md border-2 border-amber-500/50' : 'rounded-full border-2 border-amber-500/50'
  const clickable = onClick !== undefined
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      aria-label={`${t(locale, 'settings.iconThemeToggle')}: ${theme}`}
      title={`${t(locale, 'settings.iconThemeToggle')}: ${theme}`}
      className={`inline-flex ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} ${className ?? ''}`}
    >
      <img
        src={heroIconUrl(theme)}
        alt={t(locale, 'app.title')}
        width={size}
        height={size}
        className={`${shape} object-cover`}
      />
    </button>
  )
}
