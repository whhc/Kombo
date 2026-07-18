import type { TargetCombo } from './types'

/**
 * 连招持久化后端抽象(doc.md §5.3)。
 * v1 用 localStorage(数据量小、同步 API 简单);ExecutionSession 落盘
 * 后续按需引入 IndexedDB。此抽象便于测试注入内存后端。
 */
export interface ComboStorage {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

const KEY = 'kombo.combos'

/** localStorage 单例后端(浏览器环境) */
export const localStorageBackend: ComboStorage = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
}

/** 读取所有连招;损坏数据返回空数组 */
export function listCombos(store: ComboStorage): TargetCombo[] {
  try {
    const raw = store.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isComboLike)
  } catch {
    return []
  }
}

/** 保存(新建或按 comboId 覆盖) */
export function saveCombo(store: ComboStorage, combo: TargetCombo): void {
  const list = listCombos(store)
  const idx = list.findIndex((c) => c.comboId === combo.comboId)
  const next = idx >= 0 ? list.map((c, i) => (i === idx ? combo : c)) : [...list, combo]
  store.setItem(KEY, JSON.stringify(next))
}

/** 按 comboId 删除 */
export function deleteCombo(store: ComboStorage, comboId: string): void {
  const next = listCombos(store).filter((c) => c.comboId !== comboId)
  store.setItem(KEY, JSON.stringify(next))
}

function isComboLike(x: unknown): x is TargetCombo {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return typeof o.comboId === 'string' && typeof o.name === 'string' && Array.isArray(o.spells)
}
