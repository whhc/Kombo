import { t as translate, type Locale } from '../domain/i18n'

/** 测试用默认中文 locale + t(绑定 zh) */
export const ZH_LOCALE: Locale = 'zh'
export const EN_LOCALE: Locale = 'en'

export const tZh = (key: string) => translate('zh', key)
export const tEn = (key: string) => translate('en', key)
