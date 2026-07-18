import { describe, it, expect } from 'vitest'
import { handleInvokerKey, type InvokerState } from './invokerEngine'

const empty: InvokerState = { orbs: [], slots: [null, null] }

describe('invokerEngine — 统一按键驱动(切球 + 祈唤)', () => {
  it('切 Q/W/E 更新元素球,槽位不变', () => {
    let r = handleInvokerKey(empty, 'Q', 100, 0)
    expect(r.state.orbs).toEqual(['Q'])
    expect(r.state.slots).toEqual([null, null])
    expect(r.action!.actionType).toBe('ORB')
  })

  it('按 R 时若头顶 3 球构成技能,祈唤入槽位(actionType=INVOKE)', () => {
    // 切 Q Q Q
    let s = empty
    let lastTs = 0
    for (const [k, t] of [['Q', 100], ['Q', 150], ['Q', 200]] as const) {
      const r = handleInvokerKey(s, k, t, lastTs)
      s = r.state
      lastTs = t
    }
    // 按 R
    const r = handleInvokerKey(s, 'R', 250, lastTs)
    expect(r.state.slots).toEqual(['ColdSnap', null])
    expect(r.action!.actionType).toBe('INVOKE')
    expect(r.action!.spellName).toBe('ColdSnap')
  })

  it('按 R 时头顶不足 3 球或组合无效,返回 null action(无效祈唤)', () => {
    const s: InvokerState = { orbs: ['Q', 'W'], slots: [null, null] }
    const r = handleInvokerKey(s, 'R', 100, 0)
    expect(r.action).toBeNull()
    expect(r.state).toEqual(s)
  })

  it('按非 Q/W/E/R 键被忽略', () => {
    const r = handleInvokerKey(empty, 'A', 100, 0)
    expect(r.action).toBeNull()
  })
})
