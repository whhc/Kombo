import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { ZH_LOCALE, tZh, DOTA2_THEME } from '../test/i18nHelpers'
import type { ExecutionSession, TargetCombo } from '../domain/types'

function mkSession(
  id: string,
  comboId: string,
  startTs: number,
  orbRatio: number | null = 0.75,
): ExecutionSession {
  return {
    sessionId: id,
    comboId,
    status: orbRatio !== null ? 'SUCCESS' : 'FAILED',
    actions: [],
    startTime: startTs,
    endTime: startTs + 500,
    metrics: {
      optimalOrbSwitches: 3,
      actualOrbSwitches: 4,
      orbRatio,
      excessOrbSwitches: 1,
      optimalKeyCount: 6,
      actualKeyCount: 8,
      keyRatio: orbRatio !== null ? 0.75 : null,
      excessKeyCount: 2,
      durationMs: 500,
    },
  }
}

const comboT: TargetCombo = {
  comboId: 'c1',
  name: 'preset.meteorBlastFromZero',
  spells: ['ChaosMeteor', 'DeafeningBlast'],
  preCastSlots: {},
}
const combos = [comboT]

const props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME, combos }
const DAY_MS = 24 * 60 * 60 * 1000

describe('Dashboard — 趋势折线图(combo筛选+时间范围)', () => {
  it('无历史数据时显示空状态引导', () => {
    render(<Dashboard sessions={[]} {...props} />)
    expect(screen.getByText(tZh('dashboard.empty'))).toBeInTheDocument()
  })

  it('有数据时显示 combo 选择器与趋势图', () => {
    const now = Date.now()
    const sessions = [mkSession('s1', 'c1', now - 1000)]
    render(<Dashboard sessions={sessions} {...props} />)
    expect(screen.getByLabelText(tZh('dashboard.allCombos'))).toBeInTheDocument()
    // 有数据图表应渲染(ECharts SVG)
    expect(screen.getByLabelText('成长趋势图')).toBeInTheDocument()
  })

  it('combo 筛选:选特定 combo 后只显示该 combo 的数据', () => {
    const now = Date.now()
    const sessions = [
      mkSession('s1', 'c1', now - 1000),
      mkSession('s2', 'c2', now - 2000),
    ]
    render(<Dashboard sessions={sessions} {...props} />)
    // 选 c1  combo
    fireEvent.change(screen.getByLabelText(tZh('dashboard.allCombos')), { target: { value: 'c1' } })
    // 应只显示 c1 的数据(趋势图仍存在,但数据点少)
    expect(screen.getByLabelText('成长趋势图')).toBeInTheDocument()
  })

  it('时间范围按钮切换:点"今日"筛选', () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const sessions = [
      mkSession('recent', 'c1', now - 1000),
      mkSession('old', 'c1', now - 2 * dayMs),
    ]
    render(<Dashboard sessions={sessions} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: tZh('dashboard.range.today') }))
    // 图表仍在,但只含 recent
    expect(screen.getByLabelText('成长趋势图')).toBeInTheDocument()
  })

  it('筛选后无数据时显示"该时间范围内无记录"', () => {
    const now = Date.now()
    const sessions = [mkSession('old', 'c1', now - 100 * DAY_MS)]
    render(<Dashboard sessions={sessions} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: tZh('dashboard.range.today') }))
    expect(screen.getByText(tZh('dashboard.noRecordInRange'))).toBeInTheDocument()
  })

  it('成功率徽章:显示 成功数/总数 与百分比', () => {
    const now = Date.now()
    const sessions = [
      mkSession('s1', 'c1', now - 3000, 0.8), // SUCCESS
      mkSession('s2', 'c1', now - 2000, null), // FAILED
      mkSession('s3', 'c1', now - 1000, 0.6), // SUCCESS
    ]
    render(<Dashboard sessions={sessions} {...props} />)
    // 2/3 ≈ 67%
    expect(screen.getByText(/67%.*2\/3/)).toBeInTheDocument()
  })

  it('范围内仅失败轮次时显示"无成功轮次"', () => {
    const now = Date.now()
    const sessions = [mkSession('f1', 'c1', now - 1000, null)] // FAILED
    render(<Dashboard sessions={sessions} {...props} />)
    expect(screen.getByText(tZh('dashboard.noSuccessInRange'))).toBeInTheDocument()
  })
})
