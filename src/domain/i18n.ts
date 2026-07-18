import type { SpellName, Element } from './types'
import { ALL_SPELLS } from './spellNames'

/** 支持的语言 */
export type Locale = 'zh' | 'en'
/** 图标主题(与 icons.ts 的 IconTheme 保持一致) */
export type IconTheme = 'DOTA1' | 'DOTA2'
export const LOCALES: readonly Locale[] = ['zh', 'en']
export const DEFAULT_LOCALE: Locale = 'zh'

/** 字典类型:扁平 key → 文案 */
type Dict = Record<string, string>

// ──────────────────────────────────────────────────────────────
// 通用 UI 文案(非技能/元素名)
// ──────────────────────────────────────────────────────────────
const UI_ZH: Dict = {
  'app.title': 'Kombo — 卡尔连招模拟器',
  'nav.practice': '练习',
  'nav.combos': '连招库',
  'nav.dashboard': '复盘',

  'settings.iconTheme': '图标',
  'settings.iconThemeToggle': '切换图标主题(当前)',
  'settings.keybind': '键位',
  'settings.keybind.lockedLegacy': '(锁定 LEGACY)',
  'settings.language': '语言',
  'settings.iconTheme.DOTA1': 'DOTA1',
  'settings.iconTheme.DOTA2': 'DOTA2',

  'practice.guide': '从"连招库"选择一条连招开始练习。',
  'practice.hint': 'Q / W / E 切球 · R 祈唤 · 释放键释放',
  'practice.currentCombo': '当前连招',
  'practice.cast': '释放',
  'practice.missCast': '空放',
  'practice.success': '✓ 成功',
  'practice.failed': '✗ 失败(有跑偏步骤)',
  'practice.endAndSave': '结束并保存',
  'practice.again': '再练一次',
  'practice.pauseLoop': '暂停循环',
  'practice.autoNext': '0.5s 后自动开始下一轮…',
  'practice.freePlay': '自由练习',
  'practice.quit': '退出',
  'practice.reset': '重置',
  'practice.spellHistory': '释放历史',

  'combo.library': '连招库',
  'combo.new': '新建连招',
  'combo.name': '连招名称',
  'combo.spellSequence': '技能序列(点击添加,允许重复)',
  'combo.addSpell': '添加',
  'combo.preCastD': '预切 D 槽',
  'combo.preCastF': '预切 F 槽',
  'combo.preCastNone': '不预切',
  'combo.preCastFNeed2': '需至少 2 个技能才能预切 F 槽',
  'combo.preCastLabel': '预切',
  'combo.practice': '练习',
  'combo.edit': '编辑',
  'combo.empty': '还没有连招,点"新建连招"创建一条。',

  'common.save': '保存连招',
  'common.cancel': '取消',

  'dashboard.timeRange': '时间范围:',
  'dashboard.range.all': '全部',
  'dashboard.range.today': '今日',
  'dashboard.range.7d': '近7天',
  'dashboard.range.30d': '近30天',
  'dashboard.empty': '还没有练习记录。',
  'dashboard.emptyHint': '先去"练习"完成一轮吧。',
  'dashboard.noRecordInRange': '该时间范围内无记录。',
  'dashboard.rhythmTitle': '按键节奏散点图',
  'dashboard.round': '练习轮次',
  'dashboard.allCombos': '全部连招',
  'dashboard.notEvaluated': '未评估',
  'dashboard.ratio': '达成率',
  'dashboard.excess': '多切',

  'metrics.orbRatio': '切球达成率',
  'metrics.excess': '多切次数',
  'metrics.duration': '时长(ms)',
  'metrics.failedNA': 'N/A(失败轮次)',

  'scatter.xAxis': '相对时间(ms)',
  'scatter.yAxis': '间隔(ms)',

  'slot.first': 'D · 第一顺位',
  'slot.second': 'F · 第二顺位',
  'slot.empty': '空',
  'orb.emptySlot': '空槽',
}

