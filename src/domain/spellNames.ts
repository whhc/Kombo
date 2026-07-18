import type { SpellName } from './types'

/** 技能 → 中文名(给编辑器/UI 显示用,SSOT) */
export const SPELL_CN: Record<SpellName, string> = {
  ColdSnap: '急速冷却',
  GhostWalk: '幽灵漫步',
  IceWall: '寒冰之墙',
  EMP: '电磁脉冲',
  Tornado: '强袭飓风',
  Alacrity: '灵动迅捷',
  SunStrike: '阳炎冲击',
  ForgeSpirit: '熔炉精灵',
  ChaosMeteor: '混沌陨石',
  DeafeningBlast: '超震声波',
}

/** 全部技能列表(给编辑器选项用) */
export const ALL_SPELLS: readonly SpellName[] = [
  'ColdSnap',
  'GhostWalk',
  'IceWall',
  'EMP',
  'Tornado',
  'Alacrity',
  'SunStrike',
  'ForgeSpirit',
  'ChaosMeteor',
  'DeafeningBlast',
]
