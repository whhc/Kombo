import { useState, useCallback } from 'react'
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

function save(l: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    // 忽略
  }
}

/**
 * 语言状态 hook。同步持久化,下次打开无需重新设置。
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(load)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    save(l)
  }, [])

  const toggle = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh'
      save(next)
      return next
    })
  }, [])

  return {
    locale,
    setLocale,
    toggle,
    t: useCallback((key: string) => t(locale, key), [locale]),
    locales: LOCALES,
  }
}
