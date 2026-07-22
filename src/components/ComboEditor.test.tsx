import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComboEditor } from './ComboEditor'
import { ZH_LOCALE, tZh, DOTA2_THEME } from '../test/i18nHelpers'
import type { TargetCombo } from '../domain/types'

const props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME, scheme: 'DOTA2' as const }

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

  it('预切:F 槽候选 = spells[0],D 槽候选 = spells[1],且 D 依赖 F', () => {
    render(<ComboEditor onSave={() => {}} onCancel={() => {}} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 强袭飓风` })) // spells[0]
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 电磁脉冲` })) // spells[1]
    fireEvent.click(screen.getByRole('button', { name: `${tZh('combo.addSpell')} 混沌陨石` })) // spells[2]
    // F 槽(先合成、先释放):候选 = spells[0] = 强袭飓风
    const fSelect = screen.getByLabelText(tZh('combo.preCastF'))
    const fOptions = Array.from(fSelect.querySelectorAll('option')).map((o) => o.textContent)
    expect(fOptions).toContain('强袭飓风')
    expect(fOptions).not.toContain('混沌陨石')
    // 未选 F 时 D 槽解锁条件不满足,候选为空(只有"不预切")
    const dSelectBefore = screen.getByLabelText(tZh('combo.preCastD'))
    const dOptionsBefore = Array.from(dSelectBefore.querySelectorAll('option')).map((o) => o.textContent)
    expect(dOptionsBefore).toEqual([tZh('combo.preCastNone')])
    // 选 F = 强袭飓风后,D 槽候选 = spells[1] = 电磁脉冲
    fireEvent.change(fSelect, { target: { value: 'Tornado' } })
    const dOptionsAfter = Array.from(dSelectBefore.querySelectorAll('option')).map((o) => o.textContent)
    expect(dOptionsAfter).toContain('电磁脉冲')
    expect(dOptionsAfter).not.toContain('混沌陨石')
  })
})
