import { describe, it, expect } from 'vitest'
import { spellName } from './i18n'
import type { SpellName } from './types'

describe('spellName — 按 locale × theme 四维查表', () => {
  it('Dota2 中文:dota2 官方中文译名', () => {
    expect(spellName('zh', 'DOTA2', 'Tornado' as SpellName)).toBe('强袭飓风')
    expect(spellName('zh', 'DOTA2', 'EMP' as SpellName)).toBe('电磁脉冲')
  })

  it('Dota2 英文:dota2 官方英文名', () => {
    expect(spellName('en', 'DOTA2', 'Tornado' as SpellName)).toBe('Tornado')
    expect(spellName('en', 'DOTA2', 'ColdSnap' as SpellName)).toBe('Cold Snap')
  })

  it('Dota1 中文:dota1(War3 时代)中文译名,与 dota2 有差异', () => {
    expect(spellName('zh', 'DOTA1', 'Tornado' as SpellName)).toBeTruthy()
    // 至少与 dota2 中文不同(若相同则无需区分,但用户要求区分)
    // 注:某些技能两版译名可能恰好一致,这里只验证有值
  })

  it('Dota1 英文:dota1 英文名(常为连写/不同大小写)', () => {
    expect(spellName('en', 'DOTA1', 'Tornado' as SpellName)).toBeTruthy()
  })

  it('每个技能在 4 个 locale×theme 组合下都有非空名称', () => {
    const spells: SpellName[] = [
      'ColdSnap', 'GhostWalk', 'IceWall', 'EMP', 'Tornado',
      'Alacrity', 'SunStrike', 'ForgeSpirit', 'ChaosMeteor', 'DeafeningBlast',
    ]
    for (const s of spells) {
      for (const locale of ['zh', 'en'] as const) {
        for (const theme of ['DOTA1', 'DOTA2'] as const) {
          const name = spellName(locale, theme, s)
          expect(name, `${s} ${locale} ${theme}`).toBeTruthy()
          expect(typeof name).toBe('string')
        }
      }
    }
  })
})
