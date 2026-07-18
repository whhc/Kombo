import type { Key, ActionNode, Element, SpellName } from './types'
import type { OrbState } from './orbEngine'
import { invokeSpell } from './slotEngine'
import { invoke } from './spellBook'
import type { KeybindScheme } from './keymap'
import { resolveCastKey } from './keymap'

/** 卡尔完整状态 = 元素球 + 双槽位(重导出供 App 层使用) */
export type InvokerState = OrbState & {
  orbs: Element[]
  slots: [SpellName | null, SpellName | null]
}

const ORB_KEYS: ReadonlySet<Key> = new Set(['Q', 'W', 'E'])

/**
 * 统一按键入口(doc.md §3 链路核心):
 *  - Q/W/E → 切元素球(FIFO)
 *  - R → 祈唤(spellBook 查表 + slotEngine 更新)
 *  - 释放键(随 scheme)→ CAST / MISS_CAST
 *  - 其他键 → 忽略
 *
 * @param scheme 已生效的键位方案(由上层 settings.effectiveScheme 算出)
 */
export function handleInvokerKey(
  state: InvokerState,
  key: Key,
  now: number,
  lastTimestamp = 0,
  scheme: KeybindScheme = 'LEGACY',
): { state: InvokerState; action: ActionNode | null } {
  if (ORB_KEYS.has(key)) {
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
      return { state, action: null }
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

  // 释放键
  const resolved = resolveCastKey(key, scheme)
  if (resolved !== null) {
    const targetSpell: SpellName | null =
      resolved.type === 'spell' ? resolved.spell : state.slots[resolved.index]
    const inSlots = targetSpell !== null && state.slots.includes(targetSpell)
    const action: ActionNode = {
      actionType: inSlots ? 'CAST' : 'MISS_CAST',
      key,
      spellName: targetSpell ?? undefined,
      timestamp: now,
      timeSinceLastMs: now - lastTimestamp,
    }
    return { state, action }
  }

  return { state, action: null }
}
