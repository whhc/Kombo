import { heroIconUrl, type IconTheme } from '../domain/icons'
import type { Locale } from '../domain/i18n'
import { t } from '../domain/i18n'

interface Props {
  theme?: IconTheme
  locale: Locale
  size?: number
  className?: string
}

/** 卡尔英雄头像(顶栏 logo)。dota1 方框,dota2 圆形。
 *  纯展示;图标主题切换已移至齿轮设置面板。
 *  用 CSS 显式 width/height + object-cover 保证不同比例资源裁剪对齐。 */
export function HeroIcon({ theme = 'DOTA2', locale, size = 48, className }: Props) {
  const shape = theme === 'DOTA1' ? 'rounded-md border-2 border-amber-500/50' : 'rounded-full border-2 border-amber-500/50'
  return (
    <span
      aria-label={`${t(locale, 'settings.iconThemeToggle')}: ${theme}`}
      title={`${t(locale, 'settings.iconThemeToggle')}: ${theme}`}
      className={`inline-flex items-center justify-center overflow-hidden ${shape} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src={heroIconUrl(theme)}
        alt={t(locale, 'app.title')}
        className="object-cover"
        style={{ width: size, height: size }}
      />
    </span>
  )
}
