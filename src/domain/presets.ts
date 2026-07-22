import type { TargetCombo } from './types'

/**
 * v1 内置经典连招预设(doc.md §6)。
 * name 使用 auto. 前缀与新建连招相同规则(动态按 locale+theme 拼接)。
 *
 * ── 预切槽位语义(与 DOTA2 真实机制一致) ──
 * 新合成的技能占据 D 槽(首位),原 D 槽技能被推到 F 槽(slotEngine 规则1)。
 * 故:
 *   - preCastSlots.d = 玩家最后一次合成的技能(= 后释放的)
 *   - preCastSlots.f = 玩家先合成的技能(= 先释放的,已被推到 F)
 * 即 spells[0] 先释放(对应 F 键),spells[1] 后释放(对应 D 键),
 *    合成顺序与 spells 顺序相反:先合 spells[1] 再合 spells[0]。
 *
 * 例:连招 spells=[Tornado, EMP] 表示"先打吹风、再打磁暴",
 *    玩家需先 R 合 Tornado(进 D)→ R 合 EMP(进 D,吹风推到 F),
 *    然后释放:F(吹风/spells[0]) → D(磁暴/spells[1])。
 *    故 preCastSlots = { d: EMP, f: Tornado }。
 */
export const PRESET_COMBOS: readonly TargetCombo[] = [
  {
    comboId: 'preset-tornado-emp-meteor-blast',
    name: 'auto.Tornado.EMP.ChaosMeteor.DeafeningBlast',
    // 释放顺序:吹风 → 磁暴 → 陨石 → 声波
    // 合成顺序(逆):先合吹风 → 再合磁暴(吹风推 F)→ 起手头顶 = 磁暴配方 WWW
    spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
    preCastSlots: { d: 'EMP', f: 'Tornado' },
  },
  {
    comboId: 'preset-coldsnap-forge-blast',
    name: 'auto.ColdSnap.ForgeSpirit.DeafeningBlast',
    // 无预切:从零开始练,spells 即释放顺序
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
