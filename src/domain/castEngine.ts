import type { SpellName } from './types'
import type { InvokerState } from './invokerEngine'
import type { KeybindScheme } from './keymap'
import { resolveCastKey } from './keymap'

export type CastResult = {
  /** CAST=成功释放 / MISS_CAST=空放(技能不在槽位) / null=该键非释放键 */
  result: 'CAST' | 'MISS_CAST' | null
  spellName: SpellName | null
}

/**
 * 释放识别(doc.md §2.5)。
 * 统一语义:释放键对应技能必须在当前双槽位里才 CAST,否则 MISS_CAST。
 * - LEGACY:按专属键(如 X=Tornado),Tornado 在 slots 里则 CAST
 * - DOTA2:D→第一槽、F→第二槽,槽空则 MISS_CAST
 */
export function cast(state: InvokerState, key: string, scheme: KeybindScheme): CastResult {
  const resolved = resolveCastKey(key, scheme)
  if (resolved === null) {
    return { result: null, spellName: null }
  }

  const targetSpell: SpellName | null =
    resolved.type === 'spell' ? resolved.spell : state.slots[resolved.index]

  if (targetSpell === null) {
    // DOTA2 槽位为空
    return { result: 'MISS_CAST', spellName: null }
  }

  // 该技能必须在当前双槽位里
  const inSlots = state.slots.includes(targetSpell)
  return {
    result: inSlots ? 'CAST' : 'MISS_CAST',
    spellName: targetSpell,
  }
}
