import type { SpellName } from '../domain/types'
import type { KillAnnounce, MultiKillTier, StreakTier } from '../domain/killTier'

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

/** 连杀音效(一条命累计:KillingSpree→BeyondGodlike) */
export const STREAK_SOUND: Record<StreakTier, string> = {
  KillingSpree: 'sounds/dota2/KillingSpree.mp3',
  Dominating: 'sounds/dota2/Dominating.mp3',
  MegaKill: 'sounds/dota2/MegaKill.mp3',
  Unstoppable: 'sounds/dota2/Unstoppable.mp3',
  WickedSick: 'sounds/dota2/WickedSick.mp3',
  MonsterKill: 'sounds/dota2/MonsterKill.mp3',
  Godlike: 'sounds/dota2/Godlike.mp3',
  BeyondGodlike: 'sounds/dota2/BeyondGodlike.mp3',
}

/** 多杀音效(18s 窗口:FirstBlood→Rampage) */
export const MULTI_KILL_SOUND: Record<MultiKillTier, string> = {
  FirstBlood: 'sounds/dota2/FirstBlood.mp3',
  DoubleKill: 'sounds/dota2/DoubleKill.mp3',
  TripleKill: 'sounds/dota2/TripleKill.mp3',
  UltraKill: 'sounds/dota2/UltraKill.mp3',
  Rampage: 'sounds/dota2/Rampage.mp3',
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
  const paths = [
    INVOKE_SOUND,
    ...Object.values(SPELL_SOUND),
    ...Object.values(STREAK_SOUND),
    ...Object.values(MULTI_KILL_SOUND),
  ]
  for (const p of paths) {
    try { ensureLoaded(p) } catch { /* 忽略 */ }
  }
}

/** 内部播放:clone 出独立实例以支持快速重叠(连招释放极快) */
function playPath(path: string, enabled: boolean): void {
  if (!enabled) return
  // 控制台打印音效名(无播放设备时便于测试验证)
  console.log(`[sound] ${path.split('/').pop()}`)
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
 * 击杀播报音效。传入 StreakTracker.onRoundSuccess 返回的 KillAnnounce,
 * 连杀(streak)与多杀(multi)各自播放,可能两段叠加。enabled=false 时静默。
 */
export function playKillSound(announce: KillAnnounce, enabled: boolean): void {
  if (announce.streak) playPath(STREAK_SOUND[announce.streak], enabled)
  if (announce.multi) playPath(MULTI_KILL_SOUND[announce.multi], enabled)
}
