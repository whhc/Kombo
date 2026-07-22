import type { SpellName } from '../domain/types'

/**
 * 音效基础设施层。
 *
 * 设计约定(与 domain/ 纯函数层解耦):
 *   - 音效播放是 I/O 副作用,不可放进 domain/
 *   - 映射以 SpellName 为 key,与 iconTheme 无关(DOTA1/DOTA2 主题共用同一套 dota2 风格音效资产)
 *   - 所有播放 API 用 enabled 短路;失败静默吞掉(浏览器 autoplay policy 等),不阻断游戏
 *
 * 音频文件位于 public/sounds/dota2/,Vite 原地拷贝到 dist/,运行时用绝对 URL 引用。
 */

/** 技能 → 音频文件 URL(以 public/ 为根的绝对路径) */
export const SPELL_SOUND: Record<SpellName, string> = {
  ColdSnap: 'sounds/dota2/Cold_Snap.mp3',
  GhostWalk: 'sounds/dota2/Ghost_Walk.mp3',
  IceWall: 'sounds/dota2/Ice_Wall.mp3',
  EMP: 'sounds/dota2/E.M.P..mp3',
  Tornado: 'sounds/dota2/Tornado.mp3',
  Alacrity: 'sounds/dota2/Alacrity.mp3',
  SunStrike: 'sounds/dota2/Sun_Strike.mp3',
  ForgeSpirit: 'sounds/dota2/Forge_Spirit.mp3',
  ChaosMeteor: 'sounds/dota2/Chaos_Meteor.mp3',
  DeafeningBlast: 'sounds/dota2/Deafening_Blast.mp3',
}

/** 合成音(按 R 成功合成技能时播放) */
export const INVOKE_SOUND = 'sounds/dota2/Invoke.mp3'

/** 连杀音效文件名(后续迭代补音频;未就位时 playKillSound 静默 no-op) */
export const KILL_SOUND: Partial<Record<KillTier, string>> = {
  FirstBlood: 'sounds/dota2/First_Blood.mp3',
  DoubleKill: 'sounds/dota2/Double_Kill.mp3',
  TripleKill: 'sounds/dota2/Triple_Kill.mp3',
  UltraKill: 'sounds/dota2/Ultra_Kill.mp3',
  Rampage: 'sounds/dota2/Rampage.mp3',
}

/** 连杀等级 */
export type KillTier = 'FirstBlood' | 'DoubleKill' | 'TripleKill' | 'UltraKill' | 'Rampage'

/**
 * 连续成功次数 → 连杀等级(Dota2 广播音效序列)。
 * 1=First Blood / 2=Double / 3=Triple / 4=Ultra / 5+=Rampage(暴走)。
 */
export function streakToTier(streak: number): KillTier | null {
  if (streak < 1) return null
  if (streak === 1) return 'FirstBlood'
  if (streak === 2) return 'DoubleKill'
  if (streak === 3) return 'TripleKill'
  if (streak === 4) return 'UltraKill'
  return 'Rampage'
}

// ──────────────────────────────────────────────────────────────
// 播放实现:懒预加载 + 缓存 HTMLAudioElement,连放时 cloneNode 重叠播放
// ──────────────────────────────────────────────────────────────

/** URL → 预解码的 Audio 模板(供 cloneNode 重叠播放) */
const cache = new Map<string, HTMLAudioElement>()

function getUrl(path: string): string {
  // 绝对路径(public 根),Tauri 下也以应用根为基准
  return `/${path}`
}

function ensureLoaded(path: string): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null // 测试环境(jsdom 无 Audio)
  let tmpl = cache.get(path)
  if (!tmpl) {
    tmpl = new Audio(getUrl(path))
    tmpl.preload = 'auto'
    cache.set(path, tmpl)
  }
  return tmpl
}

/**
 * 预加载全部音效(App 挂载时调用一次)。
 * 触发浏览器提前解码,避免首次播放延迟。失败静默(资产缺失不阻断启动)。
 */
export function preloadSounds(): void {
  const paths = [INVOKE_SOUND, ...Object.values(SPELL_SOUND), ...Object.values(KILL_SOUND)]
  for (const p of paths) {
    if (p) try { ensureLoaded(p) } catch { /* 忽略 */ }
  }
}

/** 内部播放:clone 出独立实例以支持快速重叠(连招释放极快) */
function playPath(path: string, enabled: boolean): void {
  if (!enabled) return
  try {
    const tmpl = ensureLoaded(path)
    if (!tmpl) return
    const inst = tmpl.cloneNode(true) as HTMLAudioElement
    void inst.play().catch(() => { /* autoplay policy 等吞掉 */ })
  } catch {
    /* 忽略 */
  }
}

/** 释放技能时播放对应音效 */
export function playSpellSound(spell: SpellName, enabled: boolean): void {
  playPath(SPELL_SOUND[spell], enabled)
}

/** 成功合成技能(按 R 出有效技能)时播放 */
export function playInvokeSound(enabled: boolean): void {
  playPath(INVOKE_SOUND, enabled)
}

/**
 * 连杀音效(后续迭代接入)。
 * streak ≥ 1 时播对应等级;音频未就位(资产缺失)静默 no-op。
 */
export function playKillSound(streak: number, enabled: boolean): void {
  const tier = streakToTier(streak)
  if (!tier) return
  const path = KILL_SOUND[tier]
  if (path) playPath(path, enabled)
}
