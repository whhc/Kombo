# 03 — 技能释放与键位方案(LEGACY 默认)

Status: ready-for-agent

## What to build

实现 doc.md §2.5 释放键识别流程,并落地 §2.4 的键位方案与图标主题切换。

具体行为:

- **释放识别:** 按 §2.5 流程,依据当前 `keybindScheme` 识别释放键 ——
  - `LEGACY`(默认):按 `Y`/`V`/`G`/`C`/`X`/`Z`/`T`/`F`/`D`/`B` 查 `LEGACY_KEYMAP` 反查,释放对应技能。
  - `DOTA2`:`D` → 释放第一槽位技能;`F` → 释放第二槽位技能。
- **MISS_CAST:** LEGACY 方案下按某技能专属键但该技能当前不在槽位、或 DOTA2 方案下按 `D`/`F` 但对应槽位为空 → 记录 `actionType: 'MISS_CAST'` 的 ActionNode,不产生有效释放。
- **有效释放:** 记录 `actionType: 'CAST'` 的 ActionNode,含 `spellName`。
- **`UserSettings` 与切换 UI:**
  - 设置项 `iconTheme: 'DOTA1' | 'DOTA2'`、`keybindScheme: 'LEGACY' | 'DOTA2'`。
  - 绑定关系:DOTA1 图标 → 强制 LEGACY 键位;DOTA2 图标 → 可选 LEGACY 或 DOTA2(默认 DOTA2)。
  - 用户在设置面板切换图标主题/键位方案,UI 立即反映(技能图标、键位提示)。
- v1 不模拟技能冷却(§2.5 已约定),释放键总是释放当前对应技能,可快速重复。

## Acceptance criteria

- [ ] 切出 Tornado(`W` `W` `Q` `R`)后,默认 LEGACY 方案下按 `X` → 记录 `CAST` 的 Tornado 释放。
- [ ] 槽位为空(或释放键对应技能不在槽位)时按释放键 → 记录 `MISS_CAST`,不改槽位状态。
- [ ] 切到 DOTA2 图标 + DOTA2 键位方案后,按 `D` 释放第一槽位技能、按 `F` 释放第二槽位技能。
- [ ] DOTA1 图标下,键位方案锁定为 LEGACY,UI 不允许切到 DOTA2;DOTA2 图标下可在 LEGACY/DOTA2 间切。
- [ ] 切换图标主题后,UI 上所有技能图标立即更新;切换键位方案后,UI 上的键位提示立即更新。
- [ ] `LEGACY_KEYMAP`、释放识别流程、键位方案/图标主题绑定关系有单元测试覆盖。
- [ ] `UserSettings` 能持久化到 IndexedDB(或在 setup skill 约定的本地存储层),重启后保留。

## Blocked by

- `Issue 02`(槽位状态机就绪,释放依赖槽位当前挂的技能)
