import type { ActionNode } from './types'

export interface ScatterPoint {
  /** X:相对首点的时间(ms,0ms 启动) */
  x: number
  /** Y:与上一次按键的间隔(ms) */
  y: number
  actionType: ActionNode['actionType']
  key: string
}

/**
 * 把会话的 ActionNode 序列转成节奏散点(doc.md §5.2):
 * - X 轴:相对时间线(首点为 0ms)
 * - Y 轴:两次按键间隔
 * - 保留 actionType/key 供图例区分(切球/祈唤/释放/空放)
 */
export function toScatterPoints(actions: readonly ActionNode[]): ScatterPoint[] {
  if (actions.length === 0) return []
  const base = actions[0].timestamp
  let prevTs = base
  return actions.map((a, i) => {
    const x = a.timestamp - base
    const y = i === 0 ? 0 : a.timestamp - prevTs
    prevTs = a.timestamp
    return { x, y, actionType: a.actionType, key: a.key }
  })
}
