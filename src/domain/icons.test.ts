import { describe, it, expect } from 'vitest'
import { spellIconUrl, elementIconUrl } from './icons'
import { ALL_SPELLS } from './spellNames'
import type { Element } from './types'

describe('icons — 图标资源映射 SSOT', () => {
  // tracer bullet:每个技能都有图标 URL
  it('每个 SpellName 都能解析出非空图标 URL', () => {
    for (const spell of ALL_SPELLS) {
      const url = spellIconUrl(spell)
      expect(url, `${spell} 应有图标 URL`).toBeTruthy()
      expect(typeof url).toBe('string')
    }
  })

  it('EMP 的图标文件名含特殊点号(E.M.P._icon)', () => {
    // 这是不规则名,验证映射没有写错
    expect(spellIconUrl('EMP')).toContain('E.M.P.')
  })

  it('每个元素 Q/W/E 都有图标 URL', () => {
    for (const el of ['Q', 'W', 'E'] as Element[]) {
      expect(elementIconUrl(el), `${el} 应有图标`).toBeTruthy()
    }
  })

  it('Q 元素 → Quas 图标,W → Wex,E → Exort', () => {
    expect(elementIconUrl('Q')).toContain('Quas')
    expect(elementIconUrl('W')).toContain('Wex')
    expect(elementIconUrl('E')).toContain('Exort')
  })
})
