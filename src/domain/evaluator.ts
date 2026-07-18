import type { Element, TargetCombo, ActionNode, ExecutionSession, SessionMetrics } from './types'
import { SPELL_RECIPE } from './spellBook'

/**
 * 评估一次会话,产出三维 metrics(doc.md §4.2)。
 * ① 成功率已由 sessionEngine.finishSession 判定(传入的 session.status);
 *    此处②切球达成率(FAILED 时 N/A)、③时长。
 */
export function evaluateSession(session: ExecutionSession, combo: TargetCombo): SessionMetrics {
  const actualOrbSwitches = session.actions.filter((a) => a.actionType === 'ORB').length
  const optimal = optimalOrbSwitches(combo)

  // 维度③时长:首有效键 → 末目标技能 CAST
  const firstTs = session.actions.length > 0 ? session.actions[0].timestamp : 0
  const lastTargetCastTs = findLastTargetCastTs(session.actions, combo)
  const durationMs = lastTargetCastTs !== null ? lastTargetCastTs - firstTs : 0

  // 维度②:FAILED 时 N/A
  const failed = session.status === 'FAILED'
  const orbRatio = failed ? null : optimal > 0 ? optimal / actualOrbSwitches : actualOrbSwitches === 0 ? 1 : 0

  return {
    optimalOrbSwitches: optimal,
    actualOrbSwitches,
    orbRatio,
    excessOrbSwitches: Math.max(0, actualOrbSwitches - optimal),
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

type OrbCounts = Record<Element, number>

function emptyCounts(): OrbCounts {
  return { Q: 0, W: 0, E: 0 }
}

function toCounts(orbs: readonly Element[]): OrbCounts {
  const c = emptyCounts()
  for (const o of orbs) c[o]++
  return c
}

/** 从 a 到 b 需要替换(切球)的次数 = 多余数(= 缺少数,因都是 3 元素) */
function switchesBetween(a: OrbCounts, b: OrbCounts): number {
  let extra = 0
  let missing = 0
  for (const el of ['Q', 'W', 'E'] as Element[]) {
    const diff = a[el] - b[el]
    if (diff > 0) extra += diff
    else missing -= diff
  }
  // extra === missing(总数都为 3)
  return Math.max(extra, missing)
}

/**
 * 贪心计算最优切球数(doc.md §4.2 维度②)。
 * 从预切起手头顶(最后一个预切技能的配方,或空)出发,
 * 逐个技能复用当前头顶已有的球,累加最少替换次数。
 * 预切技能本身不计入。
 */
export function optimalOrbSwitches(combo: TargetCombo): number {
  // 预切数量(连续前缀长度)
  const preCount =
    (combo.preCastSlots.d ? 1 : 0) + (combo.preCastSlots.f ? 1 : 0)

  // 起手头顶球 = 最后一个预切技能的配方;无预切则空
  let current: OrbCounts =
    preCount > 0 ? toCounts(SPELL_RECIPE[combo.spells[preCount - 1]]) : emptyCounts()

  let total = 0
  // 跳过前 preCount 个(预切已切),从 preCount 开始
  for (let i = preCount; i < combo.spells.length; i++) {
    const target = toCounts(SPELL_RECIPE[combo.spells[i]])
    total += switchesBetween(current, target)
    current = target
  }
  return total
}
