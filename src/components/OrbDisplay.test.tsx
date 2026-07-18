import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrbDisplay } from './OrbDisplay'

describe('OrbDisplay — 元素球 UI', () => {
  it('空状态时显示 3 个空槽', () => {
    render(<OrbDisplay orbs={[]} />)
    const emptySlots = screen.getAllByLabelText('空槽')
    expect(emptySlots).toHaveLength(3)
  })

  it('渲染已切出的元素球(Q/W/E)', () => {
    render(<OrbDisplay orbs={['Q', 'W', 'E']} />)
    expect(screen.getByLabelText('Quas · 冰')).toBeInTheDocument()
    expect(screen.getByLabelText('Wex · 雷')).toBeInTheDocument()
    expect(screen.getByLabelText('Exort · 火')).toBeInTheDocument()
  })

  it('不足 3 个球时空槽占位(Q W → Q W 空)', () => {
    render(<OrbDisplay orbs={['Q', 'W']} />)
    expect(screen.getByLabelText('Quas · 冰')).toBeInTheDocument()
    expect(screen.getByLabelText('Wex · 雷')).toBeInTheDocument()
    expect(screen.getAllByLabelText('空槽')).toHaveLength(1)
  })
})
