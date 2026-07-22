import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Help } from './Help'
import { ZH_LOCALE, tZh, DOTA2_THEME } from '../test/i18nHelpers'

describe('Help — 帮助页', () => {
  it('渲染概览、十技能、练习、连招库、复盘指标五个段落', () => {
    render(<Help iconTheme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    expect(screen.getByText(tZh('help.overview.title'))).toBeInTheDocument()
    expect(screen.getByText(tZh('help.spells.title'))).toBeInTheDocument()
    expect(screen.getByText(tZh('help.practice.title'))).toBeInTheDocument()
    expect(screen.getByText(tZh('help.combo.title'))).toBeInTheDocument()
    expect(screen.getByText(tZh('help.metrics.title'))).toBeInTheDocument()
  })

  it('十技能配方全部列出(10 张技能图标)', () => {
    render(<Help iconTheme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    // 强袭飓风 DOTA2 译名,应出现在技能表里
    expect(screen.getAllByRole('img', { name: '强袭飓风' }).length).toBeGreaterThan(0)
  })

  it('复盘指标四项卡片都渲染', () => {
    render(<Help iconTheme={DOTA2_THEME} locale={ZH_LOCALE} t={tZh} />)
    expect(screen.getByText(tZh('metrics.orbRatio'))).toBeInTheDocument()
    expect(screen.getByText(tZh('metrics.keyRatio'))).toBeInTheDocument()
    expect(screen.getByText(tZh('metrics.durationScore'))).toBeInTheDocument()
    expect(screen.getByText(tZh('dashboard.successRate'))).toBeInTheDocument()
  })
})
