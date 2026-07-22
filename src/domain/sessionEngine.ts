import type { ActionNode, TargetCombo, ExecutionSession, SpellName, Element } from './types'
import { SPELL_RECIPE } from './spellBook'

/**
 * 会话状态(doc.md §4.1 ExecutionSession 的进行态)。
 * - progress: 已按序成功释放到第几个目标技能
 * - failedSteps: 宽松继续模式下,跑偏的步骤序号集合(不中断会话)
 * - completed: 是否完成全部目标(progress === spells.length)
 */
export interface SessionState {
  progress: number
  failedSteps: number[]
  completed: boolean
  actions: ActionNode[]
  startTime: number
  lastTimestamp: number
}

export function createSession(_combo: TargetCombo): SessionState {
  return {
    progress: 0,
    failedSteps: [],
    completed: false,
    actions: [],
    startTime: 0,
    lastTimestamp: 0,
  }
}

/**
 * 把一个已产出的 ActionNode 推入会话。
 * 仅 CAST 推进 progress(合成 INVOKE 不算,必须释放);MISS_CAST 与错序 CAST
 * 在宽松模式下不中断,只记录 failedStep。
 */
export function pushAction(state: SessionState, action: ActionNode, combo: TargetCombo): SessionState {
  const actions = [...state.actions, action]
  const startTime = state.startTime === 0 ? action.timestamp : state.startTime
  const next: SessionState = {
    ...state,
    actions,
    startTime,
    lastTimestamp: action.timestamp,
  }

  if (action.actionType !== 'CAST') {
    return next
  }

  // CAST:检查是否命中目标序列当前步
  const targetSpell = combo.spells[state.progress]
  if (action.spellName === targetSpell) {
    const progress = state.progress + 1
    return { ...next, progress, completed: progress >= combo.spells.length }
  }

  // 错序或非目标 CAST:宽松继续,记录 failedStep
  if (!state.failedSteps.includes(state.progress)) {
    return { ...next, failedSteps: [...state.failedSteps, state.progress] }
  }
  return next
}

/** 结束会话 → ExecutionSession。status 由 completed 决定;有 failedStep 即 FAILED。 */
export function finishSession(state: SessionState, combo: TargetCombo, endTime: number): ExecutionSession {
  const status = state.completed && state.failedSteps.length === 0 ? 'SUCCESS' : 'FAILED'
  return {
    sessionId: `session-${state.startTime}-${Math.random().toString(36).slice(2, 8)}`,
    comboId: combo.comboId,
    status,
    actions: state.actions,
    startTime: state.startTime,
    endTime,
    metrics: null, // Issue 06 填充
  }
}

/**
 * 根据预切起手构建 invokerState 初始槽位与头顶球序(doc.md §4.3)。
 *
 * 预切语义(与 solver 一致):
 *   - preCastSlots.f = spells[0] = 玩家先合成的预切技能(被推到 F 槽)
 *   - preCastSlots.d = spells[1] = 玩家后合成的预切技能(占据 D 槽)
 * 合成顺序:f → d。最终槽位 [d, f];头顶保留 = 最后合成的 d 配方。
 *
 * 起手球序设定:
 *   - 双预切(f + d):头顶 = SPELL_RECIPE[d](最后合成的)
 *   - 单预切(仅 d):头顶 = SPELL_RECIPE[d]
 *   - 无预切:头顶 = [](从零开始)
 *
 * 这样玩家从预切状态出发,直接切后续技能即可,符合实战预切概念。
 */
export function createInitialInvokerState(combo: TargetCombo): {
  orbs: Element[]
  slots: [SpellName | null, SpellName | null]
} {
  const preD = combo.preCastSlots.d
  const preF = combo.preCastSlots.f
  // 头顶球 = 最后合成的预切技能配方(双预切时为 d,因 d 后合成)
  const lastPreSpell = preD ?? preF
  const orbs: Element[] = lastPreSpell ? [...SPELL_RECIPE[lastPreSpell]] : []
  return {
    orbs,
    // slots[0] = D 槽 = preD; slots[1] = F 槽 = preF
    slots: [preD ?? null, preF ?? null],
  }
}
