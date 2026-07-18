# Kombo - 卡尔连招模拟器

一个给 Dota/Dota2 卡尔(Invoker)爱好者的桌面练习工具。模拟切球(Quas/Wex/Exort)、祈唤(Invoke)、释放(Cast)的完整链路,支持连招编辑、自动统计、趋势复盘。

## 安装

从 [Releases](../../releases) 下载最新 `Kombo_x.x.x_x64-setup.exe`,双击安装即可。Windows 10+ 免额外依赖。

## 功能

- **自由练习**:任意切球/祈唤/释放,最近 10 个释放技能展示在下方
- **连招练习**:自定义或预设连招(吹风→磁暴→陨石→推波 等),按序释放后自动统计
- **自动循环**:完成一轮后 0.5s 自动开始下一轮,持续练手感
- **复盘趋势**:Dashboard 选择连招,查看历时/切球达成率随时间变化趋势
- **双主题双语言**:DOTA1/DOTA2 图标主题(点击头像切换),中/英文切换
- **DOTA1/DOTA2 键位**:传统键位(Y/V/G/C/X...)与 Dota2 默认键(D/F),按主题绑定

## 快捷键

| 键 | 功能 |
|---|---|
| `Q` / `W` / `E` | 切元素球(冰/雷/火,FIFO 至多 3 个) |
| `R` | 祈唤(合成当前 3 球为技能) |
| 释放键(按方案不同) | 释放槽位技能 |

**LEGACY(传统键)**:Y=ColdSnap / V=GhostWalk / G=IceWall / C=EMP / X=Tornado / Z=Alacrity / T=SunStrike / F=ForgeSpirit / D=ChaosMeteor / B=DeafeningBlast

**DOTA2(默认键)**:D=第一顺位 / F=第二顺位

## 开发

```bash
npm install          # 安装前端依赖
npm run dev          # 纯前端开发(Vite + React)
npm run test         # 运行测试
npm run tauri dev    # Tauri 桌面应用开发
npm run tauri build  # 打包 Windows 安装包
```

技术栈:Vite + React + TypeScript + Tailwind CSS + Tauri v2(Rust)

## License

MIT
