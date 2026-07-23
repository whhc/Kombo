import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CooldownOverlay } from './CooldownOverlay'

describe('CooldownOverlay — 冷却遮蔽层', () => {
  it('active=false 时不渲染', () => {
    const { container } = render(<CooldownOverlay active={false} durationMs={2000} size={56} />)
    expect(container.firstChild).toBeNull()
  })

  it('active=true 时渲染遮蔽层(absolute 覆盖)', () => {
    const { container } = render(<CooldownOverlay active durationMs={2000} size={56} />)
    const overlay = container.firstChild as HTMLElement
    expect(overlay).toBeTruthy()
    // aria-hidden,不干扰屏幕阅读器
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    // pointer-events:none,不拦截鼠标
    expect(overlay.className).toContain('pointer-events-none')
  })
})
