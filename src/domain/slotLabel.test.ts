import { describe, it, expect } from 'vitest'
import { legacyKeyOf, slotReleaseKey } from './keymap'
import type { SpellName } from './types'

describe('slotLabel — 槽位释放键标签(BUG 修复)', () => {
  it('legacyKeyOf: 返回技能的传统专属键', () => {
    expect(legacyKeyOf('Tornado' as SpellName)).toBe('X')
    expect(legacyKeyOf('EMP' as SpellName)).toBe('C')
    expect(legacyKeyOf('ColdSnap' as SpellName)).toBe('Y')
    expect(legacyKeyOf('ChaosMeteor' as SpellName)).toBe('D')
    expect(legacyKeyOf('ForgeSpirit' as SpellName)).toBe('F')
  })

  it('slotReleaseKey: DOTA2 方案下第一槽=D, 第二槽=F', () => {
    expect(slotReleaseKey('DOTA2', 0, 'Tornado')).toBe('D')
    expect(slotReleaseKey('DOTA2', 1, 'EMP')).toBe('F')
  })

  it('slotReleaseKey: LEGACY 方案下显示该技能的传统键(而非 D/F)', () => {
    // Tornado 在任何槽位,LEGACY 下释放键都是 X(传统专属键)
    expect(slotReleaseKey('LEGACY', 0, 'Tornado')).toBe('X')
    expect(slotReleaseKey('LEGACY', 1, 'Tornado')).toBe('X')
    // EMP → C
    expect(slotReleaseKey('LEGACY', 0, 'EMP')).toBe('C')
  })

  it('slotReleaseKey: 槽位为空时返回 null', () => {
    expect(slotReleaseKey('LEGACY', 0, null)).toBeNull()
    expect(slotReleaseKey('DOTA2', 0, null)).toBe('D') // DOTA2 槽位键固定,即使空也显示 D
  })
})
