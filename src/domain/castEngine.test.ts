import { describe, it, expect } from 'vitest'
import { cast } from './castEngine'
import type { InvokerState } from './invokerEngine'

describe('castEngine — 技能释放识别(doc.md §2.5)', () => {
  // tracer bullet:LEGACY 方案,Tornado 在槽位,按 X → CAST
  it('LEGACY: Tornado 在槽位时按 X(专属键) → CAST', () => {
    const state: InvokerState = { orbs: ['W', 'W', 'Q'], slots: ['Tornado', 'ColdSnap'] }
    const r = cast(state, 'X', 'LEGACY')
    expect(r.result).toBe('CAST')
    expect(r.spellName).toBe('Tornado')
  })

  it('LEGACY: Tornado 不在槽位时按 X → MISS_CAST', () => {
    const state: InvokerState = { orbs: ['Q', 'Q', 'Q'], slots: ['ColdSnap', 'EMP'] }
    const r = cast(state, 'X', 'LEGACY')
    expect(r.result).toBe('MISS_CAST')
    expect(r.spellName).toBe('Tornado')
  })

  it('DOTA2: 按 D → 释放第一槽位技能', () => {
    const state: InvokerState = { orbs: [], slots: ['Tornado', 'ColdSnap'] }
    const r = cast(state, 'D', 'DOTA2')
    expect(r.result).toBe('CAST')
    expect(r.spellName).toBe('Tornado')
  })

  it('DOTA2: 第一槽位为空时按 D → MISS_CAST', () => {
    const state: InvokerState = { orbs: [], slots: [null, 'ColdSnap'] }
    const r = cast(state, 'D', 'DOTA2')
    expect(r.result).toBe('MISS_CAST')
  })

  it('非释放键(如 Q/R) → 不是释放操作,result=null', () => {
    const state: InvokerState = { orbs: ['Q', 'Q', 'Q'], slots: ['ColdSnap', null] }
    const r = cast(state, 'Q', 'LEGACY')
    expect(r.result).toBeNull()
  })
})
