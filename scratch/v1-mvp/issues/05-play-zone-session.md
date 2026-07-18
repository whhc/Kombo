# 05 — 主练习区会话与宽松继续

Status: ready-for-agent

## What to build

加载一条 `TargetCombo` 开始练习会话,实现 doc.md §5.1 主练习区与"宽松继续"失败处理模型(doc.md §0 定位 + grill 共识)。

具体行为:

- **会话生命周期:** 用户从连招列表选一条 `TargetCombo` 进入主练习区,点击"开始"启动一次 `ExecutionSession`;会话记录所有 `ActionNode`(切球/祈唤/释放/MISS_CAST)与起止时间戳。
- **预切起手应用:** 若 `TargetCombo.preCastSlots` 非空,会话开始时即把预切技能挂入对应槽位(doc.md §4.3),预切技能的"切球+R"不计入本次会话统计(切球达成率与时长在 Issue 06 实现,本切片先把数据记齐)。
- **进度条温和提示(doc.md §5.1):** UI 底部显示目标连招队列进度条,高亮当前应释放的下一个目标技能作为提示;**不**闪烁、**不**自动高亮该切哪几个球(保留练习意义)。
- **宽松继续(grill 共识 + doc.md §5.1):** 切错技能(合成错误)或释放顺序错误时,**不**中断会话 —— 进度条把该错误步骤标红,玩家可继续按完整条连招;直到玩家点"结束"或完成全部目标技能,会话才结束并统一判定。
- **会话产出:** 会话结束时生成完整 `ExecutionSession`(含 `actions: ActionNode[]`、`startTime`、`endTime`),落盘 IndexedDB,供 Issue 06 评估与 Issue 07 复盘使用。
  - `status` 字段(SUCCESS/FAILED)本切片可暂留空或粗判,精确判定在 Issue 06。

此切片把"练"这条主路径打通 —— 从选连招到按完一轮产出可评估的会话数据。

## Acceptance criteria

- [ ] 从连招列表选一条 `TargetCombo` 进入主练习区,点"开始"后窗口能接收按键、元素球/槽位/进度条实时更新。
- [ ] 进度条按 `spells` 序列展示,高亮当前应释放的下一个目标技能;玩家正确释放该技能后,高亮推进到下一个。
- [ ] 切错技能或释放顺序错误时,会话**不中断**,错误步骤在进度条标红,玩家可继续按键。
- [ ] 预切起手:若 `preCastSlots = {d: Tornado, f: EMP}`,会话开始时 D/F 槽即显示 Tornado/EMP;起手状态不计入本次切球/时长统计的数据准备就绪(精确剔除在 Issue 06)。
- [ ] 会话结束时(玩家点"结束"或全部目标技能释放完),生成完整 `ExecutionSession` 并写入 IndexedDB。
- [ ] `ExecutionSession.actions` 完整记录每个有效按键的 `actionType`/`key`/`spellName`/`timestamp`/`timeSinceLastMs`。
- [ ] 会话状态机(开始/进行中/结束、宽松继续的错误标记)有单元测试覆盖。

## Blocked by

- `Issue 04`(目标连招定义就绪,会话需加载 TargetCombo)
