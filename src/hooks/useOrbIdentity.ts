import { useRef } from 'react'
import type { Element } from '../domain/types'

/**
 * 一个有身份的球:元素 + 稳定唯一 id。
 * id 跨渲染稳定,让 framer-motion 的 AnimatePresence 能 diff 出进/出/移动。
 */
export interface OrbWithId {
  id: number
  element: Element
}

/**
 * 把 Element[] 转成带稳定身份的 OrbWithId[],追踪 FIFO 队列变化。
 *
 * FIFO 语义(与 invokerEngine 一致):
 *   - 队列满(3)时,新球入队尾 → 队首(下标 0)被挤出
 *   - 队列未满时,新球入队尾 → 无球被挤出
 *   - 合成(R 键)不改 orbs,本 hook 不触发
 *
 * 身份追踪策略:
 *   把新旧队列按"保留前缀"对齐。若新队列 = 旧队列去掉队首若干个 + 追加队尾若干个,
 *   则被保留的球复用旧 id,新入队的球拿全新 id,被挤出的球自然消失。
 *
 *   特殊情况:新旧完全不同(如 resetRound 从预切起手重建),
 *   视为全部重建,所有球拿新 id。
 *
 * 实现说明:渲染期间同步读写 prevRef(为下次渲染准备派生值),这是 React 允许的模式
 * (同 useMemo 的计算时机)。counterRef 单调递增保证 id 全局唯一。
 */
export function useOrbIdentity(orbs: Element[]): OrbWithId[] {
  const prevRef = useRef<OrbWithId[]>([])
  const counterRef = useRef(0)

  const prev = prevRef.current

  let next: OrbWithId[]
  if (orbs.length === 0) {
    // 空队列:清空身份(轮次重置)
    next = []
  } else if (prev.length === 0) {
    // 从空到非空:全部是新球(起手/首批切球)
    next = orbs.map((element) => ({ id: ++counterRef.current, element }))
  } else {
    // 通用情况:找"挤出 drop 个旧球后,剩余前缀与新队列对齐"的最大保留长度
    const maxDrop = prev.length
    let bestLen = -1
    let bestDrop = 0
    for (let drop = 0; drop <= maxDrop; drop++) {
      const remaining = prev.slice(drop)
      if (remaining.length > orbs.length) continue
      let match = true
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].element !== orbs[i]) {
          match = false
          break
        }
      }
      if (match && remaining.length > bestLen) {
        bestLen = remaining.length
        bestDrop = drop
      }
    }

    if (bestLen < 0) {
      // 无任何公共前缀:全部重建(兜底)
      next = orbs.map((element) => ({ id: ++counterRef.current, element }))
    } else {
      const retained = prev.slice(bestDrop) // 保留的旧球(复用 id)
      const appended = orbs.slice(bestLen) // 新入队的球
      next = [
        ...retained,
        ...appended.map((element) => ({ id: ++counterRef.current, element })),
      ]
    }
  }

  // 同步更新,供下次渲染 diff
  prevRef.current = next
  return next
}
