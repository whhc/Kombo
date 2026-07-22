import { describe, it, expect } from 'vitest'
import { optimalOrbSwitches, evaluateSession } from './evaluator'
import type { TargetCombo, ExecutionSession, ActionNode, SpellName } from './types'

describe('evaluator — 维度② 最优切球数(贪心)', () => {
  // tracer bullet:单个技能,从空开始,需切满 3 球
  it('从空出发切 Tornado(W W Q)需 3 次', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado'],
      preCastSlots: {},
    }
    expect(optimalOrbSwitches(combo)).toBe(3)
  })

  it('连续两技能可复用球:Tornado(WWQ) → EMP(WWW) 共 4 次(3 + 1)', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado', 'EMP'],
      preCastSlots: {},
    }
    // Tornado: 3 次(空→WWQ)
    // EMP: WWQ→WWW,公共 WW,换掉 Q→W,1 次
    expect(optimalOrbSwitches(combo)).toBe(4)
  })

  it('预切技能不计入:预切 Tornado+EMP,只算后续技能', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado', 'EMP', 'ChaosMeteor'],
      // 新语义:preCastSlots.f = spells[0] = Tornado(先合成被推到 F)
      //        preCastSlots.d = spells[1] = EMP(后合成占据 D,头顶留 EMP 配方)
      preCastSlots: { d: 'EMP', f: 'Tornado' },
    }
    // 预切 Tornado(WWQ)、EMP(WWW)已切好,头顶是 WWW(EMP 的)
    // 后续 ChaosMeteor(EEW):WWW→EEW,实际 [W,E,E] 即可合,换 2 次
    expect(optimalOrbSwitches(combo)).toBe(2)
  })

  it('重复技能:Tornado, Tornado 连切,第二次 0 次(球未变)', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado', 'Tornado'],
      preCastSlots: {},
    }
    // 第一次 3 次(空→WWQ),第二次 WWQ→WWQ 不变,0 次
    expect(optimalOrbSwitches(combo)).toBe(3)
  })
})

describe('evaluator — evaluateSession 三维合一', () => {
  function orb(key: string, ts: number): ActionNode {
    return { actionType: 'ORB', key, timestamp: ts, timeSinceLastMs: ts }
  }
  function invoke(spell: SpellName, ts: number): ActionNode {
    return { actionType: 'INVOKE', key: 'R', spellName: spell, timestamp: ts, timeSinceLastMs: 0 }
  }
  function cast(spell: SpellName, ts: number): ActionNode {
    return { actionType: 'CAST', key: 'D', spellName: spell, timestamp: ts, timeSinceLastMs: 0 }
  }

  it('SUCCESS 会话:维度②③正常计算,orbRatio≤1', () => {
    // 预切 Tornado+EMP,只需切 Meteor 并释放全部
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado', 'EMP', 'ChaosMeteor'],
      preCastSlots: { d: 'EMP', f: 'Tornado' },
    }
    // 玩家:释放 Tornado、EMP(预切在槽),切 EEW 出 Meteor,释放。实际切球 E,E,W = 3 次(最优 2 次)
    const actions: ActionNode[] = [
      cast('Tornado', 100),
      cast('EMP', 200),
      orb('E', 300),
      orb('E', 310),
      orb('W', 320),
      invoke('ChaosMeteor', 330),
      cast('ChaosMeteor', 400), // 末目标技能
    ]
    const session: ExecutionSession = {
      sessionId: 's1',
      comboId: 'c',
      status: 'SUCCESS',
      actions,
      startTime: 100,
      endTime: 400,
      metrics: null,
    }
    const m = evaluateSession(session, combo, 'DOTA2')
    // 维度②a:最优切球 2([W,E,E] 即可合 Meteor,玩家切了 E,E,W 浪费 1 个 W)
    expect(m.optimalOrbSwitches).toBe(2)
    expect(m.actualOrbSwitches).toBe(3)
    expect(m.orbRatio).toBeCloseTo(2 / 3, 5)
    expect(m.excessOrbSwitches).toBe(1)
    // 维度②b:总按键 最优 6(F,D,E,E,R,D) vs 实际 7(玩家多切 1 个 W),ratio = 6/7
    expect(m.optimalKeyCount).toBe(6)
    expect(m.actualKeyCount).toBe(7)
    expect(m.keyRatio).toBeCloseTo(6 / 7, 5)
    expect(m.excessKeyCount).toBe(1)
    // 维度③:首有效键 100 → 末目标 400 = 300ms
    expect(m.durationMs).toBe(300)
  })

  it('FAILED 会话:维度② orbRatio=null(N/A)', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado'],
      preCastSlots: {},
    }
    const session: ExecutionSession = {
      sessionId: 's1',
      comboId: 'c',
      status: 'FAILED',
      actions: [orb('W', 100), cast('Tornado', 200)], // 但 Tornado 未在槽 → 实际是 MISS_CAST 之类
      startTime: 100,
      endTime: 200,
      metrics: null,
    }
    const m = evaluateSession(session, combo)
    expect(m.orbRatio).toBeNull()
    expect(m.keyRatio).toBeNull() // FAILED 时总按键达成率也 N/A
    expect(m.optimalOrbSwitches).not.toBeNull() // 最优值仍可算(供参考)
  })

  it('时长:首有效键 → 末目标技能 CAST', () => {
    const combo: TargetCombo = {
      comboId: 'c',
      name: 't',
      spells: ['Tornado'],
      preCastSlots: { d: 'Tornado' },
    }
    const actions: ActionNode[] = [
      cast('Tornado', 500), // 唯一动作,既是首也是末目标
    ]
    const session: ExecutionSession = {
      sessionId: 's1',
      comboId: 'c',
      status: 'SUCCESS',
      actions,
      startTime: 500,
      endTime: 700,
      metrics: null,
    }
    const m = evaluateSession(session, combo)
    // 末目标 CAST 在 500,起点 500 → 0ms
    expect(m.durationMs).toBe(0)
  })
})
