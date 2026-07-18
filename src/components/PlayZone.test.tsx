import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayZone } from './PlayZone'
import type { TargetCombo } from '../domain/types'

// 预切吹风磁暴的连招:玩家只需按释放键就能放出前两个
const comboWithPre: TargetCombo = {
  comboId: 'c1',
  name: '吹风磁暴陨石推波',
  spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

// LEGACY 方案下,切球+祈唤+按专属释放键的完整路径太长;
// 这里用一个 2 技能 + 全预切的连招,测端到端会话结束流程。
const shortCombo: TargetCombo = {
  comboId: 'short',
  name: '短连',
  spells: ['Tornado', 'EMP'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

describe('PlayZone — 会话与宽松继续', () => {
  it('未选连招时显示引导提示', () => {
    render(<PlayZone combo={null} scheme={'LEGACY'} />)
    expect(screen.getByText(/从.+连招库.+选择/)).toBeInTheDocument()
  })

  it('选中连招后显示连招名与进度条', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} />)
    expect(screen.getByText(/当前连招/)).toBeInTheDocument()
    expect(screen.getByText(/强袭飓风/)).toBeInTheDocument()
  })

  it('预切起手:会话开始时 D/F 槽已挂预切技能', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} />)
    expect(screen.getByLabelText(/槽位 D · 第一顺位: Tornado/)).toBeInTheDocument()
    expect(screen.getByLabelText(/槽位 F · 第二顺位: EMP/)).toBeInTheDocument()
  })

  it('LEGACY: 按释放键正确推进进度,全释放后可结束会话标 SUCCESS', async () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} />)
    // Tornado 专属键 X,EMP 专属键 C,都在槽位 → CAST,推进
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'c' })
    // 点结束
    fireEvent.click(screen.getByRole('button', { name: '结束并保存' }))
    expect(screen.getByText(/成功/)).toBeInTheDocument()
  })

  it('宽松继续:释放非目标技能不中断,可继续并结束', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} />)
    // 先按 C(EMP,但目标第1个是 Tornado → 错序,failedStep)
    fireEvent.keyDown(window, { key: 'c' })
    // 进度条第1步应标红
    expect(screen.getAllByText(/1\.\s*强袭飓风/)[0].className).toContain('rose')
    // 会话未中断,仍可点结束
    expect(screen.getByRole('button', { name: '结束并保存' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '结束并保存' }))
    expect(screen.getByText(/✗ 失败/)).toBeInTheDocument()
  })

  it('结束后点"再练一次"重置会话', async () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} />)
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'c' })
    fireEvent.click(screen.getByRole('button', { name: '结束并保存' }))
    fireEvent.click(screen.getByRole('button', { name: '再练一次' }))
    // 重置后回到"结束并保存"按钮,进度归零
    expect(screen.getByRole('button', { name: '结束并保存' })).toBeInTheDocument()
  })

  it('选中连招的预切合规(comboWithPre)', () => {
    render(<PlayZone combo={comboWithPre} scheme={'LEGACY'} />)
    expect(screen.getByLabelText(/槽位 D · 第一顺位: Tornado/)).toBeInTheDocument()
    expect(screen.getByLabelText(/槽位 F · 第二顺位: EMP/)).toBeInTheDocument()
  })
})
