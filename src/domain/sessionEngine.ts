import type { ActionNode, TargetCombo, ExecutionSession, SpellName } from './types'

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
 * 根据预切起手构建 invokerState 初始槽位(doc.md §4.3)。
 * 预切技能直接置入,不产生 ActionNode(不计入本次统计)。
 */
export function createInitialInvokerState(combo: TargetCombo): {
  orbs: []
  slots: [SpellName | null, SpellName | null]
} {
  return { orbs: [], slots: [combo.preCastSlots.d ?? null, combo.preCastSlots.f ?? null] }
}
