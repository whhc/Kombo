import type { Element, SpellName } from './types'

/**
 * 图标资源映射 SSOT,支持 DOTA1 / DOTA2 双主题。
 *
 * 两主题文件名规则不同:
 * - DOTA2:大驼峰 + 下划线 + _icon 后缀(EMP→E.M.P._icon.webp)
 * - DOTA1:全小写 + 随机后缀(Coldsnap-vige.webp),不规则,显式映射
 * 用 import.meta.glob eager 各自加载。
 */
export type IconTheme = 'DOTA1' | 'DOTA2'

const DOTA2_ICONS = import.meta.glob('../../icons/dota2/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const DOTA1_ICONS = import.meta.glob('../../icons/dota1/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function iconUrl(theme: IconTheme, dir: 'dota1' | 'dota2', filename: string): string {
  const store = theme === 'DOTA1' ? DOTA1_ICONS : DOTA2_ICONS
  const key = `../../icons/${dir}/${filename}`
  const url = store[key]
  if (!url) throw new Error(`图标缺失: ${dir}/${filename}`)
  return url
}

/** SpellName → DOTA2 图标文件名 */
const SPELL_ICON_FILE_DOTA2: Record<SpellName, string> = {
  ColdSnap: 'Cold_Snap_icon.webp',
  GhostWalk: 'Ghost_Walk_icon.webp',
  IceWall: 'Ice_Wall_icon.webp',
  EMP: 'E.M.P._icon.webp',
  Tornado: 'Tornado_icon.webp',
  Alacrity: 'Alacrity_icon.webp',
  SunStrike: 'Sun_Strike_icon.webp',
  ForgeSpirit: 'Forge_Spirit_icon.webp',
  ChaosMeteor: 'Chaos_Meteor_icon.webp',
  DeafeningBlast: 'Deafening_Blast_icon.webp',
}

/** SpellName → DOTA1 图标文件名(全小写 + 随机后缀,不规则) */
const SPELL_ICON_FILE_DOTA1: Record<SpellName, string> = {
  ColdSnap: 'Coldsnap-vige.webp',
  GhostWalk: 'Ghostwalk-sgk5.webp',
  IceWall: 'Icewall-2p4l.webp',
  EMP: 'Emp-cvd0.webp',
  Tornado: 'Tornado-duuo.webp',
  Alacrity: 'Alacrity-ssvz.webp',
  SunStrike: 'Sunstrike-jssu.webp',
  ForgeSpirit: 'Forgespirit-rxls.webp',
  ChaosMeteor: 'Chaosmeteor-ciwy.webp',
  DeafeningBlast: 'Deafeningblast.webp',
}

const ELEMENT_ICON_FILE_DOTA2: Record<Element, string> = {
  Q: 'Quas_icon.webp',
  W: 'Wex_icon.webp',
  E: 'Exort_icon.webp',
}
const ELEMENT_ICON_FILE_DOTA1: Record<Element, string> = {
  Q: 'Quas.webp',
  W: 'Wex.webp',
  E: 'Exort.webp',
}

const HERO_ICON_FILE = { DOTA1: 'Kael.webp', DOTA2: 'Invoker_icon.webp' } as const

/** R 键(祈唤)专属图标,与合成结果技能无关 */
const INVOKE_ICON_FILE = { DOTA1: 'Invoke-r9ei.webp', DOTA2: 'Invoke_icon.webp' } as const

export function spellIconUrl(spell: SpellName, theme: IconTheme = 'DOTA2'): string {
  const file = theme === 'DOTA1' ? SPELL_ICON_FILE_DOTA1[spell] : SPELL_ICON_FILE_DOTA2[spell]
  return iconUrl(theme, theme === 'DOTA1' ? 'dota1' : 'dota2', file)
}

export function elementIconUrl(el: Element, theme: IconTheme = 'DOTA2'): string {
  const file = theme === 'DOTA1' ? ELEMENT_ICON_FILE_DOTA1[el] : ELEMENT_ICON_FILE_DOTA2[el]
  return iconUrl(theme, theme === 'DOTA1' ? 'dota1' : 'dota2', file)
}

/** R 键(祈唤)图标 URL */
export function invokeIconUrl(theme: IconTheme = 'DOTA2'): string {
  return iconUrl(theme, theme === 'DOTA1' ? 'dota1' : 'dota2', INVOKE_ICON_FILE[theme])
}

/** 卡尔英雄头像 */
export function heroIconUrl(theme: IconTheme = 'DOTA2'): string {
  return iconUrl(theme, theme === 'DOTA1' ? 'dota1' : 'dota2', HERO_ICON_FILE[theme])
}
