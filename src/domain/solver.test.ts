import { describe, it, expect } from 'vitest'
import { solveCombo } from './solver'
import type { TargetCombo } from './types'

function comboOf(spells: TargetCombo['spells'], preCastSlots: TargetCombo['preCastSlots'] = {}): TargetCombo {
  return { comboId: 'c', name: 't', spells, preCastSlots }
}

describe('solver — 吹风→磁暴 最优解', () => {
  it('Tornado(WWQ) → EMP(WWW):最少 4 次切球,复用尾序', () => {
    // 用户期望:QWW(R)-W(R) → 球序 [Q,W,W] 合 Tornado → 切 W 挤出 Q 得 [W,W,W] 合 EMP
    const r = solveCombo(comboOf(['Tornado', 'EMP']))
    expect(r).not.toBeNull()
    expect(r!.orbSwitches).toBe(4)
    // 验证:切球序列应包含 Q,W,W(合 Tornado)、W(合 EMP)
    const orbSeq = r!.steps.filter((s) => s.kind === 'ORB').map((s) => (s as any).key).join('')
    expect(orbSeq).toBe('QWWW')
  })

  it('贪心多重集会错误地说 3+1=4,但关键在于球序 [Q,W,W] 使 EMP 只需 1 次切球', () => {
    // 反例:若切成 WWQ(同样合 Tornado),[W,W,Q]→[W,W,W] 需 3 次切球(W 挤不掉尾位的 Q)
    // 本用例验证 BFS 找到的是 QWW(球序 [Q,W,W])而非 WWQ(球序 [W,W,Q])
    const r = solveCombo(comboOf(['Tornado', 'EMP']))
    const orbs = r!.steps.filter((s) => s.kind === 'ORB').map((s) => (s as any).key as 'Q' | 'W' | 'E')
    // 前 3 个切球应排成 Q,W,W,而非 W,W,Q 或 W,Q,W
    expect(orbs.slice(0, 3).join('')).toBe('QWW')
  })
})

describe('solver — 单技能', () => {
  it('单技能 Tornado 需切满 3 球', () => {
    const r = solveCombo(comboOf(['Tornado']))
    expect(r!.orbSwitches).toBe(3)
  })

  it('单技能 EMP(WWW):可能切球序列为 W,W,W', () => {
    const r = solveCombo(comboOf(['EMP']))
    const orbSeq = r!.steps.filter((s) => s.kind === 'ORB').map((s) => (s as any).key).join('')
    expect(orbSeq).toBe('WWW')
  })
})

describe('solver — 预切起手', () => {
  it('预切 Tornado+EMP 后从 ChaosMeteor 起手,复用 EMP 残球', () => {
    // 新语义:preCastSlots.f = spells[0] = Tornado, preCastSlots.d = spells[1] = EMP
    // 合成顺序:先合 Tornado→再合 EMP,头顶留 [W,W,W](EMP 配方)
    // ChaosMeteor(EEW):[W,W,W]→[W,E,E] 即可合,2 次切球
    const r = solveCombo(
      comboOf(['Tornado', 'EMP', 'ChaosMeteor'], { d: 'EMP', f: 'Tornado' }),
    )
    expect(r).not.toBeNull()
    expect(r!.orbSwitches).toBe(2)
    // 前两步是预切释放:合成 Tornado→EMP 后槽位=[EMP,Tornado](D=EMP, F=Tornado)
    // 故释放 spells[0]=Tornado 时按 F,释放 spells[1]=EMP 时按 D
    expect(r!.steps[0]).toEqual({ kind: 'CAST', key: 'F', spell: 'Tornado' })
    expect(r!.steps[1]).toEqual({ kind: 'CAST', key: 'D', spell: 'EMP' })
    expect(r!.steps[2].kind).toBe('ORB')
  })

  it('无预切时从零开始,切球数 = 完整 3 球', () => {
    const r = solveCombo(comboOf(['SunStrike'])) // EEE
    expect(r!.orbSwitches).toBe(3)
  })
})

