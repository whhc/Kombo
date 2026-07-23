import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOrbIdentity } from './useOrbIdentity'
import type { Element } from '../domain/types'

const EMPTY: Element[] = []

describe('useOrbIdentity — FIFO 球身份追踪', () => {
  it('空数组返回空列表', () => {
    const { result } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), { initialProps: EMPTY })
    expect(result.current).toEqual([])
  })

  it('首批切球都获得唯一 id', () => {
    const { result, rerender } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), {
      initialProps: EMPTY,
    })
    rerender(['Q'])
    expect(result.current).toHaveLength(1)
    expect(result.current[0].element).toBe('Q')
    const qId = result.current[0].id

    rerender(['Q', 'W'])
    expect(result.current[0].id).toBe(qId)
    expect(result.current[1].element).toBe('W')
  })

  it('FIFO 队列左移:保留球复用 id,新球拿新 id,挤出球消失', () => {
    const { result, rerender } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), {
      initialProps: EMPTY,
    })

    // 切出 [Q, W, E]
    rerender(['Q', 'W', 'E'])
    const before = result.current
    expect(before.map((o) => o.element)).toEqual(['Q', 'W', 'E'])
    const qId = before[0].id
    const wId = before[1].id
    const eId = before[2].id

    // 切第 4 个球 W → Q 被挤出,队列变 [W, E, W]
    rerender(['W', 'E', 'W'])
    const after = result.current
    expect(after.map((o) => o.element)).toEqual(['W', 'E', 'W'])
    // W 和 E 复用旧 id
    expect(after[0].id).toBe(wId)
    expect(after[1].id).toBe(eId)
    // Q 的 id 不再出现
    expect(after.some((o) => o.id === qId)).toBe(false)
    // 新球(第三个 W)拿新 id,与复用的 wId 不同
    expect(after[2].id).not.toBe(wId)
  })

  it('队列未满时新球入队尾,无球被挤出', () => {
    const { result, rerender } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), {
      initialProps: EMPTY,
    })
    rerender(['Q'])
    const qId = result.current[0].id
    rerender(['Q', 'W'])
    expect(result.current[0].id).toBe(qId)
    rerender(['Q', 'W', 'E'])
    expect(result.current[0].id).toBe(qId)
    expect(result.current[2].element).toBe('E')
  })

  it('重置(回到空数组)清空身份', () => {
    const { result, rerender } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), {
      initialProps: EMPTY,
    })
    rerender(['Q', 'W', 'E'])
    expect(result.current).toHaveLength(3)
    rerender([])
    expect(result.current).toEqual([])
  })

  it('完全不同的队列:全部重建', () => {
    const { result, rerender } = renderHook((orbs: Element[]) => useOrbIdentity(orbs), {
      initialProps: EMPTY,
    })
    rerender(['Q', 'Q', 'Q'])
    const oldIds = result.current.map((o) => o.id)

    // 切成完全不同的 E E E(无公共前缀 → 全部重建)
    rerender(['E', 'E', 'E'])
    const newIds = result.current.map((o) => o.id)
    expect(newIds.every((id) => !oldIds.includes(id))).toBe(true)
    expect(result.current.map((o) => o.element)).toEqual(['E', 'E', 'E'])
  })
})
