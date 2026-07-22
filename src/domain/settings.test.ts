import { describe, it, expect } from 'vitest'
import { effectiveScheme, DEFAULT_SETTINGS } from './settings'

describe('settings — 图标主题与键位方案绑定(doc.md §2.4)', () => {
  it('DOTA1 图标强制 LEGACY 键位(即使 raw 写 DOTA2 也降级为 LEGACY)', () => {
    expect(effectiveScheme({ iconTheme: 'DOTA1', keybindScheme: 'DOTA2', showOptimalPath: true })).toBe('LEGACY')
    expect(effectiveScheme({ iconTheme: 'DOTA1', keybindScheme: 'LEGACY', showOptimalPath: true })).toBe('LEGACY')
  })

  it('DOTA2 图标下尊重 raw scheme', () => {
    expect(effectiveScheme({ iconTheme: 'DOTA2', keybindScheme: 'LEGACY', showOptimalPath: true })).toBe('LEGACY')
    expect(effectiveScheme({ iconTheme: 'DOTA2', keybindScheme: 'DOTA2', showOptimalPath: true })).toBe('DOTA2')
  })

  it('默认设置:DOTA2 图标 + DOTA2 键位(用户确认 DOTA2 图标默认 DOTA2)', () => {
    expect(DEFAULT_SETTINGS).toEqual({ iconTheme: 'DOTA2', keybindScheme: 'DOTA2', showOptimalPath: true })
  })
})
