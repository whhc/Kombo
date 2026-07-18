import type { TargetCombo } from './types'

/** v1 内置经典连招预设(doc.md §6,issue 04 要求至少 2 条,含吹风磁暴陨石推波) */
export const PRESET_COMBOS: readonly TargetCombo[] = [
  {
    comboId: 'preset-tornado-emp-meteor-blast',
    name: '吹风 → 磁暴 → 陨石 → 推波',
    spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
    // 实战常见起手:预切吹风+磁暴待发
    preCastSlots: { d: 'Tornado', f: 'EMP' },
  },
  {
    comboId: 'preset-coldsnap-forge-blast',
    name: '急冷 → 熔炉 → 推波',
    spells: ['ColdSnap', 'ForgeSpirit', 'DeafeningBlast'],
    preCastSlots: {},
  },
  {
    comboId: 'preset-meteor-blast-from-zero',
    name: '陨石 → 推波(从零开始)',
    spells: ['ChaosMeteor', 'DeafeningBlast'],
    preCastSlots: {},
  },
]
