import { describe, it, expect } from 'vitest'
import { validatePreCastPrefix, isValidCombo } from './combo'
import type { TargetCombo } from './types'

describe('combo — 连招建模与校验', () => {
  // tracer bullet:预切技能是 spells 前缀时合法
  it('validatePreCastPrefix: 预切为 spells 前缀时返回 true', () => {
    const combo: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
      preCastSlots: { d: 'Tornado', f: 'EMP' },
    }
    expect(validatePreCastPrefix(combo)).toBe(true)
  })

  it('validatePreCastPrefix: 预切技能不在 spells 前缀位置时返回 false', () => {
    // spells = [Tornado, EMP, Meteor],预切 d=EMP(第二位)但 f=Meteor(第三位,非前缀末尾)
    // 前缀应是 spells 的前 N 个:d/f 组合必须对应 spells[0..N-1]
    const combo: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: ['Tornado', 'EMP', 'ChaosMeteor'],
      preCastSlots: { d: 'ChaosMeteor', f: 'Tornado' }, // 顺序乱、且 Meteor 是第3位
    }
    expect(validatePreCastPrefix(combo)).toBe(false)
  })

  it('validatePreCastPrefix: 空 preCastSlots 视为合法(从零开始练)', () => {
    const combo: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: ['Tornado', 'EMP'],
      preCastSlots: {},
    }
    expect(validatePreCastPrefix(combo)).toBe(true)
  })

  it('isValidCombo: spells 为空 → 不合法', () => {
    const combo: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: [],
      preCastSlots: {},
    }
    expect(isValidCombo(combo)).toBe(false)
  })

  it('isValidCombo: spells 非空 + 合法前缀 → 合法', () => {
    const combo: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: ['Tornado'],
      preCastSlots: { d: 'Tornado' },
    }
    expect(isValidCombo(combo)).toBe(true)
  })
})
