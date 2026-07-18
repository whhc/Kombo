import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpellHistory } from './SpellHistory'
import { ZH_LOCALE, DOTA2_THEME } from '../test/i18nHelpers'
import type { SpellName } from '../domain/types'

describe('SpellHistory — 技能释放历史(FIFO 10)', () => {
  const props = { locale: ZH_LOCALE, theme: DOTA2_THEME }

  it('空列表时不渲染任何图标', () => {
    render(<SpellHistory spells={[]} {...props} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('渲染已释放技能的 SpellIcon(最多 10 个)', () => {
    const spells: SpellName[] = ['Tornado', 'EMP', 'Tornado']
    render(<SpellHistory spells={spells} {...props} />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('超过 10 个时只显示最近 10 个(新挤旧,FIFO)', () => {
    const spells: SpellName[] = Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? 'Tornado' : 'EMP') as SpellName)
    render(<SpellHistory spells={spells} {...props} />)
    expect(screen.getAllByRole('img')).toHaveLength(10)
  })
})
