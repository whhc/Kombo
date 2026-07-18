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

  it('指定 size 时应用到 CSS 宽高(style,保证 object-cover 对齐)', () => {
    render(<SpellIcon spell="Tornado" tooltipName="Tornado" size={48} />)
    const img = screen.getByRole('img')
    // 用 style 而非 HTML width/height 属性,确保 object-cover 在不同比例资源下生效
    expect(img.style.width).toBe('48px')
    expect(img.style.height).toBe('48px')
  })
})
