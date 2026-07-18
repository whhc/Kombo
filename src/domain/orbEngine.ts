import type { Element, Key, ActionNode } from './types'

/** 玩家头顶元素球状态(最多 3 个,FIFO) */
export interface OrbState {
  orbs: Element[]
}

/** ORB 键集合 */
const ORB_KEYS: ReadonlySet<Key> = new Set(['Q', 'W', 'E'])

function isOrbKey(key: Key): key is Element {
  return ORB_KEYS.has(key)
}

/**
 * 处理一次按键,返回新状态与产出的 ActionNode。
 * - Q/W/E:切球(FIFO,满 3 个挤出最早的)
 * - 其他键:忽略,返回 null action
 *
 * @param lastTimestamp 上一次有效操作的 timestamp(用于算 timeSinceLastMs);
 *                      首次操作传 0 即可(间隔即当前时间)。
 *
 * 纯函数,不依赖 React,易于测试。
 */
export function handleKey(
  state: OrbState,
  key: Key,
  now: number,
  lastTimestamp = 0,
): { state: OrbState; action: ActionNode | null } {
  if (!isOrbKey(key)) {
    return { state, action: null }
  }

  // FIFO 入队:满 3 个时移除队首
  const next = state.orbs.length >= 3 ? [...state.orbs.slice(1), key] : [...state.orbs, key]

  const action: ActionNode = {
    actionType: 'ORB',
    key,
    timestamp: now,
    timeSinceLastMs: now - lastTimestamp,
  }

  return { state: { orbs: next }, action }
}
