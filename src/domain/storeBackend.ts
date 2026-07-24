import { load as loadStore } from '@tauri-apps/plugin-store'

/**
 * 统一存储后端:tauri-plugin-store 的同步内存缓存层。
 *
 * 设计动机(ADR-0001):
 *   tauri-plugin-store 是异步 API(get/set 返回 Promise),但现有 SessionStorage/ComboStorage
 *   接口与全部 hooks 都是同步的(依赖 useState 懒初始化、同步 save)。
 *   为避免改 191 个测试和所有 hooks,采用"启动时一次性加载到内存 + 同步读 + 异步写"模式:
 *     - init():异步加载 store 全部条目到内存 Map(应用启动时 await 一次)
 *     - getSync/setSync:同步操作内存 Map;setSync 额外 fire-and-forget 异步落盘
 *
 * 数据迁移:首次从 localStorage 迁移(store 无数据但 localStorage 有时)
 *
 * 非 Tauri 环境(纯前端 npm run dev / 测试)降级到 localStorage。
 */

const STORE_FILE = 'kombo.dat'

/** store 文件名,供 storeComboBackend/storeSessionBackend 用作 key 前缀隔离 */
export const STORE_FILENAME = STORE_FILE

const memory = new Map<string, string>()
let storeInstance: Awaited<ReturnType<typeof loadStore>> | null = null
let initialized = false
/** 是否在 Tauri 环境(有 plugin-store);非 Tauri 降级 localStorage */
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * 初始化:加载 store 到内存。应用启动时 await 一次。
 * 幂等:重复调用直接返回。
 */
export async function initStoreBackend(): Promise<void> {
  if (initialized) return
  initialized = true

  if (!isTauri) {
    // 非 Tauri:内存从 localStorage 预填(兼容纯前端 dev)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) memory.set(k, localStorage.getItem(k) ?? '')
    }
    return
  }

  try {
    storeInstance = await loadStore(STORE_FILE, { autoSave: false })
    const entries = await storeInstance.entries()
    for (const [k, v] of entries) {
      memory.set(String(k), typeof v === 'string' ? v : JSON.stringify(v))
    }

    // 数据迁移:store 空但 localStorage 有数据 → 迁移
    if (memory.size === 0 && localStorage.length > 0) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k) {
          const v = localStorage.getItem(k)
          if (v !== null) {
            memory.set(k, v)
            await storeInstance?.set(k, v)
          }
        }
      }
      await storeInstance?.save()
      // 迁移成功后清理 localStorage(避免双源)
      localStorage.clear()
    }
  } catch {
    // store 加载失败:降级到空内存,不阻塞启动
    storeInstance = null
  }
}

/** 同步读 */
export function getSync(key: string): string | null {
  // 未初始化(测试环境/未 await init):降级直读 localStorage
  if (!initialized) {
    try { return localStorage.getItem(key) } catch { return null }
  }
  return memory.has(key) ? memory.get(key)! : null
}

/** 同步写内存 + 异步落盘(fire-and-forget) */
export function setSync(key: string, value: string): void {
  if (!initialized) {
    // 未初始化:降级直写 localStorage
    try { localStorage.setItem(key, value) } catch { /* 忽略 */ }
    return
  }
  memory.set(key, value)
  if (isTauri && storeInstance) {
    // fire-and-forget:不阻塞 UI;autoSave:false 故需手动 save
    void storeInstance.set(key, value).then(() => storeInstance?.save()).catch(() => {})
  } else if (!isTauri) {
    // 非 Tauri:同步写 localStorage
    try { localStorage.setItem(key, value) } catch { /* 忽略 */ }
  }
}

/** 同步删内存 + 异步落盘 */
export function removeSync(key: string): void {
  if (!initialized) {
    try { localStorage.removeItem(key) } catch { /* 忽略 */ }
    return
  }
  memory.delete(key)
  if (isTauri && storeInstance) {
    void storeInstance.delete(key).then(() => storeInstance?.save()).catch(() => {})
  } else if (!isTauri) {
    try { localStorage.removeItem(key) } catch { /* 忽略 */ }
  }
}

/** 是否已初始化(App 启动时用于判断是否可渲染主应用) */
export function isStoreReady(): boolean {
  return initialized
}
