import type { TargetCombo } from './types'

/**
 * v1 内置经典连招预设(doc.md §6)。
 * name 使用 auto. 前缀与新建连招相同规则(动态按 locale+theme 拼接)。
 */
export const PRESET_COMBOS: readonly TargetCombo[] = [
  {
    comboId: 'preset-tornado-emp-meteor-blast',
    name: 'auto.Tornado.EMP.ChaosMeteor.DeafeningBlast',
    spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
    preCastSlots: { d: 'Tornado', f: 'EMP' },
  },
  {
    comboId: 'preset-coldsnap-forge-blast',
    name: 'auto.ColdSnap.ForgeSpirit.DeafeningBlast',
    spells: ['ColdSnap', 'ForgeSpirit', 'DeafeningBlast'],
    preCastSlots: {},
  },
  {
    comboId: 'preset-meteor-blast-from-zero',
    name: 'auto.ChaosMeteor.DeafeningBlast',
    spells: ['ChaosMeteor', 'DeafeningBlast'],
    preCastSlots: {},
  },
]
