import { describe, it, expect } from 'vitest'
import { handleInvokerKey, type InvokerState } from './invokerEngine'
import type { KeybindScheme } from './keymap'

const empty: InvokerState = { orbs: [], slots: [null, null] }
const LEGACY: KeybindScheme = 'LEGACY'
const DOTA2: KeybindScheme = 'DOTA2'

describe('invokerEngine — 统一按键驱动(切球 + 祈唤)', () => {
  it('切 Q/W/E 更新元素球,槽位不变', () => {
    let r = handleInvokerKey(empty, 'Q', 100, 0, LEGACY)
    expect(r.state.orbs).toEqual(['Q'])
    expect(r.state.slots).toEqual([null, null])
    expect(r.action!.actionType).toBe('ORB')
  })

  it('按 R 时若头顶 3 球构成技能,祈唤入槽位(actionType=INVOKE)', () => {
    // 切 Q Q Q
    let s = empty
    let lastTs = 0
    for (const [k, t] of [['Q', 100], ['Q', 150], ['Q', 200]] as const) {
      const r = handleInvokerKey(s, k, t, lastTs, LEGACY)
      s = r.state
      lastTs = t
    }
    // 按 R
    const r = handleInvokerKey(s, 'R', 250, lastTs, LEGACY)
    expect(r.state.slots).toEqual(['ColdSnap', null])
    expect(r.action!.actionType).toBe('INVOKE')
    expect(r.action!.spellName).toBe('ColdSnap')
  })

  it('按 R 时头顶不足 3 球或组合无效,返回 null action(无效祈唤)', () => {
    const s: InvokerState = { orbs: ['Q', 'W'], slots: [null, null] }
    const r = handleInvokerKey(s, 'R', 100, 0, LEGACY)
    expect(r.action).toBeNull()
    expect(r.state).toEqual(s)
  })

  it('按非 Q/W/E/R 键被忽略', () => {
    const r = handleInvokerKey(empty, 'A', 100, 0, LEGACY)
    expect(r.action).toBeNull()
  })

  it('LEGACY: Tornado 在槽位时按 X → CAST', () => {
    const s: InvokerState = { orbs: ['W', 'W', 'Q'], slots: ['Tornado', 'ColdSnap'] }
    const r = handleInvokerKey(s, 'X', 100, 0, LEGACY)
    expect(r.action!.actionType).toBe('CAST')
    expect(r.action!.spellName).toBe('Tornado')
  })

  it('LEGACY: Tornado 不在槽位时按 X → MISS_CAST', () => {
    const s: InvokerState = { orbs: ['Q', 'Q', 'Q'], slots: ['ColdSnap', 'EMP'] }
    const r = handleInvokerKey(s, 'X', 100, 0, LEGACY)
    expect(r.action!.actionType).toBe('MISS_CAST')
    expect(r.action!.spellName).toBe('Tornado')
  })

  it('DOTA2: 按 D → 释放第一槽位', () => {
    const s: InvokerState = { orbs: [], slots: ['Tornado', 'ColdSnap'] }
    const r = handleInvokerKey(s, 'D', 100, 0, DOTA2)
    expect(r.action!.actionType).toBe('CAST')
    expect(r.action!.spellName).toBe('Tornado')
  })

  it('DOTA2: 第一槽为空按 D → MISS_CAST', () => {
    const s: InvokerState = { orbs: [], slots: [null, 'ColdSnap'] }
    const r = handleInvokerKey(s, 'D', 100, 0, DOTA2)
    expect(r.action!.actionType).toBe('MISS_CAST')
  })
})
