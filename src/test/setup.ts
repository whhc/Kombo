import { beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// jsdom 在某些 Node 版本下 localStorage.setItem 因 --localstorage-file 路径问题失效。
// 检测并替换为内存实现,保证测试中 localStorage 可用。
const mem = new Map<string, string>()

function makeMemStorage(): Storage {
  return {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i: number) => Array.from(mem.keys())[i] ?? null,
    get length() {
      return mem.size
    },
  } as Storage
}

// 主动探测:setItem 是否真能工作
let needsPolyfill = false
try {
  globalThis.localStorage?.setItem('__kombo_probe__', '1')
  needsPolyfill = globalThis.localStorage?.getItem('__kombo_probe__') !== '1'
  globalThis.localStorage?.removeItem('__kombo_probe__')
} catch {
  needsPolyfill = true
}
if (needsPolyfill) {
  Object.defineProperty(globalThis, 'localStorage', { value: makeMemStorage(), configurable: true, writable: true })
}

beforeEach(() => {
  mem.clear()
})

