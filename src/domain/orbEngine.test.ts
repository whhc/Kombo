import { describe, it, expect } from 'vitest'
import { handleKey, type OrbState } from './orbEngine'

describe('orbEngine — 切球状态机', () => {
  // tracer bullet:空队按 Q,入队一个 Q
  it('按 Q 时把 Q 入队到空状态', () => {
    const start: OrbState = { orbs: [] }
    const { state, action } = handleKey(start, 'Q', 1000)
    expect(state.orbs).toEqual(['Q'])
    expect(action).not.toBeNull()
    expect(action!.actionType).toBe('ORB')
    expect(action!.key).toBe('Q')
  })

  it('满 3 个球后按第 4 个,最早入队的球被挤出(FIFO)', () => {
    // Q W E 已经在头上,按 Q → W E Q
    const start: OrbState = { orbs: ['Q', 'W', 'E'] }
    const { state } = handleKey(start, 'Q', 2000)
    expect(state.orbs).toEqual(['W', 'E', 'Q'])
  })

  it('忽略非 Q/W/E 键,状态与 action 均不变(返回 null action)', () => {
    const start: OrbState = { orbs: ['Q', 'W'] }
    const result = handleKey(start, 'A', 3000)
    expect(result.state.orbs).toEqual(['Q', 'W']) // 原状态
    expect(result.action).toBeNull()
  })

  it('ActionNode 记录 timestamp 与距上次操作的间隔 timeSinceLastMs', () => {
    const start: OrbState = { orbs: ['Q'] }
    // 上次操作在 1000ms,本次在 1250ms → 间隔 250ms
    const { action } = handleKey(start, 'W', 1250, 1000)
    expect(action!.timestamp).toBe(1250)
    expect(action!.timeSinceLastMs).toBe(250)
  })
})
