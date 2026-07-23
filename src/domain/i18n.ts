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
  'nav.aria': '主导航',
  'nav.practice': '练习',
  'nav.combos': '连招库',
  'nav.dashboard': '复盘',
  'nav.help': '帮助',

  'settings.title': '设置',
  'settings.iconTheme': '图标',
  'settings.iconThemeToggle': '切换图标主题(当前)',
  'settings.keybind': '键位',
  'settings.keybind.lockedLegacy': '(锁定 LEGACY)',
  'settings.language': '语言',
  'settings.iconTheme.DOTA1': 'DOTA1',
  'settings.iconTheme.DOTA2': 'DOTA2',
  'settings.sound': '技能音效',
  'settings.killSound': '击杀音效',
  'settings.soundOn': '开启音效',
  'settings.soundOff': '关闭音效',

  'practice.guide': '从"连招库"选择一条连招开始练习。',
  'practice.hint': 'Q / W / E 切球 · R 祈唤 · 释放键释放',
  'practice.currentCombo': '当前连招',
  'practice.cast': '释放',
  'practice.missCast': '空放',
  'practice.success': '成功',
  'practice.failed': '失败(有跑偏步骤)',
  'practice.endAndSave': '结束并保存',
  'practice.again': '再练一次',
  'practice.againHint': '按 空格键 重开',
  'practice.discardHint': 'Esc 放弃本轮',
  'practice.timer': '用时',
  'practice.freePlay': '自由练习',
  'practice.quit': '退出',
  'practice.reset': '重置',
  'practice.spellHistory': '释放历史',
  'practice.recipeToggle': '显示/隐藏技能配方',
  'recipe.title': '技能配方',

  'combo.library': '连招库',
  'combo.new': '新建连招',
  'combo.name': '连招名称',
  'combo.spellSequence': '技能序列(点击添加,每个技能仅一次)',
  'combo.addSpell': '添加',
  'combo.preCastD': '预切 D 槽',
  'combo.preCastF': '预切 F 槽',
  'combo.preCastNone': '不预切',
  'combo.preCastFNeed2': '需至少 2 个技能才能预切 F 槽',
  'combo.preCastLabel': '预切',
  'combo.practice': '练习',
  'combo.edit': '编辑',
  'combo.delete': '删除',
  'combo.empty': '还没有连招,点"新建连招"创建一条。',
  'combo.duplicateSpell': '每个技能在一条连招中只能出现一次',
  'combo.optimalPath': '最优键序',
  'combo.optimalPathHint': '基于切球队列顺序求解的最少按键序列',
  'combo.optimalPathEmpty': '空连招无最优键序',
  'combo.toggleOptimalPath': '显示/隐藏最优键序',
  'progress.group': '连招进度',

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
  'dashboard.noSuccessInRange': '该范围内无成功轮次。',
  'dashboard.rhythmTitle': '按键节奏散点图',
  'dashboard.round': '练习轮次',
  'dashboard.allCombos': '全部连招',
  'dashboard.notEvaluated': '未评估',
  'dashboard.ratio': '达成率',
  'dashboard.excess': '多切',
  'dashboard.successRate': '成功率',
  'dashboard.successRateHint': '范围内成功轮次 / 总轮次(趋势图只画成功轮次)',
  'dashboard.successRateUnknown': '成功率: 未知',
  'dashboard.totalRounds': '总轮次',
  'dashboard.bestSpeed': '最佳速度',

  'metrics.orbRatio': '切球达成率',
  'metrics.keyRatio': '总按键达成率',
  'metrics.excess': '多切次数',
  'metrics.duration': '时长(ms)',
  'metrics.durationScore': '速度得分',
  'metrics.failedNA': 'N/A(失败轮次)',

  'scatter.xAxis': '相对时间(ms)',
  'scatter.yAxis': '间隔(ms)',

  'slot.first': 'D · 第一顺位',
  'slot.second': 'F · 第二顺位',
  'slot.empty': '空',
  'slot.group': '技能槽位',
  'orb.emptySlot': '空槽',
  'orb.group': '元素球',

  // ── 帮助页 ──
  'help.overview.title': '概览',
  'help.overview.body': '卡尔(Invoker)通过组合三元素球,再按 R 祈唤,合成 10 种技能。释放键:DOTA2 模式下 D = 第一槽、F = 第二槽;LEGACY 模式下每个技能有专属键。',
  'help.overview.fifo': '法球是 FIFO 队列(最多 3 个):新球入队尾,队首被挤出。球序在合成后完整保留,直接影响下一技能的最少切球数。',
  'help.spells.title': '十技能配方',
  'help.spells.body': '下方列出全部技能及其元素配方(顺序无关)。按 R 时按多重集匹配合成。',
  'help.practice.title': '练习',
  'help.practice.keys': 'Q / W / E 切球 · R 祈唤 · D / F 释放技能',
  'help.practice.freePlay': '"练习"页默认进入自由模式,可随意按键探索,不计入统计。',
  'help.practice.comboFlow': '从"连招库"选择连招进入练习后,顶部显示当前连招与进度条。按序释放目标技能即推进进度。',
  'help.practice.finished': '连招结束后停留在评估状态,展示三维指标。不再自动循环。',
  'help.practice.space': '按空格键 立即重新开始下一轮,无需鼠标点击。',
  'help.practice.preCast': '预切连招起手时,头顶已带预切技能的球序(无需重新切出)。预切释放键由合成顺序决定:后合成的技能占据 D 槽,先合成的被推到 F 槽。',
  'help.practice.sound': '释放技能 / 祈唤成功时播放对应音效;在顶部 ⚙ 齿轮设置面板内可分别切换技能音效与击杀音效,设置持久化。',
  'help.practice.recipe': '自由练习页下方有"技能配方 👁"标题行,点击可展开/收起参考面板:列出全部 10 个技能及其 3 元素配方(元素用图标,按 Q→W→E 顺序排列),方便不熟悉技能的用户随时查阅。注:此处的眼睛按钮与连招练习页的"最优键序"眼睛按钮是不同功能。',
  'help.combo.title': '连招库',
  'help.combo.create': '点"新建连招",依次添加技能成序列(允许重复)。可选预切前两个技能作为起手。',
  'help.combo.preCastOrder': '预切 F 槽 = spells[0](玩家先合成、先释放);预切 D 槽 = spells[1](玩家后合成、后释放)。需先选 F 才能选 D。',
  'help.combo.optimalPath': '编辑器与列表卡片显示"最优键序":基于 FIFO 切球队列求解的最少按键序列,遵循"切一个合一个放一个"的实战节奏。切球数相同时,优先把重复按键分组(如 EEW 而非 EWE),符合人体工学。',
  'help.combo.toggle': '练习页标题旁的眼睛按钮可切换最优键序的显示/隐藏,设置持久化。',
  'help.metrics.title': '复盘指标',
  'help.metrics.intro': '复盘页的趋势图将三个指标归一化到 0-100%(越高越好),只画成功轮次;右上角徽章统计成功率。',
  'help.metrics.orbRatio': '切球达成率 = 最优切球数 / 实际切球数。只看 Q/W/E,衡量切球效率。100% 表示没有任何多余切球。',
  'help.metrics.keyRatio': '总按键达成率 = 最优总按键数 / 实际总按键数。涵盖 Q/W/E/R/D/F 所有有效按键,多按 R、空放、切错球回头都会扣分。',
  'help.metrics.durationScore': '速度得分 = 范围内最快轮次时长 / 本轮时长。最快那一轮为 100 分基准。',
  'help.metrics.successRate': '成功率 = 成功轮次 / 总轮次(含失败)。徽章颜色:绿 ≥ 80%、黄 50-80%、红 < 50%、灰 = 未知(无数据)。',
  'help.metrics.failedNote': '失败轮次不计入趋势图(避免拉低曲线),但计入成功率统计。',
}

