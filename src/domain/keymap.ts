import type { Key, SpellName } from './types'

/** 键位方案(doc.md §2.4) */
export type KeybindScheme = 'LEGACY' | 'DOTA2'

/** LEGACY 方案:技能 → 专属释放键(1:1,与 doc.md §2.3 传统键位列一致) */
export const LEGACY_KEYMAP: Record<SpellName, Key> = {
  ColdSnap: 'Y',
  GhostWalk: 'V',
  IceWall: 'G',
  EMP: 'C',
  Tornado: 'X',
  Alacrity: 'Z',
  SunStrike: 'T',
  ForgeSpirit: 'F',
  ChaosMeteor: 'D',
  DeafeningBlast: 'B',
}

/** LEGACY 反查:键 → 技能 */
const LEGACY_KEY_TO_SPELL: ReadonlyMap<Key, SpellName> = (() => {
  const m = new Map<Key, SpellName>()
  for (const [spell, key] of Object.entries(LEGACY_KEYMAP) as [SpellName, Key][]) {
    m.set(key, spell)
  }
  return m
})()

/** DOTA2 方案释放键 → 槽位索引 */
const DOTA2_SLOT_KEY: ReadonlyMap<Key, 0 | 1> = new Map<Key, 0 | 1>([
  ['D', 0],
  ['F', 1],
])

/** 给定方案与键,返回"要释放哪个技能 / 哪个槽位";非释放键返回 null。 */
export function resolveCastKey(
  key: Key,
  scheme: KeybindScheme,
): { type: 'spell'; spell: SpellName } | { type: 'slot'; index: 0 | 1 } | null {
  if (scheme === 'LEGACY') {
    const spell = LEGACY_KEY_TO_SPELL.get(key)
    return spell ? { type: 'spell', spell } : null
  }
  // DOTA2
  const index = DOTA2_SLOT_KEY.get(key)
  return index !== undefined ? { type: 'slot', index } : null
}
