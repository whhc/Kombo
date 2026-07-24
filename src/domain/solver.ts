import type { Element, SpellName, Key } from './types'
import { invoke } from './spellBook'
import { SPELL_RECIPE } from './spellBook'
import type { TargetCombo } from './types'
import type { KeybindScheme } from './keymap'

/**
 * 卡尔连招切球最优解求解器(doc.md §4.3)。
 *
 * 关键前提——法球是 FIFO 队列(最多 3 个),**球序在切球/合成后完整保留**:
 *   - 新球入队尾,队首被挤出
 *   - 合成(R)按多重集匹配配方,与球序无关
 *   - 合成后球序不变,作为下一技能的起点
 *
 * 这意味着:同一技能有多种合法球序(1~6 种),选哪种直接决定下一步代价。
 * 现有 evaluator.optimalOrbSwitches 的多重集贪心无法捕捉球序复用,
 * 也无法输出按键序列。本求解器用 0-1 BFS 在状态空间里求精确最短切球路径。
 *
 * 优化目标:**只计切球次数**(R 与释放键按规则补全位置但不计代价)。
 *   - 这与 doc.md §4.2 维度②口径一致
 *   - 不模拟冷却,不利用"连续 INVOKE 刷槽"等实战不存在的情况
 *
 * 四级词典裁决(切球数相同时的 tie-breaking,符合人体工学):
 *   - Primary = 切球次数(必须最优,决定 orbSwitches)
 *   - Secondary2 = 累计切球字典序(每个技能完成时的累计切球数,越早的技能越少越好;
 *     如 2+2 胜过 3+1,因为技能 0 只切 2 球而非 3 球)
 *   - Secondary = 相邻切球键不同次数("重复按键放在一起"分组偏好;EEW 胜过 EWE)
 *   - Tertiary = 合成时刻球序与规范配方 SPELL_RECIPE 的位置不匹配数(EEW 胜过 WEE)
 *   R/CAST 后重置 secondary 上下文(prevOrb=null),分组在每个切球 run 内独立生效。
 *
 * 约束(已与用户对齐):
 *   - 槽位三规则(新技能进首位、首位相同不变、次位提到首位)
 *   - 释放键要求技能必须在当前槽位
 *   - preCastSlots 作为求解器初始状态
 *   - 假设连招内同一技能不重复(实战标准);若重复,BFS 仍能解,但语义可能反直觉
 */

/** 求解器输出的一步动作 */
export type SolverStep =
  | { kind: 'ORB'; key: 'Q' | 'W' | 'E' }
  | { kind: 'INVOKE'; key: 'R'; spell: SpellName }
  | { kind: 'CAST'; key: Key; spell: SpellName }

export interface SolverResult {
  /** 完整按键序列(含切球、合成、释放),按时间顺序 */
  steps: SolverStep[]
  /** 最少切球次数(等价于 steps 中 ORB 步数) */
  orbSwitches: number
  /** 起手保留球序:预切连招下为最后一个预切技能的配方;无预切时为空数组 */
  startingOrbs: Element[]
}

/** 内部:搜索状态 = (头顶球序, 已释放目标数, 双槽位) */
interface SearchState {
  orbs: Element[] // 长度 0..3
  progress: number // 已释放的目标技能数(0..spells.length)
  slots: [SpellName | null, SpellName | null]
  /** 最近一次 R 合成但尚未释放的技能名;非 null 时禁止切球(强制立即释放) */
  pendingInvoke: SpellName | null
  /** 上一个 ORB 键;用于"重复按键分组"裁决。R/CAST 后置 null(重置分组上下文) */
  prevOrb: Element | null
  /** 每个已完成技能释放时的累计切球数(长度 == progress);用于"累计切球字典序"裁决 */
  cumulativeOrbs: number[]
}

/** 序列化为哈希 key(prevOrb 入 key,使不同分组路径都能被探索,不被 visited 丢弃)。
 *  注意:cumulativeOrbs 不入 key——同 (orbs,progress,slots,pending,prevOrb) 状态下,
 *  cumulativeOrbs 由 cost 独立裁决,入 key 会过度分裂状态空间。 */
function stateKey(s: SearchState): string {
  return `${s.orbs.join('')}|${s.progress}|${s.slots[0] ?? '_'}>${s.slots[1] ?? '_'}|${s.pendingInvoke ?? '_'}|${s.prevOrb ?? '_'}`
}

