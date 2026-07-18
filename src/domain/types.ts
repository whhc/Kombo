// 领域数据模型 —— 整个应用的单一事实源(SSOT)
// 依据 doc.md §4.1 与 grill 共识。domain/ 层不依赖 React,可纯函数测试。

/** 卡尔三元素:冰 Quas / 雷 Wex / 火 Exort */
export type Element = 'Q' | 'W' | 'E'

/** 卡尔十技能 */
export type SpellName =
  | 'ColdSnap'
  | 'GhostWalk'
  | 'IceWall'
  | 'EMP'
  | 'Tornado'
  | 'Alacrity'
  | 'SunStrike'
  | 'ForgeSpirit'
  | 'ChaosMeteor'
  | 'DeafeningBlast'

/** 玩家按下的物理键(大写) */
export type Key = string

/** 单次操作动作记录(doc.md §4.1 ActionNode) */
export interface ActionNode {
  actionType: 'ORB' | 'INVOKE' | 'CAST' | 'MISS_CAST'
  key: Key
  /** 实际合成/释放出的技能名(INVOKE/CAST 时有值) */
  spellName?: SpellName
  /** 毫秒时间戳 */
  timestamp: number
  /** 距上次操作的间隔(毫秒) */
  timeSinceLastMs: number
}
