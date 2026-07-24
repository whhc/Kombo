import type { TargetCombo } from './types'
import { getSync, setSync, removeSync } from './storeBackend'

/**
 * 连招持久化后端抽象。
 * 生产环境用 StoreBackend(tauri-plugin-store 内存缓存层);测试注入 localStorage/内存后端。
 */
export interface ComboStorage {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

const KEY = 'kombo.combos'

/** localStorage 单例后端(浏览器环境/测试用) */
export const localStorageBackend: ComboStorage = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
}

/** 生产后端:走 StoreBackend(同步内存 + 异步落盘到 tauri-plugin-store) */
export const storeBackend: ComboStorage = {
  getItem: (k) => getSync(k),
  setItem: (k, v) => setSync(k, v),
  removeItem: (k) => removeSync(k),
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
