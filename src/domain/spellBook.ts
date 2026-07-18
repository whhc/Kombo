import type { Element, SpellName } from './types'

/**
 * 技能 → 元素组合的查表(doc.md §2.3)。
 * 合成判定忽略顺序,故用"元素多重集"比较:把 3 个元素排序后作 key。
 */

/** 技能 → 其元素组合(长度固定 3) */
export const SPELL_RECIPE: Record<SpellName, readonly [Element, Element, Element]> = {
  ColdSnap: ['Q', 'Q', 'Q'],
  GhostWalk: ['Q', 'Q', 'W'],
  IceWall: ['Q', 'Q', 'E'],
  EMP: ['W', 'W', 'W'],
  Tornado: ['W', 'W', 'Q'],
  Alacrity: ['W', 'W', 'E'],
  SunStrike: ['E', 'E', 'E'],
  ForgeSpirit: ['E', 'E', 'Q'],
  ChaosMeteor: ['E', 'E', 'W'],
  DeafeningBlast: ['Q', 'W', 'E'],
}

/** 反向查表:元素多重集 key → 技能名 */
const RECIPE_KEY_TO_SPELL: ReadonlyMap<string, SpellName> = (() => {
  const m = new Map<string, SpellName>()
  for (const [spell, recipe] of Object.entries(SPELL_RECIPE) as [SpellName, readonly [Element, Element, Element]][]) {
    m.set(recipeKey(recipe), spell)
  }
  return m
})()

/** 把 3 个元素转成排序后的 key(忽略排列顺序) */
function recipeKey(recipe: readonly Element[]): string {
  return [...recipe].sort().join('')
}

/**
 * 给定头顶 3 个元素(顺序任意),返回对应技能名;无对应返回 null。
 * 不足 3 个元素时无法祈唤,返回 null。
 */
export function invoke(orbs: readonly Element[]): SpellName | null {
  if (orbs.length !== 3) return null
  return RECIPE_KEY_TO_SPELL.get(recipeKey(orbs)) ?? null
}
