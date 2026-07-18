import { describe, it, expect } from 'vitest'
import { toScatterPoints } from './rhythmChart'
import type { ActionNode } from './types'

function orb(key: string, ts: number): ActionNode {
  return { actionType: 'ORB', key, timestamp: ts, timeSinceLastMs: 0 }
}

describe('rhythmChart — 散点数据转换', () => {
  it('空 actions 返回空数组', () => {
    expect(toScatterPoints([])).toEqual([])
  })

  it('单点:首点 X=0(相对),Y=0(无前驱间隔)', () => {
    const points = toScatterPoints([orb('Q', 1000)])
    expect(points).toHaveLength(1)
    expect(points[0]).toEqual({ x: 0, y: 0, actionType: 'ORB', key: 'Q' })
  })

  it('多点:X 相对首点(0ms 启动),Y=两次按键间隔', () => {
    const points = toScatterPoints([orb('Q', 1000), orb('W', 1250), orb('E', 1300)])
    // 首点 X=0 Y=0
    expect(points[0]).toMatchObject({ x: 0, y: 0 })
    // 第二点 X=250(1250-1000),Y=250
    expect(points[1]).toMatchObject({ x: 250, y: 250 })
    // 第三点 X=300(1300-1000),Y=50(1300-1250)
    expect(points[2]).toMatchObject({ x: 300, y: 50 })
  })

  it('保留 actionType 与 key 用于图例区分', () => {
    const points = toScatterPoints([
      { actionType: 'ORB', key: 'Q', timestamp: 0, timeSinceLastMs: 0 },
      { actionType: 'INVOKE', key: 'R', spellName: 'Tornado', timestamp: 10, timeSinceLastMs: 10 },
      { actionType: 'CAST', key: 'X', spellName: 'Tornado', timestamp: 20, timeSinceLastMs: 10 },
    ])
    expect(points.map((p) => p.actionType)).toEqual(['ORB', 'INVOKE', 'CAST'])
  })
})
