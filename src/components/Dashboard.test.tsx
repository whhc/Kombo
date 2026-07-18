import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { ZH_LOCALE, tZh } from '../test/i18nHelpers'
import type { ExecutionSession, ActionNode } from '../domain/types'

function mkSession(
  id: string,
  status: 'SUCCESS' | 'FAILED',
  startTs: number,
  actions: ActionNode[] = [],
): ExecutionSession {
  return {
    sessionId: id,
    comboId: 'c1',
    status,
    actions,
    startTime: startTs,
    endTime: startTs + 100,
    metrics: {
      optimalOrbSwitches: 3,
      actualOrbSwitches: 4,
      orbRatio: 0.75,
      excessOrbSwitches: 1,
      durationMs: 500,
    },
  }
}

const props = { locale: ZH_LOCALE, t: tZh }

describe('Dashboard — 数据复盘区(i18n)', () => {
  it('无历史数据时显示空状态引导', () => {
    render(<Dashboard sessions={[]} {...props} />)
    expect(screen.getByText(tZh('dashboard.empty'))).toBeInTheDocument()
  })

  it('有数据时显示会话列表(含状态与 metrics 摘要)', () => {
    const now = Date.now()
    const sessions = [mkSession('s1', 'SUCCESS', now - 1000), mkSession('s2', 'FAILED', now - 2000)]
    render(<Dashboard sessions={sessions} {...props} />)
    // 摘要含 "达成率"(ratio label)与百分比
    expect(screen.getAllByText(/75%/).length).toBe(2)
  })

  it('点击某条会话选中后显示节奏散点图区', () => {
    const now = Date.now()
    const actions: ActionNode[] = [
      { actionType: 'ORB', key: 'Q', timestamp: now, timeSinceLastMs: 0 },
      { actionType: 'CAST', key: 'X', spellName: 'Tornado', timestamp: now + 200, timeSinceLastMs: 200 },
    ]
    const sessions = [mkSession('s1', 'SUCCESS', now, actions)]
    render(<Dashboard sessions={sessions} {...props} />)
    fireEvent.click(screen.getByText(/✓/).closest('li')!)
    expect(screen.getByText(tZh('dashboard.rhythmTitle'))).toBeInTheDocument()
    expect(screen.getByLabelText(tZh('dashboard.rhythmTitle'))).toBeInTheDocument()
  })

  it('时间过滤:今日范围过滤掉旧记录', () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const sessions = [mkSession('recent', 'SUCCESS', now - 1000), mkSession('old', 'SUCCESS', now - 2 * dayMs)]
    render(<Dashboard sessions={sessions} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: tZh('dashboard.range.today') }))
    // old 被过滤:今日只剩 recent 一条
    const successRows = screen.getAllByText(/✓/).filter((el) => el.tagName !== 'BUTTON')
    expect(successRows.length).toBe(1)
  })
})
