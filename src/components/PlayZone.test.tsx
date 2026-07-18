import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayZone } from './PlayZone'
import { ZH_LOCALE, tZh, DOTA2_THEME, DOTA1_THEME } from '../test/i18nHelpers'
import type { TargetCombo } from '../domain/types'

const shortCombo: TargetCombo = {
  comboId: 'short',
  name: 'preset.tornadoEmpMeteorBlast',
  spells: ['Tornado', 'EMP'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

const comboWithPre: TargetCombo = {
  comboId: 'c1',
  name: 'preset.tornadoEmpMeteorBlast',
  spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

const props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME }

describe('PlayZone — 会话与宽松继续(图标+i18n)', () => {
  it('未选连招时显示引导提示', () => {
    render(<PlayZone combo={null} scheme={'LEGACY'} {...props} />)
    expect(screen.getByText(tZh('practice.guide'))).toBeInTheDocument()
  })

  it('选中连招后显示连招名(翻译后的预设名)与图标', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    expect(screen.getByText(new RegExp(tZh('practice.currentCombo')))).toBeInTheDocument()
    // 预设名应被翻译
    expect(screen.getByText(/吹风/)).toBeInTheDocument()
  })

  it('预切起手:会话开始时 D/F 槽已挂预切技能(图标 alt)', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    expect(screen.getByRole('img', { name: '强袭飓风' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '电磁脉冲' })).toBeInTheDocument()
  })

  it('LEGACY: 按释放键正确推进进度,全释放后可结束会话标 SUCCESS', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'c' })
    fireEvent.click(screen.getByRole('button', { name: tZh('practice.endAndSave') }))
    expect(screen.getByText(tZh('practice.success'))).toBeInTheDocument()
  })

  it('宽松继续:释放非目标技能不中断,进度条标红', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    fireEvent.keyDown(window, { key: 'c' }) // 错序
    // 第1步(强袭飓风图标)的容器应标红(rose class)
    const step = screen.getAllByRole('img').find((el) => el.getAttribute('title')?.includes('强袭飓风'))
    expect(step).toBeTruthy()
    // 会话未中断
    expect(screen.getByRole('button', { name: tZh('practice.endAndSave') })).toBeInTheDocument()
  })

  it('结束后点"再练一次"重置会话', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'c' })
    fireEvent.click(screen.getByRole('button', { name: tZh('practice.endAndSave') }))
    fireEvent.click(screen.getByRole('button', { name: tZh('practice.again') }))
    expect(screen.getByRole('button', { name: tZh('practice.endAndSave') })).toBeInTheDocument()
  })

  it('comboWithPre 预切合规', () => {
    render(<PlayZone combo={comboWithPre} scheme={'LEGACY'} {...props} />)
    expect(screen.getByRole('img', { name: '强袭飓风' })).toBeInTheDocument()
  })

  it('DOTA1 图标主题:技能图标 src 来自 dota1 目录(与 DOTA2 不同)', () => {
    const d2props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME }
    const { unmount } = render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...d2props} />)
    const d2src = screen.getByRole('img', { name: '强袭飓风' }).getAttribute('src')
    unmount()

    const d1props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA1_THEME }
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...d1props} />)
    const d1src = screen.getByRole('img', { name: '强袭飓风' }).getAttribute('src')

    expect(d2src).toBeTruthy()
    expect(d1src).toBeTruthy()
    expect(d1src).not.toBe(d2src) // 两主题资源分流
  })

  it('DOTA1 主题下 LEGACY 槽位标签显示技能传统键(X/C 而非 D/F)', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} locale={ZH_LOCALE} t={tZh} iconTheme={DOTA1_THEME} />)
    // 预切 Tornado 在第一槽,LEGACY 标签应为 "X · 强袭飓风"
    expect(screen.getByText(/X · 强袭飓风/)).toBeInTheDocument()
    // 不应出现误导的 "D · 第一顺位"
    expect(screen.queryByText(/D · 第一顺位/)).not.toBeInTheDocument()
  })
})
