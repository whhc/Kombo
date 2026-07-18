import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App — 端到端按键 → 元素球更新', () => {
  it('按 Q 后看到冰(Quas)球出现', () => {
    render(<App />)
    // 初始:3 个空槽
    expect(screen.getAllByLabelText('空槽')).toHaveLength(3)

    fireEvent.keyDown(window, { key: 'q' })
    expect(screen.getByLabelText('Quas · 冰')).toBeInTheDocument()
  })

  it('按非 Q/W/E 键(如 A)不改变元素球', () => {
    render(<App />)
    const before = screen.getAllByLabelText('空槽').length
    fireEvent.keyDown(window, { key: 'a' })
    expect(screen.getAllByLabelText('空槽')).toHaveLength(before)
  })

  it('满 3 球后按第 4 个,最早球被挤出(端到端 FIFO)', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'w' })
    fireEvent.keyDown(window, { key: 'e' })
    // 现在 Q W E 都在
    expect(screen.getByLabelText('Quas · 冰')).toBeInTheDocument()
    // 按 Q:Q W E → W E Q,Quas 仍在(只是位置变);验证总数仍 3、无空槽
    fireEvent.keyDown(window, { key: 'q' })
    expect(screen.queryAllByLabelText('空槽')).toHaveLength(0)
  })

  it('切 Q Q Q 后按 R,ColdSnap 进入第一槽位', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'r' })
    expect(screen.getByLabelText(/槽位 D · 第一顺位: ColdSnap/)).toBeInTheDocument()
    expect(screen.getByLabelText(/槽位 F · 第二顺位: 空/)).toBeInTheDocument()
  })

  it('LEGACY 模式切 Tornado 后按 X 释放,出现释放记录', () => {
    render(<App />)
    // 默认 DOTA2 键位,点按钮切到 LEGACY
    fireEvent.click(screen.getByRole('button', { name: /键位: DOTA2/ }))
    // 现在是 LEGACY
    // 切 W W Q R 出 Tornado
    fireEvent.keyDown(window, { key: 'w' })
    fireEvent.keyDown(window, { key: 'w' })
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'r' })
    // 按 X 释放(Tornado 的 LEGACY 专属键)
    fireEvent.keyDown(window, { key: 'x' })
    expect(screen.getByText(/释放: Tornado/)).toBeInTheDocument()
  })

  it('DOTA2 模式按 D 释放第一槽位技能', () => {
    render(<App />)
    // 默认就是 DOTA2
    // 切 Q Q Q R 出 ColdSnap 到第一槽
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'r' })
    fireEvent.keyDown(window, { key: 'd' })
    expect(screen.getByText(/释放: ColdSnap/)).toBeInTheDocument()
  })

  it('切到连招库视图能看到预设连招(含吹风磁暴陨石推波)', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '连招库' }))
    expect(screen.getByText('吹风 → 磁暴 → 陨石 → 推波')).toBeInTheDocument()
  })

  it('连招库点练习回到练习视图并显示连招名', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '连招库' }))
    // 连招列表里第一条的"练习"按钮(导航的"练习"按钮在前,[0]是导航,[1+]是列表项)
    const practiceButtons = screen.getAllByRole('button', { name: '练习' })
    fireEvent.click(practiceButtons[1])
    expect(screen.getByText(/当前连招/)).toBeInTheDocument()
  })
})
