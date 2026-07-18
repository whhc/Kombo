import { describe, it, expect } from 'vitest'
import {
  createSession,
  pushAction,
  finishSession,
  createInitialInvokerState,
} from './sessionEngine'
import type { TargetCombo, ActionNode, SpellName } from './types'

const combo: TargetCombo = {
  comboId: 'c1',
  name: 't',
  spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
  preCastSlots: {},
}

function orb(key: string, ts: number): ActionNode {
  return { actionType: 'ORB', key, timestamp: ts, timeSinceLastMs: ts }
}
function invoke(spell: SpellName, ts: number): ActionNode {
  return { actionType: 'INVOKE', key: 'R', spellName: spell, timestamp: ts, timeSinceLastMs: 0 }
}
function cast(spell: SpellName, ts: number): ActionNode {
  return { actionType: 'CAST', key: 'D', spellName: spell, timestamp: ts, timeSinceLastMs: 0 }
}
function missCast(spell: SpellName, ts: number): ActionNode {
  return { actionType: 'MISS_CAST', key: 'X', spellName: spell, timestamp: ts, timeSinceLastMs: 0 }
}

describe('sessionEngine — 会话状态机与宽松继续', () => {
  it('createSession: 初始 progress=0,未完成', () => {
    const s = createSession(combo)
    expect(s.progress).toBe(0)
    expect(s.completed).toBe(false)
    expect(s.actions).toEqual([])
  })

  it('按序释放目标技能,progress 逐步推进', () => {
    let s = createSession(combo)
    s = pushAction(s, cast('Tornado', 100), combo)
    expect(s.progress).toBe(1)
    s = pushAction(s, cast('EMP', 200), combo)
    expect(s.progress).toBe(2)
    s = pushAction(s, cast('ChaosMeteor', 300), combo)
    expect(s.progress).toBe(3)
    s = pushAction(s, cast('DeafeningBlast', 400), combo)
    expect(s.progress).toBe(4)
    expect(s.completed).toBe(true)
  })

  it('宽松继续:释放非当前目标技能不中断,记录 failedStep', () => {
    // 目标顺序 Tornado,EMP;玩家先放 EMP(错序)
    let s = createSession(combo)
    s = pushAction(s, cast('EMP', 100), combo)
    expect(s.progress).toBe(0) // 未推进(EMP 不是第1个目标)
    expect(s.completed).toBe(false)
    expect(s.failedSteps).toContain(0) // 第0步跑偏
    // 会话未中断,继续可按对
    s = pushAction(s, cast('Tornado', 200), combo)
    expect(s.progress).toBe(1)
  })

  it('MISS_CAST 不推进 progress,但不中断会话', () => {
    let s = createSession(combo)
    s = pushAction(s, missCast('Tornado', 100), combo)
    expect(s.progress).toBe(0)
    expect(s.completed).toBe(false)
    // 继续正确释放仍能推进
    s = pushAction(s, cast('Tornado', 200), combo)
    expect(s.progress).toBe(1)
  })

  it('ORB / INVOKE 动作不影响 progress,但累积到 actions', () => {
    let s = createSession(combo)
    s = pushAction(s, orb('W', 100), combo)
    s = pushAction(s, orb('W', 110), combo)
    s = pushAction(s, orb('Q', 120), combo)
    s = pushAction(s, invoke('Tornado', 130), combo)
    expect(s.progress).toBe(0) // 还没释放
    expect(s.actions).toHaveLength(4)
    // 释放才推进
    s = pushAction(s, cast('Tornado', 140), combo)
    expect(s.progress).toBe(1)
  })

  it('finishSession 产出 ExecutionSession,completed 决定 status', () => {
    let s = createSession(combo)
    s = pushAction(s, cast('Tornado', 100), combo)
    s = pushAction(s, cast('EMP', 200), combo)
    s = pushAction(s, cast('ChaosMeteor', 300), combo)
    s = pushAction(s, cast('DeafeningBlast', 400), combo)
    const finished = finishSession(s, combo, 450)
    expect(finished.status).toBe('SUCCESS')
    expect(finished.actions).toHaveLength(4)
    expect(finished.startTime).toBe(100)
    expect(finished.endTime).toBe(450)
  })

  it('finishSession:有 failedSteps 时 status=FAILED', () => {
    let s = createSession(combo)
    s = pushAction(s, cast('EMP', 100), combo) // 错序,failedStep
    s = pushAction(s, cast('Tornado', 200), combo)
    s = pushAction(s, cast('EMP', 300), combo)
    s = pushAction(s, cast('ChaosMeteor', 400), combo)
    s = pushAction(s, cast('DeafeningBlast', 500), combo)
    // 注意:宽松模式下,即便后面都"对",只要曾跑偏过,整轮 FAILED
    const finished = finishSession(s, combo, 550)
    expect(finished.status).toBe('FAILED')
  })
})

describe('sessionEngine — 预切起手初始槽位', () => {
  it('createInitialInvokerState: 预切技能置入槽位,不产生 ActionNode', () => {
    const withPre: TargetCombo = {
      comboId: 'c1',
      name: 't',
      spells: ['Tornado', 'EMP', 'ChaosMeteor'],
      preCastSlots: { d: 'Tornado', f: 'EMP' },
    }
    const invokerState = createInitialInvokerState(withPre)
    expect(invokerState.slots).toEqual(['Tornado', 'EMP'])
    expect(invokerState.orbs).toEqual([])
  })

  it('createInitialInvokerState: 空 preCastSlots 双槽为空', () => {
    const invokerState = createInitialInvokerState(combo)
    expect(invokerState.slots).toEqual([null, null])
  })
})
