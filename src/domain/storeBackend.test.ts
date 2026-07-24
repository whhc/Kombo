import { describe, it, expect, beforeEach } from 'vitest'
import { getSync, setSync, removeSync, initStoreBackend, isStoreReady } from './storeBackend'

describe('storeBackend — 统一存储后端(非 Tauri 降级 localStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('未初始化时降级 localStorage:同步读写', () => {
    // 测试环境非 Tauri,initStoreBackend 未调用,getSync/setSync 直走 localStorage
    expect(getSync('foo')).toBeNull()
    setSync('foo', 'bar')
    expect(getSync('foo')).toBe('bar')
    expect(localStorage.getItem('foo')).toBe('bar')
  })

  it('removeSync 删除', () => {
    setSync('foo', 'bar')
    removeSync('foo')
    expect(getSync('foo')).toBeNull()
    expect(localStorage.getItem('foo')).toBeNull()
  })

  it('initStoreBackend(非 Tauri)从 localStorage 预填内存', async () => {
    localStorage.setItem('kombo.settings', JSON.stringify({ a: 1 }))
    await initStoreBackend()
    expect(isStoreReady()).toBe(true)
    // 初始化后读走内存,不再直读 localStorage(但值应一致)
    expect(getSync('kombo.settings')).toBe(JSON.stringify({ a: 1 }))
  })

  it('初始化后 setSync 仍同步写 localStorage(非 Tauri 双写)', async () => {
    await initStoreBackend()
    setSync('kombo.test', 'value')
    expect(getSync('kombo.test')).toBe('value')
    expect(localStorage.getItem('kombo.test')).toBe('value')
  })

  it('initStoreBackend 幂等:重复调用不报错', async () => {
    await initStoreBackend()
    await initStoreBackend()
    expect(isStoreReady()).toBe(true)
  })
})