const UI_EN: Dict = {
  'app.title': 'Kombo — Invoker Combo Simulator',
  'nav.practice': 'Practice',
  'nav.combos': 'Combos',
  'nav.dashboard': 'Review',

  'settings.iconTheme': 'Icon',
  'settings.iconThemeToggle': 'Toggle icon theme (current)',
  'settings.keybind': 'Keys',
  'settings.keybind.lockedLegacy': '(LEGACY locked)',
  'settings.language': 'Lang',
  'settings.iconTheme.DOTA1': 'DOTA1',
  'settings.iconTheme.DOTA2': 'DOTA2',

  'practice.guide': 'Pick a combo from "Combos" to start practicing.',
  'practice.hint': 'Q / W / E orbs · R invoke · cast key to cast',
  'practice.currentCombo': 'Combo',
  'practice.cast': 'Cast',
  'practice.missCast': 'Miss',
  'practice.success': '✓ Success',
  'practice.failed': '✗ Failed (off-track step)',
  'practice.endAndSave': 'End & Save',
  'practice.again': 'Try again',
  'practice.pauseLoop': 'Pause loop',
  'practice.autoNext': 'Next round in 0.5s…',
  'practice.freePlay': 'Free Play',
  'practice.quit': 'Quit',
  'practice.reset': 'Reset',
  'practice.spellHistory': 'Spell history',

  'combo.library': 'Combo Library',
  'combo.new': 'New combo',
  'combo.name': 'Combo name',
  'combo.spellSequence': 'Spell sequence (click to add, duplicates allowed)',
  'combo.addSpell': 'Add',
  'combo.preCastD': 'Pre-cast D slot',
  'combo.preCastF': 'Pre-cast F slot',
  'combo.preCastNone': 'None',
  'combo.preCastFNeed2': 'Need at least 2 spells to pre-cast F',
  'combo.preCastLabel': 'Pre-cast',
  'combo.practice': 'Practice',
  'combo.edit': 'Edit',
  'combo.empty': 'No combos yet. Click "New combo" to create one.',

  'common.save': 'Save combo',
  'common.cancel': 'Cancel',

  'dashboard.timeRange': 'Range:',
  'dashboard.range.all': 'All',
  'dashboard.range.today': 'Today',
  'dashboard.range.7d': '7d',
  'dashboard.range.30d': '30d',
  'dashboard.empty': 'No practice records yet.',
  'dashboard.emptyHint': 'Finish a round in "Practice" first.',
  'dashboard.noRecordInRange': 'No records in this range.',
  'dashboard.rhythmTitle': 'Keystroke Rhythm Scatter',
  'dashboard.round': 'Round',
  'dashboard.allCombos': 'All combos',
  'dashboard.notEvaluated': 'Not evaluated',
  'dashboard.ratio': 'ratio',
  'dashboard.excess': 'excess',

  'metrics.orbRatio': 'Orb ratio',
  'metrics.excess': 'Excess orbs',
  'metrics.duration': 'Duration (ms)',
  'metrics.failedNA': 'N/A (failed run)',

  'scatter.xAxis': 'Relative time (ms)',
  'scatter.yAxis': 'Interval (ms)',

  'slot.first': 'D · Slot 1',
  'slot.second': 'F · Slot 2',
  'slot.empty': 'Empty',
  'orb.emptySlot': 'Empty',
}

// ──────────────────────────────────────────────────────────────
// 元素名(扁平 key,走 t())
// ──────────────────────────────────────────────────────────────
const ELEMENT_ZH: Record<Element, string> = { Q: '冰', W: '雷', E: '火' }
const ELEMENT_EN: Record<Element, string> = { Q: 'Quas', W: 'Wex', E: 'Exort' }

// ──────────────────────────────────────────────────────────────
// 技能全称:locale × theme 四维查表(dota1/dota2 译名有别)
// 不走扁平 t() 字典,用专门数据结构 + spellName(locale, theme, spell)。
//
// 名称来源:dota2 为 Valve 官方译名;dota1 为 War3 DotA 时代通行译名。
//   注:部分技能两版译名一致(沿用),有差异的按各版通行说法填写,待校对。
// ──────────────────────────────────────────────────────────────
type SpellNameI18n = Record<SpellName, Record<Locale, Record<IconTheme, string>>>

