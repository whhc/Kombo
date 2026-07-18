import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { t as translate } from './domain/i18n'

// App 层测视图路由 + 语言切换 + 连招库入口。
// 按键练习行为由 PlayZone.test 覆盖。

describe('App — 视图路由 + i18n', () => {
  it('默认渲染练习视图且无选中连招时显示引导(中文)', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: translate('zh', 'nav.practice') })).toBeInTheDocument()
    expect(screen.getByText(translate('zh', 'practice.guide'))).toBeInTheDocument()
  })

  it('切到连招库视图能看到预设连招(预设名已翻译为中文)', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'nav.combos') }))
    expect(screen.getByText(translate('zh', 'preset.tornadoEmpMeteorBlast'))).toBeInTheDocument()
  })

  it('连招库点练习选中连招,回到练习视图显示连招名', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'nav.combos') }))
    const practiceButtons = screen.getAllByRole('button', { name: translate('zh', 'combo.practice') })
    fireEvent.click(practiceButtons[1]) // 列表第一条
    expect(screen.getByText(new RegExp(translate('zh', 'practice.currentCombo')))).toBeInTheDocument()
  })

  it('SettingsBar 图标按钮:切到 DOTA1 后键位锁定 LEGACY', () => {
    render(<App />)
    // SettingsBar 的图标按钮文本是 "图标: DOTA2"(精确全名,区别于头像的 toggle label)
    const iconBtn = screen.getByText(`${translate('zh', 'settings.iconTheme')}: ${translate('zh', 'settings.iconTheme.DOTA2')}`).closest('button')!
    fireEvent.click(iconBtn)
    expect(screen.getByText(new RegExp(translate('zh', 'settings.keybind.lockedLegacy')))).toBeInTheDocument()
  })

  it('语言切换:点语言按钮后导航与引导文案变英文', () => {
    render(<App />)
    // 默认中文
    expect(screen.getByText(translate('zh', 'practice.guide'))).toBeInTheDocument()
    // 点语言切换按钮(显示 "中 / EN")
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.language') }))
    // 现在导航应变英文
    expect(screen.getByRole('button', { name: translate('en', 'nav.practice') })).toBeInTheDocument()
    expect(screen.getByText(translate('en', 'practice.guide'))).toBeInTheDocument()
  })

  it('语言切换后预设连招名也跟随变英文', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.language') }))
    fireEvent.click(screen.getByRole('button', { name: translate('en', 'nav.combos') }))
    expect(screen.getByText(translate('en', 'preset.tornadoEmpMeteorBlast'))).toBeInTheDocument()
  })

  it('点击卡尔头像切换图标主题(DOTA2→DOTA1),且 DOTA1 时键位锁 LEGACY', () => {
    render(<App />)
    // 默认 DOTA2,头像 aria-label 含 DOTA2(用独立 toggle label 区分 SettingsBar)
    const heroBtn = screen.getByRole('button', { name: `${translate('zh', 'settings.iconThemeToggle')}: DOTA2` })
    fireEvent.click(heroBtn)
    // 切到 DOTA1:头像标签变 DOTA1,SettingsBar 图标标签也变 DOTA1
    expect(screen.getByRole('button', { name: `${translate('zh', 'settings.iconThemeToggle')}: DOTA1` })).toBeInTheDocument()
    // DOTA1 图标 → 键位锁定 LEGACY
    expect(screen.getByText(new RegExp(translate('zh', 'settings.keybind.lockedLegacy')))).toBeInTheDocument()
  })
})
