# Kombo — 领域语言（Ubiquitous Language）

本文件是 Kombo 项目的单一权威术语表。代码、issue、测试名、文档中提及以下概念时，
必须使用此处定义的术语，不得漂移到同义词。

> 单上下文仓库（single-context）：本文件 + `docs/adr/` 在 repo 根。
> 缺失 ADR 时静默继续；与现有 ADR 冲突时显式声明。

---

## 核心实体（Core Entities）

| 术语 | 含义 | 代码位置 |
|---|---|---|
| **Element** | 三元素：Quas(Q/冰)、Wex(W/雷)、Exort(E/火) | `domain/types.ts` |
| **Orb** | 头顶元素球。组成 **FIFO 队列**（至多 3 个）：新球入队尾，队首被挤出。球序在合成后完整保留 | `domain/orbEngine.ts` |
| **Spell** | 卡尔可合成的 10 种技能（ColdSnap / GhostWalk / IceWall / EMP / Tornado / Alacrity / SunStrike / ForgeSpirit / ChaosMeteor / DeafeningBlast） | `domain/spellBook.ts` |
| **Recipe** | 技能配方：3 个 Element 的组合。合成判定用**多重集匹配**（顺序无关） | `domain/spellBook.ts` `SPELL_RECIPE` |
| **Slot** | 双技能槽位：D 槽（第一顺位）、F 槽（第二顺位）。新合成的技能占据 D 槽，原 D 槽技能被推到 F 槽 | `domain/slotEngine.ts` |
| **Invoke** | 祈唤：按 R，把当前 3 球按 Recipe 多重集匹配合成为 Spell | `domain/spellBook.ts` `invoke()` |
| **Cast** | 释放：按释放键释放槽位技能。命中目标序列推进 progress；未命中记为 MISS_CAST | `domain/invokerEngine.ts` |

---

## 连招域（Combo Domain）

| 术语 | 含义 |
|---|---|
| **TargetCombo** | 目标连招：有序的 Spell 序列 + 可选 PreCast。`domain/types.ts` |
| **PreCast** | 预切起手：连招开始时头顶已挂的预切技能球序（玩家无需重新切出）。F 槽 = spells[0]（先合成、先释放）；D 槽 = spells[1]（后合成、后释放） |
| **OptimalPath** | 最优键序：基于 FIFO Orb 队列 + BFS 求解的**最少按键序列**，遵循"切一个合一个放一个"实战节奏。切球数相同时三级裁决：最少切球 → 重复按键分组 → 跟随配方。`domain/solver.ts` |
| **KeybindScheme** | 键位方案：DOTA2（D/F 按槽位）/ LEGACY（Y/V/G/C... 每技能专属键）。`domain/keymap.ts` |

---

## 练习域（Practice Domain）

| 术语 | 含义 |
|---|---|
| **Session** | 练习会话：一次连招练习的完整记录。`domain/sessionEngine.ts` |
| **ActionNode** | 按键记录：每次有效按键（ORB/INVOKE/CAST/MISS_CAST）的节点，含时间戳与间隔 |
| **Round** | 轮次：一次从起手到完成的连招练习。完成态可空格重开下一轮 |
| **FreePlay** | 自由模式：无目标连招，任意按键不计入统计 |
| **ComboPractice** | 连招模式：按序释放 TargetCombo 推进 progress |
| **Cooldown** | 技能冷却：释放成功后该技能 2 秒冷却（时钟扫描遮蔽），冷却期内重复释放被拦截 |
| **FailedStep** | 跑偏步骤：宽松继续模式下，错序释放的步骤序号集合。有 FailedStep 的 Session 判定 FAILED |
| **Streak** | 连杀：一条命（连招失败前）累计的成功轮次数。3+ 触发广播（大杀特杀→...→超神） |
| **MultiKill** | 多杀：18 秒窗口内连续成功轮次。1=FirstBlood/2=双杀/.../5+=暴走 |
| **FirstBlood** | 一血：仅首次击杀触发，reset 后可再次触发 |

---

## 评估域（Evaluation Domain）

| 术语 | 含义 |
|---|---|
| **Metrics** | 三维评估指标，归一化到 0-100%（越高越好）。`domain/evaluator.ts` |
| **OrbRatio** | 切球达成率 = 最优切球数 / 实际切球数。只看 Q/W/E |
| **KeyRatio** | 总按键达成率 = 最优总按键数 / 实际总按键数。涵盖 Q/W/E/R/D/F |
| **SpeedScore** | 速度得分 = 范围内最快轮次时长 / 本轮时长。最快轮次为 100 分基准 |

---

## 存储域（Storage Domain）

| 术语 | 含义 |
|---|---|
| **SessionStore** | 会话存储：可换后端的存储抽象（接口注入）。`domain/sessionStore.ts` |
| **ComboStore** | 连招存储：同上。`domain/comboStore.ts` |
| **StoreBackend** | 统一存储后端：tauri-plugin-store 的同步内存缓存层。`domain/storeBackend.ts` |

---

## 图标主题（Icon Theme）

| 术语 | 含义 |
|---|---|
| **IconTheme** | 图标主题：DOTA1（方框，War3 风格）/ DOTA2（圆形，官方风格）。DOTA1 强制 LEGACY 键位。`domain/icons.ts` |
