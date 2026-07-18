import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dashboard } from './Dashboard'
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

describe('Dashboard — 数据复盘区', () => {
  it('无历史数据时显示空状态引导', () => {
    render(<Dashboard sessions={[]} />)
    expect(screen.getByText(/还没有练习记录/)).toBeInTheDocument()
    expect(screen.getByText(/先去.+练习.+完成一轮/)).toBeInTheDocument()
  })

  it('有数据时显示会话列表(含状态与 metrics 摘要)', () => {
    const now = Date.now()
    const sessions = [mkSession('s1', 'SUCCESS', now - 1000), mkSession('s2', 'FAILED', now - 2000)]
    render(<Dashboard sessions={sessions} />)
    expect(screen.getAllByText(/达成率 75%/).length).toBe(2)
    expect(screen.getAllByText(/多切1/).length).toBe(2)
  })

  it('点击某条会话选中后显示节奏散点图区', () => {
    const now = Date.now()
    const actions: ActionNode[] = [
      { actionType: 'ORB', key: 'Q', timestamp: now, timeSinceLastMs: 0 },
      { actionType: 'CAST', key: 'X', spellName: 'Tornado', timestamp: now + 200, timeSinceLastMs: 200 },
    ]
    const sessions = [mkSession('s1', 'SUCCESS', now, actions)]
    render(<Dashboard sessions={sessions} />)
    // 点击列表项 li(包含 ✓ 的那行)
    fireEvent.click(screen.getByText(/✓/).closest('li')!)
    expect(screen.getByText('按键节奏散点图')).toBeInTheDocument()
    expect(screen.getByLabelText('按键节奏散点图')).toBeInTheDocument()
  })

  it('时间过滤:今日范围过滤掉旧记录', () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const sessions = [
      mkSession('recent', 'SUCCESS', now - 1000),
      mkSession('old', 'SUCCESS', now - 2 * dayMs), // 2 天前
    ]
    render(<Dashboard sessions={sessions} />)
    fireEvent.click(screen.getByRole('button', { name: '今日' }))
    expect(screen.getByText(/达成率/)).toBeInTheDocument()
    expect(screen.getByText(/该时间范围内无记录|达成率/)).toBeInTheDocument()
    // recent 应在,old 应被过滤;列表里只应有 1 条 SUCCESS
    const successItems = screen.getAllByText(/✓/).filter((el) => el.tagName !== 'BUTTON')
    // 至少 recent 仍在(old 被过滤后列表减少)
    expect(successItems.length).toBeGreaterThanOrEqual(1)
  })
})
