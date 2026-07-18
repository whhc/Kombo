import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComboEditor } from './ComboEditor'
import { ZH_LOCALE, tZh, DOTA2_THEME } from '../test/i18nHelpers'
import type { TargetCombo } from '../domain/types'

const props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME }

describe('ComboEditor — 连招编辑器(图标+i18n)', () => {
  it('点技能图标把技能加入 spells 序列', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 强袭飓风` }))
    // 序列里应有强袭飓风图标(alt 含序号+名)
    expect(screen.getByTitle(/1\.\s*强袭飓风/)).toBeInTheDocument()
  })

  it('允许同一技能重复添加', () => {
    render(<ComboEditor onSave={() => {}} onCancel={() => {}} {...props} />)
    const btn = screen.getByRole('button', { name: `${tZh('combo.addSpell')} 强袭飓风` })
    fireEvent.click(btn)
    fireEvent.click(btn)
    // 两个序号 1. 和 2. 都含强袭飓风
    expect(screen.getByTitle(/1\.\s*强袭飓风/)).toBeInTheDocument()
    expect(screen.getByTitle(/2\.\s*强袭飓风/)).toBeInTheDocument()
  })

  it('序列为空时保存被拦截', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: tZh('common.save') }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('有序列时保存调用 onSave 传回合法 TargetCombo', () => {
    const onSave = vi.fn()
    render(<ComboEditor onSave={onSave} onCancel={() => {}} {...props} />)
    fireEvent.change(screen.getByLabelText(tZh('combo.name')), { target: { value: '我的连招' } })
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 强袭飓风` }))
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 电磁脉冲` }))
    fireEvent.click(screen.getByRole('button', { name: tZh('common.save') }))
    expect(onSave).toHaveBeenCalledTimes(1)
    const combo: TargetCombo = onSave.mock.calls[0][0]
    expect(combo.spells).toEqual(['Tornado', 'EMP'])
    expect(combo.preCastSlots).toEqual({})
  })

  it('预切选择候选项只含 spells 前缀', () => {
    render(<ComboEditor onSave={() => {}} onCancel={() => {}} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 强袭飓风` }))
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 电磁脉冲` }))
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 混沌陨石` }))
    const dSelect = screen.getByLabelText(tZh('combo.preCastD'))
    const dOptions = Array.from(dSelect.querySelectorAll('option')).map((o) => o.textContent)
    expect(dOptions).toContain('强袭飓风')
    expect(dOptions).not.toContain('混沌陨石')
  })
})
