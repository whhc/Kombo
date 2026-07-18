# 04 — 目标连招定义与连招编辑器

Status: ready-for-agent

## What to build

实现 doc.md §4.1 的 `TargetCombo` 数据模型,以及供玩家创建/编辑连招的连招编辑器 UI,并内置若干经典连招预设。

具体行为:

- **`TargetCombo` 数据模型**(doc.md §4.1):
  ```typescript
  interface TargetCombo {
    comboId: string;
    name: string;                                  // 如 "吹风磁暴陨石推波"
    spells: SpellName[];                           // 有序技能序列,允许重复
    preCastSlots: { d?: SpellName; f?: SpellName }; // 预切起手槽位,可空
    // 约束:preCastSlots 中的技能必须是 spells 的前缀
  }
  ```
- **连招编辑器 UI:**
  - 技能拖拽面板:从 10 个技能里选 N 个排成 `spells` 序列,支持调整顺序、允许同一技能重复(如 `[Tornado, Tornado, EMP]`)。
  - 预切起手配置:可选 D 槽、F 槽各一个技能,候选项限定为 `spells` 的前缀(约束在前端与持久化层双重校验)。
  - 命名、保存、删除连招。
- **预设库:** v1 内置 2~3 条经典连招(至少含"吹风→磁暴→陨石→推波"这一条),作为开箱即用的练习内容。
- **持久化:** `TargetCombo` 存 IndexedDB,重启后保留;主练习区(下一切片)能通过 `comboId` 加载。

此切片是连招侧的"输入"闭环 —— 编辑器产出的 `TargetCombo` 是后续评估器比对的基准。

## Acceptance criteria

- [ ] 能创建一条新连招:选拖技能成序列、命名、保存,保存后可在连招列表看到。
- [ ] `spells` 序列允许同一技能重复(如两个 Tornado),编辑器不拦截。
- [ ] 预切起手:`preCastSlots.d` 与 `preCastSlots.f` 可各自选一个技能(或留空);候选项只含 `spells` 的前缀(如 spells = [Tornado, EMP, Meteor, Blast] 时,预切只能选 Tornado/EMP 的组合)。
- [ ] 预切前缀约束被违反时(如手动篡改),持久化层或加载层拒绝并报错。
- [ ] v1 内置至少 2 条经典连招预设,其中一条是"吹风→磁暴→陨石→推波"(Tornado→EMP→ChaosMeteor→DeafeningBlast)。
- [ ] 能删除用户创建的连招;预设连招可删除或锁定(由实现决定,但删除后不能影响系统稳定性)。
- [ ] `TargetCombo` 持久化到 IndexedDB,应用重启后连招列表完整恢复。
- [ ] 数据模型与前缀约束有单元测试覆盖。

## Blocked by

- `Issue 03`(释放识别与技能枚举就绪,编辑器才能正确引用技能)
