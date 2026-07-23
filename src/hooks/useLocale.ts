import { useState, useCallback } from 'react'
import { DEFAULT_LOCALE, LOCALES, t, type Locale } from '../domain/i18n'

const STORAGE_KEY = 'kombo.locale'

/**
 * 检测系统语言:中文(简/繁,任意 zh-* 地区)默认中文,否则英文。
 * 仅在用户未显式设置过语言(localStorage 无记录)时使用。
 */
function detectSystemLocale(): Locale {
  try {
    // navigator.languages 是偏好列表(优先级递减),取第一个匹配的
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const lang of langs) {
      const lower = (lang ?? '').toLowerCase()
      if (lower.startsWith('zh')) return 'zh'
      if (lower.startsWith('en')) return 'en'
    }
  } catch {
    // Tauri/webview 环境异常时忽略,走默认
  }
  return DEFAULT_LOCALE
}

function load(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'zh' || raw === 'en') return raw
  } catch {
    // 忽略
  }
  // 用户未显式设置过:按系统语言自动选择
  return detectSystemLocale()
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
