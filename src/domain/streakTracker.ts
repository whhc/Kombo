import type { KillAnnounce, MultiKillTier, StreakTier } from './killTier'
import { streakToTier, multiToTier } from './killTier'

/** 多杀判定时间窗口(18 秒) */
const MULTI_KILL_WINDOW_MS = 18000

/**
 * 连招击杀 streak 追踪器(两套独立计数)。
 *
 * 映射语义(连招练习):
 *   - 连招成功 = 击杀一名敌方英雄(自身未死)
 *   - 连招失败 = 自身死亡
 *
 * 两套计数:
 *   - streak(连杀):一条命期间累计成功轮次。失败即归零。
 *       3+ 触发 KillingSpree→...→BeyondGodlike
 *   - multi(多杀):18s 窗口内连续成功轮次。超时重计。
 *       1=FirstBlood / 2=Double / ... / 5+=Rampage
 *
 * FirstBlood:仅首次击杀(reset 后首次)触发,一轮内/重开不重复。
 *
 * 用法:
 *   - combo 切换/重新进入连招页 → tracker.reset()
 *   - 一轮成功 → tracker.onRoundSuccess(ts),返回要播的音效
 *   - 一轮失败(failedStep)→ tracker.onFail()
 */
export class StreakTracker {
  private streak = 0 // 连杀(一条命累计)
  private multi = 0 // 多杀(18s 窗口)
  private lastSuccessTs = 0
  private firstBloodTaken = false

  /** 一轮连招成功完成时调用,返回要播的连杀/多杀音效 */
  onRoundSuccess(ts: number): KillAnnounce {
    // ── 连杀(streak):每次成功 +1,失败才归零 ──
    this.streak += 1
    const streakTier: StreakTier | null = streakToTier(this.streak)

    // ── 多杀(multi):18s 窗口内连续才累计 ──
    const timedOut = this.lastSuccessTs > 0 && ts - this.lastSuccessTs > MULTI_KILL_WINDOW_MS
    this.multi = timedOut ? 1 : this.multi + 1
    this.lastSuccessTs = ts

    // FirstBlood:仅首次(reset 后首次)触发
    let multiTier: MultiKillTier | null
    if (!this.firstBloodTaken) {
      this.firstBloodTaken = true
      multiTier = 'FirstBlood'
    } else {
      multiTier = multiToTier(this.multi)
      // 多杀计数 <2 且非一血时不播多杀音(单杀无多杀广播)
      if (this.multi < 2) multiTier = null
    }

    return { streak: streakTier, multi: multiTier }
  }

  /** failedStep 触发(自身死亡):连杀归零;多杀归零;firstBloodTaken 保留 */
  onFail(): void {
    this.streak = 0
    this.multi = 0
  }

  /** 重新进入连招:重置全部(含 firstBloodTaken) */
  reset(): void {
    this.streak = 0
    this.multi = 0
    this.lastSuccessTs = 0
    this.firstBloodTaken = false
  }

  getStreak(): number {
    return this.streak
  }
}
