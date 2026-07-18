import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpellIcon } from './SpellIcon'

describe('SpellIcon — 技能图标组件', () => {
  it('渲染 img,alt 与 title 为传入的 tooltip 名', () => {
    render(<SpellIcon spell="Tornado" tooltipName="强袭飓风" />)
    const img = screen.getByRole('img', { name: '强袭飓风' })
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toBeTruthy()
    expect(img.getAttribute('title')).toBe('强袭飓风')
  })

  it('指定 size 时应用到宽高', () => {
    render(<SpellIcon spell="Tornado" tooltipName="Tornado" size={48} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('width')).toBe('48')
    expect(img.getAttribute('height')).toBe('48')
  })
})
