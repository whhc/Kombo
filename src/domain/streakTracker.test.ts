import { describe, it, expect } from 'vitest'
import { StreakTracker } from './streakTracker'

describe('StreakTracker — 两套独立击杀计数', () => {
  it('首次成功 → FirstBlood(多杀),连杀<3不播', () => {
    const t = new StreakTracker()
    const r = t.onRoundSuccess(1000)
    expect(r.multi).toBe('FirstBlood')
    expect(r.streak).toBeNull() // streak=1,<3 不播连杀
  })

  it('连续成功:多杀 Double/Triple/Ultra/Rampage;连杀 3 起播', () => {
    const t = new StreakTracker()
    t.onRoundSuccess(1000) // 1: FirstBlood
    let r = t.onRoundSuccess(2000) // 2
    expect(r.multi).toBe('DoubleKill')
    expect(r.streak).toBeNull() // streak=2
    r = t.onRoundSuccess(3000) // 3
    expect(r.multi).toBe('TripleKill')
    expect(r.streak).toBe('KillingSpree') // streak=3
    r = t.onRoundSuccess(4000) // 4
    expect(r.multi).toBe('UltraKill')
    expect(r.streak).toBe('Dominating')
    r = t.onRoundSuccess(5000) // 5
    expect(r.multi).toBe('Rampage')
    expect(r.streak).toBe('MegaKill')
    r = t.onRoundSuccess(6000) // 6+
    expect(r.multi).toBe('Rampage') // 6 仍 Rampage
    expect(r.streak).toBe('Unstoppable')
  })

  it('连杀序列:7=WickedSick/8=MonsterKill/9=Godlike/10+=BeyondGodlike', () => {
    const t = new StreakTracker()
    for (let i = 0; i < 8; i++) t.onRoundSuccess(i * 1000) // 到 streak=8(MonsterKill)
    expect(t.onRoundSuccess(8000).streak).toBe('Godlike') // 9
    expect(t.onRoundSuccess(8500).streak).toBe('BeyondGodlike') // 10
    expect(t.onRoundSuccess(8600).streak).toBe('BeyondGodlike') // 11
  })

  it('多杀 18s 窗口超时 → 多杀重计;连杀不受窗口影响', () => {
    const t = new StreakTracker()
    t.onRoundSuccess(0) // multi=1 FirstBlood, streak=1
    t.onRoundSuccess(5000) // multi=2 Double, streak=2
    // 间隔超 18s
    const r = t.onRoundSuccess(5000 + 18001)
    expect(r.multi).toBeNull() // multi 重计为 1,firstBloodTaken 已 true → 不播
    expect(r.streak).toBe('KillingSpree') // streak=3 不受窗口影响
    // 下一次 → multi=2 Double
    expect(t.onRoundSuccess(5000 + 18001 + 1000).multi).toBe('DoubleKill')
  })

  it('onFail(自身死亡):连杀与多杀均归零,firstBloodTaken 保留', () => {
    const t = new StreakTracker()
    t.onRoundSuccess(0)
    t.onRoundSuccess(1000)
    t.onRoundSuccess(2000) // streak=3, multi=3
    t.onFail()
    expect(t.getStreak()).toBe(0)
    // 重新成功:streak=1 不播连杀;multi=1 但 firstBloodTaken 已 true → 不播
    const r = t.onRoundSuccess(3000)
    expect(r.streak).toBeNull()
    expect(r.multi).toBeNull()
    // 再成功:streak=2 不播;multi=2 Double
    const r2 = t.onRoundSuccess(4000)
    expect(r2.streak).toBeNull()
    expect(r2.multi).toBe('DoubleKill')
  })

  it('reset(重新进入连招):全部重置,含 firstBloodTaken', () => {
    const t = new StreakTracker()
    t.onRoundSuccess(0)
    t.reset()
    expect(t.getStreak()).toBe(0)
    // reset 后首次成功 → 再次 FirstBlood
    expect(t.onRoundSuccess(1000).multi).toBe('FirstBlood')
  })
})
