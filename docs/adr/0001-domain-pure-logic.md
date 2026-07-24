# ADR-0001：domain 层零 I/O 依赖

- 状态：Accepted
- 日期：2026-07-24

## 背景

Kombo 的核心逻辑（切球/合成/释放/评估/求解）是纯函数，不依赖任何运行时环境。
但应用需要持久化数据（Session/Combo）和播放音效，这些是 I/O 副作用。

如果把 `localStorage` 或 `Audio` 直接写进 domain 函数，会导致：
- domain 无法在 Node/jsdom 测试环境运行
- 存储后端无法替换（如从 localStorage 迁移到 tauri-plugin-store）
- 音效副作用污染纯逻辑测试

## 决策

**domain/ 层保持零 I/O 依赖**。所有副作用通过**接口抽象注入**：

- `SessionStorage` / `ComboStorage` 接口（`getItem`/`setItem`），由调用方传入具体后端
- `playSpellSound` / `playKillSound` 等音效函数在 `sound/` 层，domain 不调用
- `KillTier` / `streakToTier` 等纯逻辑放 `domain/killTier.ts`，`soundManager` 反向依赖 domain

## 结果

- domain 函数全部可纯单元测试（注入内存后端），无需 mock 浏览器 API
- 2026 年数据持久化从 localStorage 迁移到 tauri-plugin-store 时，domain 层零改动——
  只需新增实现同一接口的 `storeBackend`（见 ADR-0003 的内存缓存层设计）
- 音效逻辑的测试通过 `vi.mock` 拦截，验证注入点调用即可
