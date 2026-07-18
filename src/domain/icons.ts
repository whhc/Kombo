import type { Element, SpellName } from './types'

/**
 * 图标资源映射 SSOT。
 *
 * v1 仅 dota2 图标;iconTheme 切换到 dota1 时 fallback 到 dota2(资源待补)。
 * 用 Vite 的 import.meta.glob eager 加载,得到 文件名 → URL 映射。
 */
const DOTA2_ICONS = import.meta.glob('../../icons/dota2/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** 取 dota2 目录下某文件名(如 Tornado_icon.webp)的 URL */
function iconUrl(filename: string): string {
  const key = `../../icons/dota2/${filename}`
  const url = DOTA2_ICONS[key]
  if (!url) throw new Error(`图标缺失: ${filename}`)
  return url
}

/** SpellName → 图标文件名(不规则名如 EMP→E.M.P._icon.webp 显式列出) */
const SPELL_ICON_FILE: Record<SpellName, string> = {
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

/** Element → 图标文件名 */
const ELEMENT_ICON_FILE: Record<Element, string> = {
  Q: 'Quas_icon.webp',
  W: 'Wex_icon.webp',
  E: 'Exort_icon.webp',
}

export function spellIconUrl(spell: SpellName): string {
  return iconUrl(SPELL_ICON_FILE[spell])
}

export function elementIconUrl(el: Element): string {
  return iconUrl(ELEMENT_ICON_FILE[el])
}
