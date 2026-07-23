import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { t as translate } from './domain/i18n'

// App 层测视图路由 + 语言切换 + 自由练习 + combos 内嵌。
// 按键练习行为由 PlayZone.test 覆盖。

describe('App — 视图路由 + i18n', () => {
  it('默认渲染练习视图(自由模式,无目标连招)', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: translate('zh', 'nav.practice') })).toBeInTheDocument()
    // 自由模式:显示"自由练习"而非旧引导消息
    expect(screen.getByText(translate('zh', 'practice.freePlay'))).toBeInTheDocument()
  })

  it('切到连招库视图能看到预设连招', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'nav.combos') }))
    // 预设连招名现在用 auto. 前缀动态解析,zh/DOTA2="强袭飓风 → 电磁脉冲 → 混沌陨石 → 超震声波"
    expect(screen.getByText('强袭飓风 → 电磁脉冲 → 混沌陨石 → 超震声波')).toBeInTheDocument()
  })

  it('连招库点练习进入内嵌练习(不切tab,显示Quit按钮)', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'nav.combos') }))
    const btns = screen.getAllByRole('button', { name: translate('zh', 'combo.practice') })
    fireEvent.click(btns[1]) // [0]是nav的练习,[1]是列表第一条
    expect(screen.getByRole('button', { name: translate('zh', 'practice.quit') })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(translate('zh', 'practice.currentCombo')))).toBeInTheDocument()
  })

  it('内嵌练习点 Quit 返回连招列表', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'nav.combos') }))
    const btns = screen.getAllByRole('button', { name: translate('zh', 'combo.practice') })
    fireEvent.click(btns[1])
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'practice.quit') }))
    expect(screen.getByRole('heading', { name: translate('zh', 'combo.library') })).toBeInTheDocument()
  })

  it('DOTA1 图标时键位锁定 LEGACY', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: `${translate('zh', 'settings.iconThemeToggle')}: DOTA2` }))
    // 锁定提示文案在齿轮弹层内,先点开
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.title') }))
    expect(screen.getByText(new RegExp(translate('zh', 'settings.keybind.lockedLegacy')))).toBeInTheDocument()
  })

  it('语言切换后导航与自由练习文案变英文', () => {
    render(<App />)
    // 语言切换按钮在齿轮弹层内,先点开
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.title') }))
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.language') }))
    expect(screen.getByRole('button', { name: translate('en', 'nav.practice') })).toBeInTheDocument()
    expect(screen.getByText(translate('en', 'practice.freePlay'))).toBeInTheDocument()
  })

  it('语言切换后连招库预设名也跟随变英文', () => {
    render(<App />)
    // 语言切换按钮在齿轮弹层内,先点开
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.title') }))
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.language') }))
    fireEvent.click(screen.getByRole('button', { name: translate('en', 'nav.combos') }))
    // en/DOTA2="Tornado → EMP → Chaos Meteor → Deafening Blast"
    expect(screen.getByText('Tornado → EMP → Chaos Meteor → Deafening Blast')).toBeInTheDocument()
  })

  it('技能音效开关:齿轮面板内切换 ON/OFF', () => {
    render(<App />)
    // 打开齿轮设置面板
    fireEvent.click(screen.getByRole('button', { name: translate('zh', 'settings.title') }))
    // 技能音效与击杀音效两行都用 soundOff/soundOn aria-label,取第一个(技能音效)
    const soundBtns = screen.getAllByRole('button', { name: translate('zh', 'settings.soundOff') })
    expect(soundBtns[0].textContent).toBe('ON')
    fireEvent.click(soundBtns[0])
    // 点击后:静音态 OFF
    const afterBtns = screen.getAllByRole('button', { name: translate('zh', 'settings.soundOn') })
    expect(afterBtns[0].textContent).toBe('OFF')
  })
})