const SPELL_NAME_I18N: SpellNameI18n = {
  ColdSnap: {
    zh: { DOTA1: '急速冷却', DOTA2: '急速冷却' },
    en: { DOTA1: 'Cold Snap', DOTA2: 'Cold Snap' },
  },
  GhostWalk: {
    zh: { DOTA1: '幽灵漫步', DOTA2: '幽灵漫步' },
    en: { DOTA1: 'Ghost Walk', DOTA2: 'Ghost Walk' },
  },
  IceWall: {
    zh: { DOTA1: '寒冰之墙', DOTA2: '寒冰之墙' },
    en: { DOTA1: 'Ice Wall', DOTA2: 'Ice Wall' },
  },
  EMP: {
    zh: { DOTA1: '电磁脉冲', DOTA2: '电磁脉冲' },
    en: { DOTA1: 'EMP', DOTA2: 'EMP' },
  },
  Tornado: {
    zh: { DOTA1: '龙卷风', DOTA2: '强袭飓风' }, // dota1 旧译"龙卷风",dota2 官方"强袭飓风"
    en: { DOTA1: 'Tornado', DOTA2: 'Tornado' },
  },
  Alacrity: {
    zh: { DOTA1: '灵动迅捷', DOTA2: '灵动迅捷' },
    en: { DOTA1: 'Alacrity', DOTA2: 'Alacrity' },
  },
  SunStrike: {
    zh: { DOTA1: '阳炎冲击', DOTA2: '阳炎冲击' },
    en: { DOTA1: 'Sun Strike', DOTA2: 'Sun Strike' },
  },
  ForgeSpirit: {
    zh: { DOTA1: '熔炉精灵', DOTA2: '熔炉精灵' },
    en: { DOTA1: 'Forge Spirit', DOTA2: 'Forge Spirit' },
  },
  ChaosMeteor: {
    zh: { DOTA1: '混沌陨石', DOTA2: '混沌陨石' },
    en: { DOTA1: 'Chaos Meteor', DOTA2: 'Chaos Meteor' },
  },
  DeafeningBlast: {
    zh: { DOTA1: '超震声波', DOTA2: '超震声波' },
    en: { DOTA1: 'Deafening Blast', DOTA2: 'Deafening Blast' },
  },
}

// 合并成完整字典(仅元素名走扁平 t();技能名走 spellName() 专项查表)
const ZH: Dict = { ...UI_ZH, ...prefixed('element.', ELEMENT_ZH) }
const EN: Dict = { ...UI_EN, ...prefixed('element.', ELEMENT_EN) }

function prefixed(prefix: string, rec: Record<string, string>): Dict {
  const out: Dict = {}
  for (const [k, v] of Object.entries(rec)) out[`${prefix}${k}`] = v
  return out
}

const TRANSLATIONS: Record<Locale, Dict> = { zh: ZH, en: EN }

/**
 * 翻译。缺失 key 回退到 key 本身并 warn(开发期发现遗漏)。
 */
export function t(locale: Locale, key: string): string {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE]
  const val = dict[key]
  if (val === undefined) {
    if (typeof console !== 'undefined') console.warn(`[i18n] missing key: ${key}`)
    return key
  }
  return val
}

/** 取某语言 + 主题下某技能的全称(dota1/dota2 译名有别) */
export function spellName(locale: Locale, theme: IconTheme, spell: SpellName): string {
  return SPELL_NAME_I18N[spell][locale][theme]
}
/** 取某语言下某元素的显示名 */
export function elementName(locale: Locale, el: Element): string {
  return t(locale, `element.${el}`)
}

/** 用于测试 / 调试:返回某语言的全部 key 集合 */
export function keysOf(locale: Locale): string[] {
  return Object.keys(TRANSLATIONS[locale])
}

// 让 tree-shaking 知道 ALL_SPELLS 被间接使用(技能名完整性可由调用方校验)
void ALL_SPELLS
