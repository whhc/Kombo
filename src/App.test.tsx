import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// App 层只测视图路由与连招库入口;
// 按键练习行为由 PlayZone.test.tsx 覆盖,
// 切球/祈唤/释放由 domain 层单测覆盖。

describe('App — 视图路由', () => {
  it('默认渲染练习视图且无选中连招时显示引导', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: '练习' })).toBeInTheDocument()
    expect(screen.getByText(/从.+连招库.+选择/)).toBeInTheDocument()
  })

  it('切到连招库视图能看到预设连招(含吹风磁暴陨石推波)', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '连招库' }))
    expect(screen.getByText('吹风 → 磁暴 → 陨石 → 推波')).toBeInTheDocument()
  })

  it('连招库点练习选中连招,回到练习视图显示连招名', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '连招库' }))
    const practiceButtons = screen.getAllByRole('button', { name: '练习' })
    fireEvent.click(practiceButtons[1]) // 列表第一条的练习按钮
    expect(screen.getByText(/当前连招/)).toBeInTheDocument()
  })

  it('SettingsBar: DOTA1 图标时键位锁定 LEGACY', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /图标: DOTA2/ }))
    // 切到 DOTA1 图标
    expect(screen.getByText(/锁定 LEGACY/)).toBeInTheDocument()
  })
})
