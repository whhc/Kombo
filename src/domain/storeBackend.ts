/**
 * 统一存储后端:tauri-plugin-store 的同步内存缓存层。
 *
 * 设计动机(ADR-0001):
 *   tauri-plugin-store 是异步 API(get/set 返回 Promise),但现有 SessionStorage/ComboStorage
 *   接口与全部 hooks 都是同步的(依赖 useState 懒初始化、同步 save)。
 *   为避免改 191 个测试和所有 hooks,采用"启动时一次性加载到内存 + 同步读 + 异步写"模式:
 *     - init():异步加载 store 全部条目到内存 Map(应用启动时 await 一次)
 *     - getSync/setSync:同步操作内存 Map;setSync 额外触发 store 落盘
 *
 * 持久化保证:
 *   - store 用 autoSave 默认值(100ms 防抖),每次修改自动落盘
 *   - 应用优雅关闭时插件自动保存(无需手动 save)
 *   - 内存与 store 双写:内存保同步读,store 保持久化
 *
 * 数据迁移:首次从 localStorage 迁移(store 无数据但 localStorage 有时)
 *
 * 非 Tauri 环境(纯前端 npm run dev / 测试)降级到 localStorage。
 */

import { load as loadStore } from '@tauri-apps/plugin-store'

const STORE_FILE = 'kombo.dat'

const memory = new Map<string, string>()
let storeInstance: Awaited<ReturnType<typeof loadStore>> | null = null
let initialized = false
/** 是否在 Tauri 环境;延迟到 init 时检测(模块加载时 __TAURI_INTERNALS__ 可能未注入) */
let isTauri = false

/**
 * 初始化:加载 store 到内存。应用启动时 await 一次。
 * 幂等:重复调用直接返回。
 */
export async function initStoreBackend(): Promise<void> {
  if (initialized) return
  initialized = true

  // 延迟检测 Tauri 环境(模块加载时 __TAURI_INTERNALS__ 可能未注入)
  isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  if (!isTauri) {
    // 非 Tauri:内存从 localStorage 预填(兼容纯前端 dev)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) memory.set(k, localStorage.getItem(k) ?? '')
    }
    return
  }

  try {
    // autoSave 用默认值(100ms 防抖):每次 set/delete 后自动落盘,
    // 应用关闭时插件也会自动保存。无需手动 save()。
    storeInstance = await loadStore(STORE_FILE)
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
            await storeInstance.set(k, v)
          }
        }
      }
      await storeInstance.save()
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

/** 同步写内存 + 触发 store 落盘(autoSave 自动防抖) */
export function setSync(key: string, value: string): void {
  if (!initialized) {
    // 未初始化:降级直写 localStorage
    try { localStorage.setItem(key, value) } catch { /* 忽略 */ }
    return
  }
  memory.set(key, value)
  if (isTauri && storeInstance) {
    // set 触发 autoSave(100ms 防抖自动落盘);应用关闭时插件也会自动保存
    void storeInstance.set(key, value).catch(() => {})
  } else if (!isTauri) {
    // 非 Tauri:同步写 localStorage
    try { localStorage.setItem(key, value) } catch { /* 忽略 */ }
  }
}

/** 同步删内存 + 触发 store 落盘 */
export function removeSync(key: string): void {
  if (!initialized) {
    try { localStorage.removeItem(key) } catch { /* 忽略 */ }
    return
  }
  memory.delete(key)
  if (isTauri && storeInstance) {
    void storeInstance.delete(key).catch(() => {})
  } else if (!isTauri) {
    try { localStorage.removeItem(key) } catch { /* 忽略 */ }
  }
}

/** 是否已初始化(App 启动时用于判断是否可渲染主应用) */
export function isStoreReady(): boolean {
  return initialized
}
