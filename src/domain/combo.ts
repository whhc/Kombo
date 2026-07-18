import type { TargetCombo } from './types'

/**
 * 校验 preCastSlots 是否为 spells 的连续前缀(doc.md §4.3 约束)。
 *
 * 精确定义:把预切的 d/f 技能(忽略 d/f 顺序)与 spells 前 N 个元素
 * 做多重集比较(N = 预切技能个数)。相同即合法。
 *
 * 例:spells=[Tornado, EMP, Meteor]
 *   {d:Tornado, f:EMP}     合法(前缀 [Tornado,EMP])
 *   {d:EMP, f:Tornado}     合法(顺序无关)
 *   {d:Tornado, f:Meteor}  非法(跳过 EMP,不是连续前缀)
 *   {d:Tornado, f:Tornado} 非法(spells 前2位无重复 Tornado)
 */
export function validatePreCastPrefix(combo: TargetCombo): boolean {
  const pre = [combo.preCastSlots.d, combo.preCastSlots.f].filter((x): x is NonNullable<typeof x> => x !== undefined)
  if (pre.length === 0) return true // 空 = 前缀长度 0,合法

  // 多重集比较:预切 vs spells 前 N 个
  if (pre.length > combo.spells.length) return false
  const prefixSlice = combo.spells.slice(0, pre.length)
  return multisetEqual(pre, prefixSlice)
}

function multisetEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false
  const ac = countMap(a)
  const bc = countMap(b)
  if (ac.size !== bc.size) return false
  for (const [k, v] of ac) {
    if (bc.get(k) !== v) return false
  }
  return true
}

function countMap<T>(arr: readonly T[]): Map<T, number> {
  const m = new Map<T, number>()
  for (const x of arr) m.set(x, (m.get(x) ?? 0) + 1)
  return m
}

/** 连招整体合法性:spells 非空 + 前缀约束 */
export function isValidCombo(combo: TargetCombo): boolean {
  return combo.spells.length > 0 && validatePreCastPrefix(combo)
}
