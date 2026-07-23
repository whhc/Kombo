import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocale } from './useLocale'

describe('useLocale — 语言状态与系统语言探测', () => {
  const originalLanguages = navigator.languages
  const originalLanguage = navigator.language

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    // 还原 navigator
    Object.defineProperty(navigator, 'languages', { value: originalLanguages, configurable: true })
    Object.defineProperty(navigator, 'language', { value: originalLanguage, configurable: true })
  })

  function setNavigatorLanguages(langs: string[]) {
    Object.defineProperty(navigator, 'languages', { value: langs, configurable: true })
    Object.defineProperty(navigator, 'language', { value: langs[0] ?? 'en', configurable: true })
  }

  it('系统中文(简体)→ 默认中文', () => {
    setNavigatorLanguages(['zh-CN', 'zh', 'en'])
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('zh')
  })

  it('系统中文(繁体)→ 默认中文', () => {
    setNavigatorLanguages(['zh-TW', 'zh-Hant'])
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('zh')
  })

  it('系统英文 → 默认英文', () => {
    setNavigatorLanguages(['en-US', 'en'])
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('en')
  })

  it('系统其他语言(非中英)→ 回退默认', () => {
    setNavigatorLanguages(['ja-JP', 'ja'])
    const { result } = renderHook(() => useLocale())
    // 非 zh/en → 走 DEFAULT_LOCALE(zh)
    expect(result.current.locale).toBe('zh')
  })

  it('多语言偏好含中文 → 优先匹配中文', () => {
    // 用户偏好列表里中文排在英文前
    setNavigatorLanguages(['fr-FR', 'zh-Hans', 'en'])
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('zh')
  })

  it('localStorage 已有显式设置 → 覆盖系统探测', () => {
    localStorage.setItem('kombo.locale', 'en')
    setNavigatorLanguages(['zh-CN']) // 系统是中文
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('en') // 显式设置优先
  })

  it('toggle 切换语言并持久化', () => {
    setNavigatorLanguages(['zh-CN'])
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('zh')
    act(() => result.current.toggle())
    expect(result.current.locale).toBe('en')
    expect(localStorage.getItem('kombo.locale')).toBe('en')
  })
})
