import type { TargetCombo, ActionNode, ExecutionSession, SessionMetrics } from './types'
import { solveCombo } from './solver'
import type { KeybindScheme } from './keymap'

/**
 * 评估一次会话,产出三维 metrics(doc.md §4.2)。
 * ① 成功率已由 sessionEngine.finishSession 判定(传入的 session.status);
 *    此处②切球达成率(FAILED 时 N/A)、③时长。
 *
 * @param scheme 键位方案;用于求解最优总按键序列(影响 CAST 步的释放键,
 *               但不影响最优切球数与最优总按键数本身——后者只数步数)。
 */
export function evaluateSession(
  session: ExecutionSession,
  combo: TargetCombo,
  scheme: KeybindScheme = 'DOTA2',
): SessionMetrics {
  const actualOrbSwitches = session.actions.filter((a) => a.actionType === 'ORB').length
  const optimal = optimalOrbSwitches(combo)

  // 维度②b:总按键——分母含所有有效按键(ORB + INVOKE + CAST + MISS_CAST)
  const actualKeyCount = session.actions.filter((a) =>
    a.actionType === 'ORB' || a.actionType === 'INVOKE' || a.actionType === 'CAST' || a.actionType === 'MISS_CAST',
  ).length
  const optimalSolution = solveCombo(combo, scheme)
  const optimalKeyCount = optimalSolution ? optimalSolution.steps.length : 0

  // 维度③时长:首有效键 → 末目标技能 CAST
  const firstTs = session.actions.length > 0 ? session.actions[0].timestamp : 0
  const lastTargetCastTs = findLastTargetCastTs(session.actions, combo)
  const durationMs = lastTargetCastTs !== null ? lastTargetCastTs - firstTs : 0

  // 维度②:FAILED 时 N/A
  const failed = session.status === 'FAILED'
  const orbRatio = failed ? null : optimal > 0 ? optimal / actualOrbSwitches : actualOrbSwitches === 0 ? 1 : 0
  const keyRatio = failed ? null : optimalKeyCount > 0 ? optimalKeyCount / actualKeyCount : actualKeyCount === 0 ? 1 : 0

  return {
    optimalOrbSwitches: optimal,
    actualOrbSwitches,
    orbRatio,
    excessOrbSwitches: Math.max(0, actualOrbSwitches - optimal),
    optimalKeyCount,
    actualKeyCount,
    keyRatio,
    excessKeyCount: Math.max(0, actualKeyCount - optimalKeyCount),
    durationMs,
  }
}

/** 模拟 progress 推进,返回最后一次命中目标 CAST 的 timestamp */
function findLastTargetCastTs(actions: readonly ActionNode[], combo: TargetCombo): number | null {
  let progress = 0
  let lastTs: number | null = null
  for (const a of actions) {
    if (a.actionType === 'CAST' && a.spellName === combo.spells[progress]) {
      progress++
      lastTs = a.timestamp
    }
  }
  return lastTs
}

/**
 * 精确最优切球数(doc.md §4.2 维度②a)。
 *
 * 委托 solver.solveCombo:把法球建模为 FIFO 队列,用 0-1 BFS 在状态空间
 * (orbs × progress × slots)里求精确最少切球次数。比早期版本的多重集贪心
 * 更准确——贪心既会高估(忽略球序复用)也会低估(忽略 FIFO 出队顺序)。
 *
 * 优化目标:只计切球次数;R 与释放键不计代价(与维度②a口径一致)。
 *
 * 保留导出名以兼容现有调用方(evaluator.test / Dashboard)。
 */
export function optimalOrbSwitches(combo: TargetCombo): number {
  const r = solveCombo(combo)
  // solver 对任何合法 combo 都应有解;无解时退回 0 作防御
  return r ? r.orbSwitches : 0
}

/**
 * 最优总按键数(doc.md §4.2 维度②b 的分子)。
 * = solver 求出的完整按键序列长度(切球 + R + 释放键)。
 */
export function optimalKeyCount(combo: TargetCombo, scheme: KeybindScheme = 'DOTA2'): number {
  const r = solveCombo(combo, scheme)
  return r ? r.steps.length : 0
}
