import { t as translate, type Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

/** 测试用默认中文 locale + t(绑定 zh) */
export const ZH_LOCALE: Locale = 'zh'
export const EN_LOCALE: Locale = 'en'

export const tZh = (key: string) => translate('zh', key)
export const tEn = (key: string) => translate('en', key)

/** 测试用默认图标主题 */
export const DOTA2_THEME: IconTheme = 'DOTA2'
export const DOTA1_THEME: IconTheme = 'DOTA1'
