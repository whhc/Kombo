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
}

/** 序列化为哈希 key(忽略槽位顺序? 不——槽位顺序也影响释放可行性) */
function stateKey(s: SearchState): string {
  return `${s.orbs.join('')}|${s.progress}|${s.slots[0] ?? '_'}>${s.slots[1] ?? '_'}|${s.pendingInvoke ?? '_'}`
}

const ORB_KEYS: ReadonlyArray<'Q' | 'W' | 'E'> = ['Q', 'W', 'E']

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
  }

  // ── 0-1 BFS:切球代价 1,合成/释放代价 0 ───────────────────────
  // 用桶式 BFS(代价只有 0/1),避免 Dijkstra 的堆开销
  type Frontier = { state: SearchState; steps: SolverStep[]; cost: number }
  const visited = new Set<string>()
  // 用双数组代替 deque:currentBucket 处理代价为当前最小的一层
  // 简化:直接用 Dijkstra(代价只有 0/1,堆操作 O(log n),状态少完全够)
  const heap: Frontier[] = []
  const pushHeap = (f: Frontier) => {
    // 插入排序按 cost 升序(状态数 < 1 万,简单数组够用)
    let i = 0
    while (i < heap.length && heap[i].cost <= f.cost) i++
    heap.splice(i, 0, f)
  }

  heap.push({ state: start, steps: preCastSteps, cost: 0 })
  visited.add(stateKey(start))

  while (heap.length > 0) {
    const { state, steps, cost } = heap.shift()!
    const current = state

    // 目标:所有目标技能都已释放
    if (current.progress === spells.length) {
      return { steps, orbSwitches: cost, startingOrbs: start.orbs }
    }

    const nextTarget = spells[current.progress]

    // 实战节奏约束:R 合成后必须立即 CAST 才能继续切球(每个技能立即释放)。
    // 用 pendingInvoke 标记"刚合成但未释放"的状态,在该状态下禁止 ORB 转移。

    // ── 转移1:切球(Q/W/E),代价 1 ─────────────────────────────
    // pendingInvoke 时禁止切球,强制先释放
    if (current.pendingInvoke === null) {
      for (const el of ORB_KEYS) {
        const newOrbs = pushOrb(current.orbs, el)
        const ns: SearchState = {
          orbs: newOrbs,
          progress: current.progress,
          slots: current.slots,
          pendingInvoke: null,
        }
        const k = stateKey(ns)
        if (!visited.has(k)) {
          visited.add(k)
          pushHeap({
            state: ns,
            steps: [...steps, { kind: 'ORB', key: el }],
            cost: cost + 1,
          })
        }
      }
    }

    // ── 转移2:R 合成(代价 0),仅当球满且 pendingInvoke 为空 ───────
    // 剪枝:只考虑合成 nextTarget(其他合成对释放进度无直接帮助)。
    // pendingInvoke 时不能再合成,必须先释放当前 pending 的技能。
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
        }
        const k = stateKey(ns)
        if (!visited.has(k)) {
          visited.add(k)
          pushHeap({
            state: ns,
            steps: [...steps, { kind: 'INVOKE', key: 'R', spell: invoked }],
            cost, // 0 代价
          })
        }
      }
    }

    // ── 转移3:释放当前目标技能(代价 0),推进 progress ──────────
    // 释放键:DOTA2 时按 D/F(槽位索引);LEGACY 时按专属键。
    // 释放后清空 pendingInvoke,允许继续切球。
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
      }
      const k = stateKey(ns)
      if (!visited.has(k)) {
        visited.add(k)
        pushHeap({
          state: ns,
          steps: [...steps, { kind: 'CAST', key: castKey, spell: nextTarget }],
          cost, // 0 代价
        })
      }
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
