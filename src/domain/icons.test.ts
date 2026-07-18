import { describe, it, expect } from 'vitest'
import { spellIconUrl, elementIconUrl, heroIconUrl } from './icons'
import { ALL_SPELLS } from './spellNames'
import type { Element } from './types'

describe('icons — 图标资源映射 SSOT(双主题)', () => {
  it('每个 SpellName 在 DOTA2 主题下都有非空 URL', () => {
    for (const spell of ALL_SPELLS) {
      const url = spellIconUrl(spell, 'DOTA2')
      expect(url, `${spell} DOTA2 应有图标`).toBeTruthy()
    }
  })

  it('每个 SpellName 在 DOTA1 主题下都有非空 URL', () => {
    for (const spell of ALL_SPELLS) {
      const url = spellIconUrl(spell, 'DOTA1')
      expect(url, `${spell} DOTA1 应有图标`).toBeTruthy()
    }
  })

  it('DOTA2 主题 EMP 文件名含 E.M.P.', () => {
    expect(spellIconUrl('EMP', 'DOTA2')).toContain('E.M.P.')
  })

  it('DOTA1 主题与 DOTA2 主题返回不同 URL(资源分流)', () => {
    // 同技能两个主题应来自不同目录
    expect(spellIconUrl('Tornado', 'DOTA1')).not.toBe(spellIconUrl('Tornado', 'DOTA2'))
  })

  it('每个元素 Q/W/E 在两个主题下都有 URL', () => {
    for (const el of ['Q', 'W', 'E'] as Element[]) {
      expect(elementIconUrl(el, 'DOTA2')).toBeTruthy()
      expect(elementIconUrl(el, 'DOTA1')).toBeTruthy()
    }
  })

  it('英雄头像图标在两个主题下都有 URL', () => {
    expect(heroIconUrl('DOTA2')).toBeTruthy()
    expect(heroIconUrl('DOTA1')).toBeTruthy()
  })

  it('未传 theme 时默认 DOTA2(向后兼容)', () => {
    expect(spellIconUrl('Tornado')).toBeTruthy()
    expect(elementIconUrl('Q')).toBeTruthy()
  })
})
