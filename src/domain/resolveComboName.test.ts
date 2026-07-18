import { describe, it, expect } from 'vitest'
import { resolveComboName, isPresetKey } from './resolveComboName'
import { t } from './i18n'
import type { TargetCombo } from './types'

describe('resolveComboName — 连招名展示解析', () => {
  it('isPresetKey: 以 preset. 开头返回 true', () => {
    expect(isPresetKey('preset.tornadoEmpMeteorBlast')).toBe(true)
    expect(isPresetKey('我的连招')).toBe(false)
  })

  it('resolveComboName: preset key 按语言翻译', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 'preset.tornadoEmpMeteorBlast',
      spells: [],
      preCastSlots: {},
    }
    expect(resolveComboName(combo, (k) => t('zh', k))).toBe('吹风 → 磁暴 → 陨石 → 推波')
    expect(resolveComboName(combo, (k) => t('en', k))).toBe('Tornado → EMP → Meteor → Blast')
  })

  it('resolveComboName: 用户自建(非 preset key)原样返回', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: '我的自定义连招',
      spells: [],
      preCastSlots: {},
    }
    expect(resolveComboName(combo, () => '不调用')).toBe('我的自定义连招')
  })
})