describe('solver — 球序复用 vs 损失', () => {
  it('EMP(WWW) → Tornado(WWQ):切 Q 挤出队首 W,需 3 次切球', () => {
    // 反向:[W,W,W]→需 [?,?,Q] 球序中恰含 WWQ
    // 多重集贪心会说 1 次,但 FIFO 下:
    //   [W,W,W] --切Q--> [W,W,Q] 这就是 Tornado 配方!只切 1 次。
    // 故 EMP→Tornado 真实只需 1 次切球(与 Tornado→EMP 对称)
    const r = solveCombo(comboOf(['EMP', 'Tornado']))
    expect(r!.orbSwitches).toBe(3 + 1) // EMP 3 + Tornado 复用 1
    const orbSeq = r!.steps.filter((s) => s.kind === 'ORB').map((s) => (s as any).key).join('')
    expect(orbSeq).toBe('WWWQ')
  })

  it('ColdSnap(QQQ) → SunStrike(EEE):全换,3 次', () => {
    const r = solveCombo(comboOf(['ColdSnap', 'SunStrike']))
    expect(r!.orbSwitches).toBe(6) // 3 + 3
  })

  it('ForgeSpirit(EEQ) → ChaosMeteor(EEW):只换 1 球', () => {
    // [E,E,Q]→[E,E,W] 切 W 挤掉 Q,1 次
    const r = solveCombo(comboOf(['ForgeSpirit', 'ChaosMeteor']))
    expect(r!.orbSwitches).toBe(4) // 3 + 1
  })
})

describe('solver — 多技能衔接', () => {
  it('经典 4 连招能解出非平凡最短切球数', () => {
    // SunStrike(EEE) → ChaosMeteor(EEW) → DeafeningBlast(QWE) → ColdSnap(QQQ)
    const r = solveCombo(
      comboOf(['SunStrike', 'ChaosMeteor', 'DeafeningBlast', 'ColdSnap']),
    )
    expect(r).not.toBeNull()
    // 每步球序复用最少:
    //   空→EEE:3
    //   EEE→EEW:1 (切 W 挤 E)
    //   EEW→QWE 或 EWQ... 取能复用最多的:1 次切球不行(EEW 与 QWE 差 2 元素)
    //   实际 EEW→EQW... 需 2 次切球(切 Q,E 挤出)
    //   QWE→QQQ:2 次
    //   3+1+2+2 = 8(若 BFS 找到更优球序可能更少,只测上界)
    expect(r!.orbSwitches).toBeLessThanOrEqual(8)
    expect(r!.orbSwitches).toBeGreaterThanOrEqual(7)
  })
})

describe('solver — 边界', () => {
  it('空连招返回空解', () => {
    const r = solveCombo(comboOf([]))
    expect(r).toEqual({ steps: [], orbSwitches: 0, startingOrbs: [] })
  })

  it('startingOrbs: 无预切时为空数组', () => {
    const r = solveCombo(comboOf(['Tornado']))
    expect(r!.startingOrbs).toEqual([])
  })

  it('startingOrbs: 预切 Tornado+EMP 后为最后合成的 EMP 配方 WWW', () => {
    // 新语义:f=Tornado(spells[0]) 先合成, d=EMP(spells[1]) 后合成,头顶 = EMP 配方
    const r = solveCombo(comboOf(['Tornado', 'EMP', 'ChaosMeteor'], { d: 'EMP', f: 'Tornado' }))
    expect(r!.startingOrbs).toEqual(['W', 'W', 'W'])
  })

  it('单个预切技能时,steps 只含预切释放(无切球/合成)', () => {
    // 预切意味着该技能已合成在槽,玩家仍需按释放键才能打出
    const r = solveCombo(comboOf(['Tornado'], { d: 'Tornado' }))
    expect(r!.orbSwitches).toBe(0)
    expect(r!.steps).toEqual([{ kind: 'CAST', key: 'D', spell: 'Tornado' }])
  })

  it('输出包含完整的 INVOKE 与 CAST 步骤', () => {
    const r = solveCombo(comboOf(['Tornado']))
    const kinds = r!.steps.map((s) => s.kind)
    expect(kinds).toContain('ORB')
    expect(kinds).toContain('INVOKE')
    expect(kinds).toContain('CAST')
  })

  it('LEGACY 方案下 CAST 键为专属键(Tornado→X)', () => {
    const r = solveCombo(comboOf(['Tornado']), 'LEGACY')
    const castStep = r!.steps.find((s) => s.kind === 'CAST') as any
    expect(castStep.key).toBe('X')
  })

  it('DOTA2 方案下 CAST 键为 D/F(按槽位)', () => {
    const r = solveCombo(comboOf(['Tornado']), 'DOTA2')
    const castStep = r!.steps.find((s) => s.kind === 'CAST') as any
    // Tornado 首次 INVOKE 后进第一顺位,释放键 = D
    expect(castStep.key).toBe('D')
  })
})
