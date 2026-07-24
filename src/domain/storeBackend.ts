/**
 * 统一存储后端:tauri-plugin-store 的同步内存缓存层。
 *
 * 设计动机(ADR-0001):
 *   tauri-plugin-store 是异步 API,但现有接口和 hooks 都是同步的。
 *   采用"启动时一次性加载到内存 + 同步读 + 异步写"模式。
 *
 * 持久化策略(双写,最大可靠性):
 *   - 内存 Map:同步读写(应用运行时)
 *   - tauri-plugin-store:异步落盘(若可用;autoSave 100ms 防抖)
 *   - localStorage:同步落盘(始终执行,作为备份/降级)
 *
 *   双写确保即使 store 未就绪或失败,localStorage 仍有数据。
 *   非 Tauri 环境(测试/dev)store 加载失败,自动降级纯 localStorage。
 */

import { load as loadStore } from '@tauri-apps/plugin-store'

const STORE_FILE = 'kombo.dat'

const memory = new Map<string, string>()
let storeInstance: Awaited<ReturnType<typeof loadStore>> | null = null
let initialized = false

/**
 * 初始化:加载 store 到内存。应用启动时 await 一次。幂等。
 * store 加载失败(非 Tauri 环境/插件错误)时静默降级到 localStorage。
 */
export async function initStoreBackend(): Promise<void> {
  if (initialized) return
  initialized = true

  // 尝试加载 tauri-plugin-store(失败则降级纯 localStorage)
  try {
    storeInstance = await loadStore(STORE_FILE)
    const entries = await storeInstance.entries()
    for (const [k, v] of entries) {
      memory.set(String(k), typeof v === 'string' ? v : JSON.stringify(v))
    }
  } catch {
    storeInstance = null
  }

  // 从 localStorage 预填(补充 store 未覆盖的 key,或 store 不可用时作主源)
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && !memory.has(k)) {
      memory.set(k, localStorage.getItem(k) ?? '')
    }
  }

  // 数据迁移:若 store 成功加载且 localStorage 有数据,把 localStorage 同步到 store
  if (storeInstance && localStorage.length > 0) {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) {
        const v = localStorage.getItem(k)
        if (v !== null) await storeInstance.set(k, v).catch(() => {})
      }
    }
  }
}

/** 同步读(从内存) */
export function getSync(key: string): string | null {
  if (!initialized) {
    // 未初始化(测试):降级直读 localStorage
    try { return localStorage.getItem(key) } catch { return null }
  }
  return memory.has(key) ? memory.get(key)! : null
}

/**
 * 同步写内存 + 双写落盘(store 异步 + localStorage 同步)。
 * localStorage 同步写保证即使应用立即关闭数据也不丢。
 */
export function setSync(key: string, value: string): void {
  // 内存(同步)
  memory.set(key, value)
  // localStorage(同步,始终执行——最可靠的即时持久化)
  try { localStorage.setItem(key, value) } catch { /* 忽略 */ }
  // store(异步,若可用——跨 WebView 缓存清理仍保留)
  if (storeInstance) {
    void storeInstance.set(key, value).catch(() => {})
  }
}

/** 同步删内存 + 双写删除 */
export function removeSync(key: string): void {
  memory.delete(key)
  try { localStorage.removeItem(key) } catch { /* 忽略 */ }
  if (storeInstance) {
    void storeInstance.delete(key).catch(() => {})
  }
}

/** 是否已初始化 */
export function isStoreReady(): boolean {
  return initialized
}
