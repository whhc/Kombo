import { useState, useCallback } from 'react'
import type { ExecutionSession } from '../domain/types'
import { listSessions, localStorageSessionBackend } from '../domain/sessionStore'

/** 历史会话列表(从 localStorage 读;每次手动刷新) */
export function useSessions() {
  const [sessions, setSessions] = useState<ExecutionSession[]>(() => listSessions(localStorageSessionBackend))

  const refresh = useCallback(() => {
    setSessions(listSessions(localStorageSessionBackend))
  }, [])

  return { sessions, refresh }
}
