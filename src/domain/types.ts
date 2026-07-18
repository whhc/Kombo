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

/** 目标连招(doc.md §4.1 TargetCombo) */
export interface TargetCombo {
  comboId: string
  /** 展示名。预设连招用 i18n key(以 "preset." 开头,见 resolveComboName);
   *  用户自建为原样文本。 */
  name: string
  /** 有序技能序列,允许重复 */
  spells: SpellName[]
  /** 预切起手槽位,可空(空=从零开始练);约束:必须是 spells 前缀 */
  preCastSlots: { d?: SpellName; f?: SpellName }
}

/** 三维评估结果(Issue 06 实现,此处占位) */
export interface SessionMetrics {
  // 维度①:SUCCESS/FAILED(已在 session.status 里)
  // 维度②:切球达成率
  optimalOrbSwitches: number | null
  actualOrbSwitches: number
  orbRatio: number | null // 0..1,null=FAILED 轮次 N/A
  excessOrbSwitches: number
  // 维度③:时长
  durationMs: number
}

/** 单次连招练习会话(doc.md §4.1 ExecutionSession) */
export interface ExecutionSession {
  sessionId: string
  comboId: string
  status: 'SUCCESS' | 'FAILED'
  actions: ActionNode[]
  startTime: number
  endTime: number
  metrics: SessionMetrics | null // Issue 06 填充;未评估时为 null
}