const UI_EN: Dict = {
  'app.title': 'Kombo — Invoker Combo Simulator',
  'nav.aria': 'Main navigation',
  'nav.practice': 'Practice',
  'nav.combos': 'Combos',
  'nav.dashboard': 'Review',
  'nav.help': 'Help',

  'settings.title': 'Settings',
  'settings.iconTheme': 'Icon',
  'settings.iconThemeToggle': 'Toggle icon theme (current)',
  'settings.keybind': 'Keys',
  'settings.keybind.lockedLegacy': '(LEGACY locked)',
  'settings.language': 'Lang',
  'settings.iconTheme.DOTA1': 'DOTA1',
  'settings.iconTheme.DOTA2': 'DOTA2',
  'settings.sound': 'Spell sound',
  'settings.killSound': 'Kill sound',
  'settings.soundOn': 'Sound on',
  'settings.soundOff': 'Sound off',

  'practice.guide': 'Pick a combo from "Combos" to start practicing.',
  'practice.hint': 'Q / W / E orbs · R invoke · cast key to cast',
  'practice.currentCombo': 'Combo',
  'practice.cast': 'Cast',
  'practice.missCast': 'Miss',
  'practice.success': 'Success',
  'practice.failed': 'Failed (off-track step)',
  'practice.endAndSave': 'End & Save',
  'practice.again': 'Try again',
  'practice.againHint': 'Press Space to retry',
  'practice.discardHint': 'Esc to discard round',
  'practice.timer': 'Time',
  'practice.freePlay': 'Free Play',
  'practice.quit': 'Quit',
  'practice.reset': 'Reset',
  'practice.spellHistory': 'Spell history',
  'practice.recipeToggle': 'Show/hide spell recipes',
  'recipe.title': 'Spell Recipes',

  'combo.library': 'Combo Library',
  'combo.new': 'New combo',
  'combo.name': 'Combo name',
  'combo.spellSequence': 'Spell sequence (click to add, each spell once)',
  'combo.addSpell': 'Add',
  'combo.preCastD': 'Pre-cast D slot',
  'combo.preCastF': 'Pre-cast F slot',
  'combo.preCastNone': 'None',
  'combo.preCastFNeed2': 'Need at least 2 spells to pre-cast F',
  'combo.preCastLabel': 'Pre-cast',
  'combo.practice': 'Practice',
  'combo.edit': 'Edit',
  'combo.delete': 'Delete',
  'combo.empty': 'No combos yet. Click "New combo" to create one.',
  'combo.duplicateSpell': 'Each spell can appear only once in a combo',
  'combo.optimalPath': 'Optimal path',
  'combo.optimalPathHint': 'Fewest-keystroke sequence solved by FIFO orb queue',
  'combo.optimalPathEmpty': 'Empty combo has no optimal path',
  'combo.toggleOptimalPath': 'Show/hide optimal path',
  'progress.group': 'Combo progress',

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
  'dashboard.noSuccessInRange': 'No successful rounds in this range.',
  'dashboard.rhythmTitle': 'Keystroke Rhythm Scatter',
  'dashboard.round': 'Round',
  'dashboard.allCombos': 'All combos',
  'dashboard.notEvaluated': 'Not evaluated',
  'dashboard.ratio': 'ratio',
  'dashboard.excess': 'excess',
  'dashboard.successRate': 'Success',
  'dashboard.successRateHint': 'Successful rounds / total rounds in range (chart shows successes only)',
  'dashboard.successRateUnknown': 'Success: Unknown',
  'dashboard.totalRounds': 'Total rounds',
  'dashboard.bestSpeed': 'Best speed',

  'metrics.orbRatio': 'Orb ratio',
  'metrics.keyRatio': 'Keystroke ratio',
  'metrics.excess': 'Excess orbs',
  'metrics.duration': 'Duration (ms)',
  'metrics.durationScore': 'Speed score',
  'metrics.failedNA': 'N/A (failed run)',

  'scatter.xAxis': 'Relative time (ms)',
  'scatter.yAxis': 'Interval (ms)',

  'slot.first': 'D · Slot 1',
  'slot.second': 'F · Slot 2',
  'slot.empty': 'Empty',
  'slot.group': 'Spell slots',
  'orb.emptySlot': 'Empty',
  'orb.group': 'Elemental orbs',

  // ── Help page ──
  'help.overview.title': 'Overview',
  'help.overview.body': 'Invoker combines three elemental orbs, then presses R to invoke one of 10 spells. Cast keys: in DOTA2 mode, D = slot 1 and F = slot 2; in LEGACY mode, each spell has its own dedicated key.',
  'help.overview.fifo': 'Orbs form a FIFO queue (max 3): new orbs enqueue at the tail, the head is pushed out. Orb order is preserved after invoking, directly affecting the next spell\'s minimal orb switches.',
  'help.spells.title': 'Ten Spells Recipes',
  'help.spells.body': 'Below are all spells and their elemental recipes (order-independent). Pressing R matches by multiset.',
  'help.practice.title': 'Practice',
  'help.practice.keys': 'Q / W / E switch orbs · R invoke · D / F cast the spell',
  'help.practice.freePlay': 'The "Practice" tab defaults to free-play mode — press anything, no stats recorded.',
  'help.practice.comboFlow': 'Pick a combo from "Combos" to start guided practice. The top shows the current combo and a progress bar; cast target spells in order to advance.',
  'help.practice.finished': 'After a combo ends, it stays on the evaluation screen showing three metrics. No auto-loop.',
  'help.practice.space': 'Press Space to instantly restart the next round — no mouse needed.',
  'help.practice.preCast': 'For pre-cast combos, orbs already hold the last pre-cast spell\'s recipe at start (no need to re-invoke). Pre-cast release keys follow invoke order: the last-invoked spell occupies the D slot, the earlier one is pushed to F.',
  'help.practice.sound': 'Casting a spell / a successful invoke plays the matching sound effect; the ⚙ gear settings panel at the top lets you toggle spell sounds and kill sounds independently, persisted in settings.',
  'help.practice.recipe': 'Below the free-practice area there is a "Spell Recipes 👁" header row — click to expand/collapse a reference panel listing all 10 spells with their 3-element recipes (elements shown as icons, ordered Q→W→E) for quick lookup by users unfamiliar with the spells. Note: this eye button is different from the "optimal path" eye button on the combo practice page.',
  'help.combo.title': 'Combo Library',
  'help.combo.create': 'Click "New combo", add spells in sequence (duplicates allowed). Optionally pre-cast the first two spells as a starting state.',
  'help.combo.preCastOrder': 'Pre-cast F slot = spells[0] (first invoked, first cast); Pre-cast D slot = spells[1] (last invoked, later cast). You must select F before D.',
  'help.combo.optimalPath': 'The editor and combo cards show an "optimal path": the fewest-keystroke sequence solved from the FIFO orb queue, following the "switch-invoke-cast one at a time" rhythm. When the orb-switch count ties, repeated keys are grouped together (e.g. EEW over EWE) for ergonomics.',
  'help.combo.toggle': 'The eye button next to the practice title toggles optimal-path visibility; the setting persists.',
  'help.metrics.title': 'Review Metrics',
  'help.metrics.intro': 'The review trend chart normalizes three metrics to 0-100% (higher is better), plotting only successful rounds. A badge in the top-right shows the success rate.',
  'help.metrics.orbRatio': 'Orb ratio = optimal orb switches / actual orb switches. Only counts Q/W/E, measuring orb efficiency. 100% means zero excess switches.',
  'help.metrics.keyRatio': 'Keystroke ratio = optimal total keystrokes / actual total keystrokes. Covers all valid keys (Q/W/E/R/D/F); extra R presses, miscasts, and backtracking all lower the score.',
  'help.metrics.durationScore': 'Speed score = fastest round duration / this round\'s duration. The fastest round in range is the 100-point benchmark.',
  'help.metrics.successRate': 'Success rate = successful rounds / total rounds (including failures). Badge color: green ≥ 80%, amber 50-80%, red < 50%, grey = unknown (no data).',
  'help.metrics.failedNote': 'Failed rounds are excluded from the trend chart (to avoid dragging down the curve) but counted in the success rate.',
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
