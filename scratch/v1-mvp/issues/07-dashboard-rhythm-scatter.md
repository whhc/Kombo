# 07 — 数据复盘区与节奏散点图

Status: ready-for-agent

## What to build

实现 doc.md §5.1 Dashboard 数据复盘区与 §5.2 按键节奏散点图,让玩家能从历史 `ExecutionSession` 中复盘练习表现。

具体行为:

- **Dashboard 入口:** 从主界面进入数据复盘区,展示历史 `ExecutionSession` 列表(按时间倒序),每条显示连拓名、状态(SUCCESS/FAILED)、三维 metrics 摘要。
- **会话详情/节奏散点图(doc.md §5.2):** 选中某条 session,集成 ECharts 渲染按键节奏散点图 ——
  - **X 轴:** 相对时间线(0ms 启动,即会话首个有效按键为 0)。
  - **Y 轴:** 两次按键之间的间隔延迟(ms)。
  - 设计目的:直观暴露玩家在哪两个技能的切换之间出现"大脑卡顿"或"手指粘连"。
- **时间区间过滤(doc.md §5.3):** 前端提供时间选择器(今日/近 7 天/近 30 天,或自定义 `startDate`/`endDate`),动态过滤 IndexedDB 查询结果并重绘图表。
- **成长趋势折线图:** v1 **不做**(doc.md §5.2 标注为 v2,需多轮数据才有意义),本切片只在 UI 预留位置或不在 v1 出现该 tab。

## Acceptance criteria

- [ ] Dashboard 能从 IndexedDB 查询并展示历史 `ExecutionSession` 列表,按时间倒序。
- [ ] 每条 session 显示连拓名、SUCCESS/FAILED 状态、三维 metrics(达成率%/时长/多切次数)摘要。
- [ ] 选中某条 session,ECharts 节奏散点图正确渲染:X=相对时间(ms)、Y=两次按键间隔(ms)。
- [ ] 散点图能区分按键类型(切球 Q/W/E、祈唤 R、释放、MISS_CAST 可用不同颜色/图例),帮助定位卡顿点。
- [ ] 时间区间过滤器(今日/近7天/近30天)能正确过滤查询结果并重绘列表与图表。
- [ ] 成长趋势折线图在 v1 不出现(或明确标注"v2 上线"),不产生空图表误导用户。
- [ ] Dashboard 在无历史数据时显示友好的空状态引导("先去练一轮吧")。

## Blocked by

- `Issue 06`(三维 metrics 产出,Dashboard 展示依赖其结果)
