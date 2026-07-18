import { useEffect, useState, useCallback } from 'react'
import { DEFAULT_LOCALE, LOCALES, t, type Locale } from '../domain/i18n'

const STORAGE_KEY = 'kombo.locale'

function load(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'zh' || raw === 'en') return raw
  } catch {
    // 忽略
  }
  return DEFAULT_LOCALE
}

/**
 * 语言状态 hook。返回当前 locale、切换函数、以及绑定到 locale 的 t。
 * localStorage 记忆;组件用返回的 t 渲染文案。
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // 忽略
    }
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const toggle = useCallback(() => {
    setLocaleState((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  return {
    locale,
    setLocale,
    toggle,
    /** 绑定当前 locale 的翻译函数 */
    t: useCallback((key: string) => t(locale, key), [locale]),
    locales: LOCALES,
  }
}
