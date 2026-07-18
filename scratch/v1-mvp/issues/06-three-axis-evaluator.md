# 06 — 三维评估引擎

Status: ready-for-agent

## What to build

实现 doc.md §4.2 的三维评估模型,对一次 `ExecutionSession` 产出三个正交维度的 `SessionMetrics`,并在 UI 上展示结果。

三个维度:

- **① 成功率(Success Rate,二值):** 按 doc.md §4.2 维度① —— 每个目标技能必须**按 `spells` 序列顺序,既合成(按 R 出现在槽位)又释放(按释放键放出)** 才算该步通过;只合成未释放、或释放了非当前目标 = 该步未通过。任一步未通过 → 整轮 `status = FAILED`;全部按序合成+释放完成 → `SUCCESS`。
- **② 切球达成率(Optimal Orb Ratio):** 按 doc.md §4.2 维度② ——
  - 只统计元素球切换(Q/W/E)次数,不含 R 与释放键。
  - `optimalOrbSwitches` 用**贪心近似**计算:每切一个技能时尽可能复用当前头顶已有的球,从起手状态(含预切,预切不计入分子分母)推导到切完整条连招的最少切球次数。
  - `actualOrbSwitches` = 会话内玩家按 Q/W/E 的总次数。
  - 切球达成率 = `optimalOrbSwitches / actualOrbSwitches × 100%`。
  - `excessOrbSwitches = actualOrbSwitches − optimalOrbSwitches`,UI 上标"多切了 N 次球",并可给出推荐切法。
  - FAILED 轮次:维度②记为 N/A。
- **③ 时长(Duration):** 按 doc.md §4.2 维度③ —— 起点 = 玩家第一个有效按键的时刻;终点 = 最后一个目标技能成功释放的时刻;单位毫秒。FAILED 轮次时长仍可记录,但不进入"成功轮次时长排行"(排行留 v2)。

UI 展示:会话结束后(或选中历史会话时)显示三个维度的结果 —— 成功/失败、达成率%、时长 ms、多切 N 次球。

## Acceptance criteria

- [ ] 一次全对(按序合成+释放全部目标技能)的会话 → `status = SUCCESS`。
- [ ] 任一步合成错误或释放了非当前目标技能 → `status = FAILED`。
- [ ] 切球达成率只数 Q/W/E,不含 R/释放键;`optimalOrbSwitches` 用贪心近似(复用当前头顶已有球)计算。
- [ ] 预切起手的切球不计入分子分母(`preCastSlots` 中的技能,其切球已在会话外完成)。
- [ ] `excessOrbSwitches` 正确计算,UI 能展示"多切了 N 次球"。
- [ ] 时长 = 首个有效按键 → 末个目标技能成功释放,毫秒精度。
- [ ] FAILED 轮次的切球达成率显示为 N/A,时长可显示但不进排行。
- [ ] 三维评估算法(成功判定、贪心最优切球、时长起止、预切剔除)有单元测试覆盖,含至少 3 条经典连招场景的端到端断言。
- [ ] 评估结果在 UI 上清晰展示(成功/失败 + 达成率% + 时长ms + 多切次数)。

## Blocked by

- `Issue 05`(会话产出完整 ActionNode[] 与 ExecutionSession)
