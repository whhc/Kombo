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
})
