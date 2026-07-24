import type { ExecutionSession } from './types'
import { getSync, setSync } from './storeBackend'

/**
 * 会话历史持久化。
 * 生产环境用 StoreBackend(tauri-plugin-store 内存缓存层);测试注入 localStorage 后端。
 */
const KEY = 'kombo.sessions'

export interface SessionStorage {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export const localStorageSessionBackend: SessionStorage = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
}

/** 生产后端:走 StoreBackend(同步内存 + 异步落盘到 tauri-plugin-store) */
export const storeSessionBackend: SessionStorage = {
  getItem: (k) => getSync(k),
  setItem: (k, v) => setSync(k, v),
}

export function listSessions(store: SessionStorage): ExecutionSession[] {
  try {
    const raw = store.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSessionLike)
  } catch {
    return []
  }
}

export function saveSession(store: SessionStorage, session: ExecutionSession): void {
  const next = [session, ...listSessions(store)]
  store.setItem(KEY, JSON.stringify(next))
}

function isSessionLike(x: unknown): x is ExecutionSession {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return typeof o.sessionId === 'string' && typeof o.comboId === 'string' && Array.isArray(o.actions)
}
