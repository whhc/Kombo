import type { SpellName } from './types'

/** 卡尔完整状态:头顶元素球 + 双槽位([第一顺位, 第二顺位]) */
export interface InvokerState {
  orbs: import('./types').Element[]
  slots: [SpellName | null, SpellName | null]
}

/**
 * 祈唤一个技能到槽位,按 doc.md §2.2 三规则更新:
 *  1. 新技能不在槽位 → 进第一顺位,原第一降到第二,原第二被移除
 *  2. 新技能已在第一顺位 → 槽位顺序不变(本工具不模拟冷却)
 *  3. 新技能在第二顺位 → 提至第一,原第一降到第二
 *
 * 纯函数。orbs 不在此变更(祈唤不改变头顶球,只读取)。
 */
export function invokeSpell(state: InvokerState, spell: SpellName): { state: InvokerState } {
  const [first, second] = state.slots

  // 规则2:已在第一顺位
  if (first === spell) {
    return { state }
  }

  // 规则3:在第二顺位 → 提至第一,原第一降第二
  if (second === spell) {
    return { state: { ...state, slots: [spell, first] } }
  }

  // 规则1:不在槽位 → 进第一,原第一降第二,原第二移除
  return { state: { ...state, slots: [spell, first] } }
}
