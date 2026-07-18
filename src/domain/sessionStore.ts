import type { ExecutionSession } from './types'

/**
 * 会话历史持久化(doc.md §5.3)。
 * v1 用 localStorage;若数据量增长,后续切 IndexedDB。
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
