import type { Element } from './types'

/** 元素 → 展示信息(颜色、中文名)。dota2 图标暂用 dota1 兼容(Issue 03 接入图标主题) */
export const ELEMENT_INFO: Record<Element, { name: string; tw: string }> = {
  Q: { name: 'Quas · 冰', tw: 'bg-sky-500' },
  W: { name: 'Wex · 雷', tw: 'bg-violet-500' },
  E: { name: 'Exort · 火', tw: 'bg-rose-500' },
}
