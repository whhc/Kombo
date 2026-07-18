import { describe, it, expect } from 'vitest'
import { invokeSpell, type InvokerState } from './slotEngine'

describe('slotEngine — 祈唤槽位状态机(doc.md §2.2 三规则)', () => {
  // tracer bullet:空槽祈唤 → 新技能进第一顺位
  it('空槽时祈唤出新技能:进入第一顺位,第二顺位仍空', () => {
    const start: InvokerState = { orbs: ['Q', 'Q', 'Q'], slots: [null, null] }
    const { state } = invokeSpell(start, 'ColdSnap')
    expect(state.slots).toEqual(['ColdSnap', null])
  })

  it('规则1: 新技能不在槽位 → 进第一顺位,原第一降到第二,原第二被移除', () => {
    // 已有 [ColdSnap, EMP],祈唤 Tornado
    const start: InvokerState = { orbs: ['W', 'W', 'Q'], slots: ['ColdSnap', 'EMP'] }
    const { state } = invokeSpell(start, 'Tornado')
    expect(state.slots).toEqual(['Tornado', 'ColdSnap'])
  })

  it('规则2: 新技能已在第一顺位 → 槽位顺序不变', () => {
    const start: InvokerState = { orbs: ['W', 'W', 'Q'], slots: ['Tornado', 'ColdSnap'] }
    const { state } = invokeSpell(start, 'Tornado')
    expect(state.slots).toEqual(['Tornado', 'ColdSnap'])
  })

  it('规则3: 新技能在第二顺位 → 提至第一,原第一降到第二', () => {
    const start: InvokerState = { orbs: ['W', 'W', 'Q'], slots: ['ColdSnap', 'Tornado'] }
    const { state } = invokeSpell(start, 'Tornado')
    expect(state.slots).toEqual(['Tornado', 'ColdSnap'])
  })
})
