import type { SpellName, Element } from './types'
import { ALL_SPELLS } from './spellNames'

/** 支持的语言 */
export type Locale = 'zh' | 'en'
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

  // 预设连拓名(Step 2 接入)
  'preset.tornadoEmpMeteorBlast': '吹风 → 磁暴 → 陨石 → 推波',
  'preset.coldsnapForgeBlast': '急冷 → 熔炉 → 推波',
  'preset.meteorBlastFromZero': '陨石 → 推波(从零开始)',
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

  'preset.tornadoEmpMeteorBlast': 'Tornado → EMP → Meteor → Blast',
  'preset.coldsnapForgeBlast': 'Cold Snap → Forge Spirit → Blast',
  'preset.meteorBlastFromZero': 'Meteor → Blast (from zero)',
}

// ──────────────────────────────────────────────────────────────
// 技能名 / 元素名(淘汰 spellNames.ts 的 SPELL_CN)
// ──────────────────────────────────────────────────────────────
const SPELL_ZH: Record<SpellName, string> = {
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
const SPELL_EN: Record<SpellName, string> = {
  ColdSnap: 'Cold Snap',
  GhostWalk: 'Ghost Walk',
  IceWall: 'Ice Wall',
  EMP: 'EMP',
  Tornado: 'Tornado',
  Alacrity: 'Alacrity',
  SunStrike: 'Sun Strike',
  ForgeSpirit: 'Forge Spirit',
  ChaosMeteor: 'Chaos Meteor',
  DeafeningBlast: 'Deafening Blast',
}
const ELEMENT_ZH: Record<Element, string> = { Q: '冰', W: '雷', E: '火' }
const ELEMENT_EN: Record<Element, string> = { Q: 'Quas', W: 'Wex', E: 'Exort' }

// 合并成完整字典
const ZH: Dict = { ...UI_ZH, ...prefixed('spell.', SPELL_ZH), ...prefixed('element.', ELEMENT_ZH) }
const EN: Dict = { ...UI_EN, ...prefixed('spell.', SPELL_EN), ...prefixed('element.', ELEMENT_EN) }

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

/** 取某语言下某技能的显示名 */
export function spellName(locale: Locale, spell: SpellName): string {
  return t(locale, `spell.${spell}`)
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