const ORB_KEYS: ReadonlyArray<'Q' | 'W' | 'E'> = ['Q', 'W', 'E']

/**
 * 复合代价(四级词典裁决),编码为单个大数以便堆排序:
 *   encoded = primary * BIG³ + secondary2 * BIG² + secondary * BIG + tertiary
 * 字典序 = 数值序。
 *   - Primary = 切球次数(必须最优,决定 orbSwitches)
 *   - Secondary2 = 累计切球字典序(每个技能完成时的累计切球数编码;越早少切越好)
 *   - Secondary = 相邻切球键不同次数("重复按键放在一起"分组偏好)
 *   - Tertiary = 合成时刻球序与规范配方 SPELL_RECIPE 的位置不匹配总数
 * 各级均有界:切球 ≤ 3×spells,累计 ≤ 30/spell。
 * 用结构化对象比较(非标量编码)避免累计切球字典序的数值溢出。
 */

/** 合成时刻:3 球队列 vs 规范配方的逐位不匹配数(tertiary 增量) */
function recipeMismatchDelta(orbs: Element[], spell: SpellName): number {
  const recipe = SPELL_RECIPE[spell]
  let mismatch = 0
  for (let i = 0; i < orbs.length; i++) {
    if (orbs[i] !== recipe[i]) mismatch++
  }
  return mismatch
}

/** FIFO 入队:满 3 时挤出队首 */
function pushOrb(orbs: Element[], el: Element): Element[] {
  return orbs.length >= 3 ? [...orbs.slice(1), el] : [...orbs, el]
}

/** 槽位三规则(同 slotEngine.invokeSpell) */
function invokeSlot(
  slots: [SpellName | null, SpellName | null],
  spell: SpellName,
): [SpellName | null, SpellName | null] {
  const [first, second] = slots
  if (first === spell) return slots // 规则2
  if (second === spell) return [spell, first] // 规则3
  return [spell, first] // 规则1
}

/**
 * 求解一条连招的最优按键序列(最少切球数)。
 *
 * @param combo 目标连招
 * @param scheme 释放键方案(DOTA2 → D/F 按槽位;LEGACY → 按专属键),仅影响 CAST 步的 key 字段,不影响代价
 * @returns 求解结果;若连招为空返回空解
 */
