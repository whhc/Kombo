import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrbDisplay } from './OrbDisplay'
import { ZH_LOCALE, tZh, DOTA2_THEME } from '../test/i18nHelpers'

describe('OrbDisplay — 元素球 UI(图标)', () => {
  it('空状态时显示 3 个空槽', () => {
    render(<OrbDisplay orbs={[]} theme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    expect(screen.getAllByLabelText('空槽')).toHaveLength(3)
  })

  it('渲染已切出元素球的图标(alt=元素名)', () => {
    render(<OrbDisplay orbs={['Q', 'W', 'E']} theme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    expect(screen.getByRole('img', { name: '冰' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '雷' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '火' })).toBeInTheDocument()
  })

  it('不足 3 个球时空槽占位', () => {
    render(<OrbDisplay orbs={['Q', 'W']} theme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    expect(screen.getAllByLabelText('空槽')).toHaveLength(1)
  })
})
