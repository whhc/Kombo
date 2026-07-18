import type { Key, ActionNode } from './types'
import type { OrbState } from './orbEngine'
import type { Element, SpellName } from './types'
import { invokeSpell } from './slotEngine'
import { invoke } from './spellBook'

/** 卡尔完整状态 = 元素球 + 双槽位(重导出供 App 层使用) */
export type InvokerState = OrbState & {
  orbs: Element[]
  slots: [SpellName | null, SpellName | null]
}

const ORB_KEYS: ReadonlySet<Key> = new Set(['Q', 'W', 'E'])

/**
 * 统一按键入口:Q/W/E 切球、R 祈唤,其余忽略。
 * 内部委托:切球→直接 FIFO、祈唤→spellBook 查表 + slotEngine 更新槽位。
 *
 * 纯函数,UI 层只需调一次。
 */
export function handleInvokerKey(
  state: InvokerState,
  key: Key,
  now: number,
  lastTimestamp = 0,
): { state: InvokerState; action: ActionNode | null } {
  if (ORB_KEYS.has(key)) {
    // 切球
    const orbs = state.orbs.length >= 3 ? [...state.orbs.slice(1), key as Element] : [...state.orbs, key as Element]
    const action: ActionNode = {
      actionType: 'ORB',
      key,
      timestamp: now,
      timeSinceLastMs: now - lastTimestamp,
    }
    return { state: { ...state, orbs }, action }
  }

  if (key === 'R') {
    const spell = invoke(state.orbs)
    if (spell === null) {
      return { state, action: null } // 不足 3 球或组合无效,忽略
    }
    const { state: next } = invokeSpell(state, spell)
    const action: ActionNode = {
      actionType: 'INVOKE',
      key,
      spellName: spell,
      timestamp: now,
      timeSinceLastMs: now - lastTimestamp,
    }
    return { state: next, action }
  }

  return { state, action: null }
}