export function solveCombo(
  combo: TargetCombo,
  scheme: KeybindScheme = 'DOTA2',
): SolverResult | null {
  const spells = combo.spells
  if (spells.length === 0) return { steps: [], orbSwitches: 0, startingOrbs: [] }

  // ── 初始状态:从 preCastSlots 出发 ─────────────────────────────
  // preCastSlots.d/f 必须是 spells 的连续前缀(ComboEditor 已约束),
  // 表示起手前已经切好并合成了这些技能、写入了对应槽位,且已释放。
  // 故:
  //   - progress 跳过前 preCount 个
  //   - 起手头顶球序 = 最后一个预切技能的配方(SPELL_RECIPE 写死的某种顺序;
  //     预切因为是"已合成"的固定态,这里接受其默认顺序作为起点)
  //   - 起手槽位 = 预切后留下的两个技能(按 invoke 三规则推演)
  const preCount =
    (combo.preCastSlots.d ? 1 : 0) + (combo.preCastSlots.f ? 1 : 0)
  const preD = combo.preCastSlots.d
  const preF = combo.preCastSlots.f

  let startSlots: [SpellName | null, SpellName | null] = [null, null]
  let startOrbs: Element[] = []
  // 预切释放的按键(steps 前缀,不计切球代价但计入总按键数)。
  // 玩家在起手前已完成这些动作,故 BFS 不探索它们,但要把它们计入"完整最优路径"
  // 以保证 keyRatio 分子分母口径一致。
  //
  // 槽位推演(invokeSlot 三规则):R 合 Tornado → [Tornado,null];R 合 EMP → [EMP,Tornado]。
  // 故玩家释放 spells[0]=Tornado 时它在槽位 1(按 F),释放 spells[1]=EMP 时它在槽位 0(按 D)。
  // (注:DOTA2 中释放技能不改变槽位。)
  const preCastSteps: SolverStep[] = []
  if (preCount >= 1 && preD) {
    startSlots = invokeSlot(startSlots, preD)
  }
  if (preCount === 2 && preD && preF) {
    // 合成顺序:先合 preF(spells[0]) → 再合 preD(spells[1])。
    // invokeSlot 推演:第一次合 preF → [preF, null];第二次合 preD → [preD, preF]。
    // 最终槽位:D=preD, F=preF。
    // 释放顺序按 spells 序列:spells[0]=preF 先释放(按 F),spells[1]=preD 后释放(按 D)。
    startSlots = invokeSlot(startSlots, preF)
    startSlots = invokeSlot(startSlots, preD)
    preCastSteps.push({
      kind: 'CAST',
      key: scheme === 'DOTA2' ? 'F' : legacyReleaseKey(preF),
      spell: preF,
    })
    preCastSteps.push({
      kind: 'CAST',
      key: scheme === 'DOTA2' ? 'D' : legacyReleaseKey(preD),
      spell: preD,
    })
    startOrbs = [...SPELL_RECIPE[preD]] // 头顶 = 最后合成的 preD 配方
  } else if (preCount === 1 && preD) {
    // 单预切:仅有 preD = spells[0],合成后进 D 槽
    startSlots = invokeSlot(startSlots, preD)
    preCastSteps.push({
      kind: 'CAST',
      key: scheme === 'DOTA2' ? 'D' : legacyReleaseKey(preD),
      spell: preD,
    })
    startOrbs = [...SPELL_RECIPE[preD]]
  }

  const start: SearchState = {
    orbs: startOrbs,
    progress: preCount,
    slots: startSlots,
    pendingInvoke: null,
    prevOrb: null, // 预切起手不算"上一个 ORB",首个切球 run 从零开始分组
    cumulativeOrbs: [],
  }

  // ── Dijkstra:四级词典裁决代价 ────────────────────────────────
  // 用结构化比较(非标量编码)避免 cumulativeOrbs 字典序编码的数值溢出。
  // 四级:primary(总切球) > secondary2(累计切球字典序) > secondary(分组) > tertiary(配方)
  interface Cost { primary: number; cumOrbs: number[]; secondary: number; tertiary: number }
  type Frontier = { state: SearchState; steps: SolverStep[]; cost: Cost }
  const visited = new Set<string>()
  const heap: Frontier[] = []

  /** 四级字典序比较 c1 < c2 */
  function costLess(c1: Cost, c2: Cost): boolean {
    if (c1.primary !== c2.primary) return c1.primary < c2.primary
    // 累计切球字典序:逐位比较(长度可能不同,短的较小位补 0 等价)
    const n = Math.max(c1.cumOrbs.length, c2.cumOrbs.length)
    for (let i = 0; i < n; i++) {
      const a = c1.cumOrbs[i] ?? 0
      const b = c2.cumOrbs[i] ?? 0
      if (a !== b) return a < b
    }
    if (c1.secondary !== c2.secondary) return c1.secondary < c2.secondary
    return c1.tertiary < c2.tertiary
  }

  const pushHeap = (f: Frontier) => {
    // 插入排序按 costLess 升序(状态数 < 1 万,简单数组够用)
    let i = 0
    while (i < heap.length && costLess(heap[i].cost, f.cost)) i++
    heap.splice(i, 0, f)
  }

  heap.push({ state: start, steps: preCastSteps, cost: { primary: 0, cumOrbs: [], secondary: 0, tertiary: 0 } })

  while (heap.length > 0) {
    const { state, steps, cost } = heap.shift()!
    const current = state
    const ckey = stateKey(current)

    // 标准 Dijkstra:出队时去重。首次出队即最小代价(堆按 encoded cost 升序),
    // 故此处标记 visited 后,同状态更高代价的重复条目被跳过。
    // 注意:必须在出队而非入队去重 —— 三级裁决下,同状态可经不同前驱以不同
    // secondary/tertiary 入队,入队去重会丢弃更优裁决。
    if (visited.has(ckey)) continue
    visited.add(ckey)

    // 目标:所有目标技能都已释放
    if (current.progress === spells.length) {
      return { steps, orbSwitches: cost.primary, startingOrbs: start.orbs }
    }

    const nextTarget = spells[current.progress]

    // 实战节奏约束:R 合成后必须立即 CAST 才能继续切球(每个技能立即释放)。
    // 用 pendingInvoke 标记"刚合成但未释放"的状态,在该状态下禁止 ORB 转移。

    // ── 转移1:切球(Q/W/E) ─────────────────────────────────────
    // 代价:primary +1(切球);secondary +1 当 prevOrb 与本次不同(分组偏好)。
    // pendingInvoke 时禁止切球,强制先释放。
    if (current.pendingInvoke === null) {
      for (const el of ORB_KEYS) {
        const newOrbs = pushOrb(current.orbs, el)
        const ns: SearchState = {
          orbs: newOrbs,
          progress: current.progress,
          slots: current.slots,
          pendingInvoke: null,
          prevOrb: el, // 记录本次切球键,供下一步分组裁决
          cumulativeOrbs: current.cumulativeOrbs,
        }
        const adjDelta = current.prevOrb !== null && current.prevOrb !== el ? 1 : 0
        pushHeap({
          state: ns,
          steps: [...steps, { kind: 'ORB', key: el }],
          cost: { ...cost, primary: cost.primary + 1, secondary: cost.secondary + adjDelta },
        })
      }
    }

    // ── 转移2:R 合成,仅当球满且 pendingInvoke 为空 ──────────────
    // 代价:tertiary += recipeMismatchDelta(合成时刻球序偏离规范配方)。
    // 剪枝:只考虑合成 nextTarget。pendingInvoke 时不能再合成。
    if (current.orbs.length === 3 && current.pendingInvoke === null) {
      const invoked = invoke(current.orbs)
      // 只在合成结果 == nextTarget 时才有意义(为释放它推进 progress)
      if (invoked !== null && invoked === nextTarget) {
        const newSlots = invokeSlot(current.slots, invoked)
        const ns: SearchState = {
          orbs: current.orbs,
          progress: current.progress,
          slots: newSlots,
          pendingInvoke: invoked,
          prevOrb: null, // R 重置分组上下文
          cumulativeOrbs: current.cumulativeOrbs,
        }
        pushHeap({
          state: ns,
          steps: [...steps, { kind: 'INVOKE', key: 'R', spell: invoked }],
          cost: { ...cost, tertiary: cost.tertiary + recipeMismatchDelta(current.orbs, invoked) },
        })
      }
    }

    // ── 转移3:释放当前目标技能,推进 progress ───────────────────
    // 代价:primary/secondary2/secondary 均不变。tertiary 不变。
    // 释放键:DOTA2 时按 D/F(槽位索引);LEGACY 时按专属键。
    // 释放后清空 pendingInvoke,允许继续切球。
    // **快照累计切球数**:释放第 progress 个技能时,把当前 primary(总切球数)
    // 追加到 cumulativeOrbs,供"累计切球字典序"裁决(越早少切越好)。
    const slotIdx = current.slots.indexOf(nextTarget)
    if (slotIdx !== -1) {
      const castKey: Key =
        scheme === 'DOTA2'
          ? slotIdx === 0
            ? 'D'
            : 'F'
          : legacyReleaseKey(nextTarget)
      const ns: SearchState = {
        orbs: current.orbs,
        progress: current.progress + 1,
        slots: current.slots,
        pendingInvoke: null,
        prevOrb: null, // CAST 重置分组上下文
        cumulativeOrbs: [...current.cumulativeOrbs, cost.primary],
      }
      pushHeap({
        state: ns,
        steps: [...steps, { kind: 'CAST', key: castKey, spell: nextTarget }],
        cost: { ...cost, cumOrbs: ns.cumulativeOrbs },
      })
    }
  }

  // 无解(理论上不可能,除非连招里出现非法技能)
  return null
}

/** LEGACY 释放键:复用 keymap 但避免循环引用——直接内联查表 */
function legacyReleaseKey(spell: SpellName): Key {
  const map: Record<SpellName, Key> = {
    ColdSnap: 'Y',
    GhostWalk: 'V',
    IceWall: 'G',
    EMP: 'C',
    Tornado: 'X',
    Alacrity: 'Z',
    SunStrike: 'T',
    ForgeSpirit: 'F',
    ChaosMeteor: 'D',
    DeafeningBlast: 'B',
  }
  return map[spell]
}
