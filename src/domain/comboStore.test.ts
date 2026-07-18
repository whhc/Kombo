import { describe, it, expect, beforeEach } from 'vitest'
import { listCombos, saveCombo, deleteCombo, type ComboStorage } from './comboStore'
import type { TargetCombo, SpellName } from './types'

// 用内存 Map 替代 localStorage,测纯逻辑(存储后端可换)
function memStore(): ComboStorage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  }
}

function mkCombo(comboId: string, name: string, spells: SpellName[]): TargetCombo {
  return { comboId, name, spells, preCastSlots: {} }
}

describe('comboStore — 连招持久化', () => {
  let store: ComboStorage
  beforeEach(() => {
    store = memStore()
  })

  it('初始 listCombos 返回空数组', () => {
    expect(listCombos(store)).toEqual([])
  })

  it('saveCombo 后 listCombos 能读到', () => {
    saveCombo(store, mkCombo('c1', '我的连招', ['Tornado']))
    expect(listCombos(store)).toHaveLength(1)
    expect(listCombos(store)[0].name).toBe('我的连招')
  })

  it('saveCombo 同 comboId 覆盖更新', () => {
    saveCombo(store, mkCombo('c1', '旧', ['Tornado']))
    saveCombo(store, mkCombo('c1', '新', ['Tornado', 'EMP']))
    const list = listCombos(store)
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('新')
    expect(list[0].spells).toHaveLength(2)
  })

  it('deleteCombo 按 comboId 删除', () => {
    saveCombo(store, mkCombo('c1', 'a', ['Tornado']))
    saveCombo(store, mkCombo('c2', 'b', ['EMP']))
    deleteCombo(store, 'c1')
    const list = listCombos(store)
    expect(list).toHaveLength(1)
    expect(list[0].comboId).toBe('c2')
  })

  it('损坏数据被忽略,返回空(不抛异常)', () => {
    store.setItem('kombo.combos', '{not valid json')
    expect(listCombos(store)).toEqual([])
  })
})
