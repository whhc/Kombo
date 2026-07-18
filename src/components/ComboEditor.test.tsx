import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComboEditor } from './ComboEditor'
import type { TargetCombo } from '../domain/types'

describe('ComboEditor — 连招编辑器', () => {
  // tracer bullet:添加技能到序列
  it('点技能按钮把技能加入 spells 序列', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '添加 强袭飓风' }))
    expect(screen.getByText(/1\.\s*强袭飓风/)).toBeInTheDocument()
  })

  it('允许同一技能重复添加', () => {
    render(<ComboEditor onSave={() => {}} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '添加 强袭飓风' }))
    fireEvent.click(screen.getByRole('button', { name: '添加 强袭飓风' }))
    expect(screen.getAllByText(/强袭飓风/).length).toBeGreaterThanOrEqual(2)
  })

  it('序列为空时保存被拦截(不调用 onSave)', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '保存连招' }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('有序列时填写名称并保存,调用 onSave 传回合法 TargetCombo', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} />)
    fireEvent.change(screen.getByLabelText('连招名称'), { target: { value: '我的连招' } })
    fireEvent.click(screen.getByRole('button', { name: '添加 强袭飓风' }))
    fireEvent.click(screen.getByRole('button', { name: '添加 电磁脉冲' }))
    fireEvent.click(screen.getByRole('button', { name: '保存连招' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    const combo: TargetCombo = onSave.mock.calls[0][0]
    expect(combo.name).toBe('我的连招')
    expect(combo.spells).toEqual(['Tornado', 'EMP'])
    expect(combo.preCastSlots).toEqual({})
    expect(combo.comboId).toBeTruthy()
  })

  it('预切选择候选项只含 spells 前缀', () => {
    render(<ComboEditor onSave={() => {}} onCancel={() => {}} />)
    // 加 Tornado, EMP, Meteor
    fireEvent.click(screen.getByRole('button', { name: '添加 强袭飓风' }))
    fireEvent.click(screen.getByRole('button', { name: '添加 电磁脉冲' }))
    fireEvent.click(screen.getByRole('button', { name: '添加 混沌陨石' }))
    // 预切 D 槽下拉:应只含 Tornado(前缀第1位)+ EMP(第2位,选了D=Tornado后F才能是EMP)
    const dSelect = screen.getByLabelText('预切 D 槽')
    const dOptions = Array.from(dSelect.querySelectorAll('option')).map((o) => o.textContent)
    // 应包含 Tornado,不含 Meteor(非前缀首)
    expect(dOptions).toContain('强袭飓风')
    expect(dOptions).not.toContain('混沌陨石')
  })
})
