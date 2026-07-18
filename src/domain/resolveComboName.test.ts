import { describe, it, expect } from 'vitest'
import { resolveComboName, isAutoName } from './resolveComboName'
import type { TargetCombo } from './types'

describe('resolveComboName — 连招名展示解析', () => {
  it('isAutoName: 以 auto. 开头返回 true', () => {
    expect(isAutoName('auto.Tornado.EMP')).toBe(true)
    expect(isAutoName('我的连招')).toBe(false)
  })

  it('resolveComboName: auto. 名称按 locale+theme 动态拼接', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 'auto.Tornado.EMP.ChaosMeteor',
      spells: ['Tornado', 'EMP', 'ChaosMeteor'],
      preCastSlots: {},
    }
    // zh/DOTA2: 强袭飓风 → 电磁脉冲 → 混沌陨石
    expect(resolveComboName(combo, () => '', 'zh', 'DOTA2')).toBe('强袭飓风 → 电磁脉冲 → 混沌陨石')
    // zh/DOTA1: Tornado 旧译"龙卷风"
    expect(resolveComboName(combo, () => '', 'zh', 'DOTA1')).toBe('龙卷风 → 电磁脉冲 → 混沌陨石')
    // en/DOTA2
    expect(resolveComboName(combo, () => '', 'en', 'DOTA2')).toBe('Tornado → EMP → Chaos Meteor')
  })

  it('resolveComboName: auto. 无 locale/theme 时回退到原始 key', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 'auto.Tornado',
      spells: ['Tornado'],
      preCastSlots: {},
    }
    expect(resolveComboName(combo, () => '')).toBe('auto.Tornado')
  })

  it('resolveComboName: 用户自建原样返回', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: '我的自定义连招',
      spells: [],
      preCastSlots: {},
    }
    expect(resolveComboName(combo, () => '不调用')).toBe('我的自定义连招')
  })
})
