/**
 * 击杀播报等级(Dota2 广播音效)。
 *
 * 两套独立序列(每次成功击杀同时推进,各自播各自的音):
 *   - 连杀(KILL_STREAK):一条命期间累计击杀。失败(死亡)即重置。
 *     3=KillingSpree / 4=Dominating / 5=MegaKill / 6=Unstoppable /
 *     7=WickedSick / 8=MonsterKill / 9=Godlike / 10+=BeyondGodlike
 *   - 多杀(MULTI_KILL):18s 窗口内连续击杀。超时重计。
 *     2=DoubleKill / 3=TripleKill / 4=UltraKill / 5+=Rampage
 *
 * FirstBlood(一血):仅首次击杀触发,reset 后可再次触发。
 */

/** 连杀等级(一条命累计) */
export type StreakTier =
  | 'KillingSpree'
  | 'Dominating'
  | 'MegaKill'
  | 'Unstoppable'
  | 'WickedSick'
  | 'MonsterKill'
  | 'Godlike'
  | 'BeyondGodlike'

/** 多杀等级(18s 窗口) */
export type MultiKillTier = 'FirstBlood' | 'DoubleKill' | 'TripleKill' | 'UltraKill' | 'Rampage'

/** 一次成功击杀要播的音效(可能两套都有) */
export interface KillAnnounce {
  streak: StreakTier | null
  multi: MultiKillTier | null
}

const STREAK_LEVELS: Record<number, StreakTier> = {
  3: 'KillingSpree',
  4: 'Dominating',
  5: 'MegaKill',
  6: 'Unstoppable',
  7: 'WickedSick',
  8: 'MonsterKill',
  9: 'Godlike',
}

/** 连杀数(一条命)→ 等级;<3 不播,≥10 均为 BeyondGodlike */
export function streakToTier(streak: number): StreakTier | null {
  if (streak < 3) return null
  return STREAK_LEVELS[streak] ?? 'BeyondGodlike'
}

const MULTI_LEVELS: Record<number, MultiKillTier> = {
  1: 'FirstBlood',
  2: 'DoubleKill',
  3: 'TripleKill',
  4: 'UltraKill',
}

/** 多杀数(18s 窗口内)→ 等级;≥5 均为 Rampage */
export function multiToTier(multi: number): MultiKillTier | null {
  if (multi < 1) return null
  return MULTI_LEVELS[multi] ?? 'Rampage'
}
