import type { TargetCombo } from './types'

/**
 * v1 内置经典连招预设(doc.md §6,issue 04 要求至少 2 条,含吹风磁暴陨石推波)。
 * name 使用 i18n key(以 "preset." 开头),展示时由 resolveComboName 翻译。
 */
export const PRESET_COMBOS: readonly TargetCombo[] = [
  {
    comboId: 'preset-tornado-emp-meteor-blast',
    name: 'preset.tornadoEmpMeteorBlast',
    spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
    // 实战常见起手:预切吹风+磁暴待发
    preCastSlots: { d: 'Tornado', f: 'EMP' },
  },
  {
    comboId: 'preset-coldsnap-forge-blast',
    name: 'preset.coldsnapForgeBlast',
    spells: ['ColdSnap', 'ForgeSpirit', 'DeafeningBlast'],
    preCastSlots: {},
  },
  {
    comboId: 'preset-meteor-blast-from-zero',
    name: 'preset.meteorBlastFromZero',
    spells: ['ChaosMeteor', 'DeafeningBlast'],
    preCastSlots: {},
  },
]
