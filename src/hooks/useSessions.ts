import { useState, useCallback } from 'react'
import type { ExecutionSession } from '../domain/types'
import { listSessions, storeSessionBackend } from '../domain/sessionStore'

/** 历史会话列表(从 StoreBackend 读;每次手动刷新) */
export function useSessions() {
  const [sessions, setSessions] = useState<ExecutionSession[]>(() => listSessions(storeSessionBackend))

  const refresh = useCallback(() => {
    setSessions(listSessions(storeSessionBackend))
  }, [])

  return { sessions, refresh }
}
