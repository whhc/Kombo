import { useState, useEffect, useCallback } from 'react'

/**
 * 可用更新的信息(Tauri updater 返回)
 */
export interface UpdateInfo {
  version: string
  date?: string
  body?: string
}

interface UpdaterState {
  /** 有可用更新时非 null */
  update: UpdateInfo | null
  /** 正在下载安装 */
  installing: boolean
  /** 错误信息(检查失败时,静默不阻塞用户) */
  error: string | null
}

/**
 * 自动更新 hook。
 *
 * - Tauri 环境:挂载时静默检查更新,有新版本则 update 非 null(供 UI 弹提示)
 * - 非 Tauri 环境(测试/纯前端 dev):no-op,update 恒为 null
 *
 * applyUpdate:下载 + 验签 + 安装 + 重启。失败静默。
 */
export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({ update: null, installing: false, error: null })

  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  useEffect(() => {
    if (!isTauri) return
    let cancelled = false

    async function check() {
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        const u = await check()
        if (cancelled) return
        if (u?.available) {
          setState({ update: { version: u.version, date: u.date, body: u.body }, installing: false, error: null })
        }
      } catch {
        // 网络问题等静默,不阻塞用户使用
      }
    }

    check()
    return () => { cancelled = true }
  }, [isTauri])

  const applyUpdate = useCallback(async () => {
    if (!isTauri) return
    setState((s) => ({ ...s, installing: true }))
    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { relaunch } = await import('@tauri-apps/plugin-process')
      const u = await check()
      if (u?.available) {
        await u.downloadAndInstall()
        await relaunch()
      }
    } catch (e) {
      setState((s) => ({ ...s, installing: false, error: String(e) }))
    }
  }, [isTauri])

  const dismiss = useCallback(() => {
    setState({ update: null, installing: false, error: null })
  }, [])

  return { ...state, applyUpdate, dismiss }
}
