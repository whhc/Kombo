import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PlayZone } from './PlayZone'
import { ZH_LOCALE, tZh, DOTA2_THEME, DOTA1_THEME } from '../test/i18nHelpers'
import type { TargetCombo } from '../domain/types'

const shortCombo: TargetCombo = {
  comboId: 'short',
  name: 'auto.Tornado.EMP',
  spells: ['Tornado', 'EMP'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

const comboWithPre: TargetCombo = {
  comboId: 'c1',
  name: 'auto.Tornado.EMP.ChaosMeteor.DeafeningBlast',
  spells: ['Tornado', 'EMP', 'ChaosMeteor', 'DeafeningBlast'],
  preCastSlots: { d: 'Tornado', f: 'EMP' },
}

const props = { locale: ZH_LOCALE, t: tZh, iconTheme: DOTA2_THEME }

describe('PlayZone — 会话与宽松继续(图标+i18n)', () => {
  it('combo=null 时为自由模式(显示 SpellHistory,无进度条)', () => {
    render(<PlayZone combo={null} scheme={'LEGACY'} {...props} />)
    // 自由模式:无目标连招引导,直接可按键
    expect(screen.getByText(tZh('practice.freePlay'))).toBeInTheDocument()
    // 有重置按钮而非"结束并保存"
    expect(screen.getByRole('button', { name: tZh('practice.reset') })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: tZh('practice.endAndSave') })).not.toBeInTheDocument()
  })

  it('内嵌模式(onQuit 存在):显示 Quit 按钮,不自动保存不循环', () => {
    const onQuit = vi.fn()
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} onQuit={onQuit} {...props} />)
    // 有 Quit 按钮
    expect(screen.getByRole('button', { name: tZh('practice.quit') })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: tZh('practice.endAndSave') })).not.toBeInTheDocument()
    // 释放全部技能后不应自动结束(内嵌模式不保存)
    fireEvent.keyDown(window, { key: 'x' })
    fireEvent.keyDown(window, { key: 'c' })
    // 没有显示 SUCCESS/FAILED,因为不自动结束
    expect(screen.queryByText(tZh('practice.success'))).not.toBeInTheDocument()
  })

  it('选中连招后显示连招名(翻译后的预设名)与图标', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    expect(screen.getByText(new RegExp(tZh('practice.currentCombo')))).toBeInTheDocument()
    // auto.Tornado.EMP 在 zh/DOTA2 解析为"强袭飓风 → 电磁脉冲"
    // auto.Tornado.EMP 解析结果含"强袭飓风"+"电磁脉冲"
    expect(screen.getByText(/强袭飓风 → 电磁脉冲/)).toBeInTheDocument()
  })

  it('预切起手:会话开始时 D/F 槽已挂预切技能(图标 alt)', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    expect(screen.getByRole('img', { name: '强袭飓风' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '电磁脉冲' })).toBeInTheDocument()
  })

  it('LEGACY: 按释放键正确推进进度(未全部释放时仍可手动结束)', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    fireEvent.keyDown(window, { key: 'x' }) // 只放 1 个,未完成
    fireEvent.click(screen.getByRole('button', { name: tZh('practice.endAndSave') }))
    // 手动结束后,因未完成全部目标 → FAILED
    expect(screen.getByText(tZh('practice.failed'))).toBeInTheDocument()
  })

  it('全部目标技能按序释放完毕后自动结束保存(无需手动点按钮)', () => {
    vi.useFakeTimers()
    try {
      render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
      fireEvent.keyDown(window, { key: 'x' }) // Tornado
      expect(screen.getByRole('button', { name: tZh('practice.endAndSave') })).toBeInTheDocument()
      fireEvent.keyDown(window, { key: 'c' }) // EMP —— 全部释放完
      // 自动进入完成态:显示成功 + 自动下一轮倒计时(无需手动点结束)
      expect(screen.getByText(tZh('practice.success'))).toBeInTheDocument()
      expect(screen.getByText(tZh('practice.autoNext'))).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('全部释放完但中途有错序(宽松)→ 自动结束保存为 FAILED', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
    fireEvent.keyDown(window, { key: 'c' }) // EMP 错序(目标第1是 Tornado)→ failedStep
    fireEvent.keyDown(window, { key: 'x' }) // Tornado → progress 1
    fireEvent.keyDown(window, { key: 'c' }) // EMP → progress 2 → 完成
    // 自动结束,但有 failedStep → FAILED
    expect(screen.getByText(tZh('practice.failed'))).toBeInTheDocument()
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

  it('自动循环:完成后显示数据,0.5s 后自动开始下一轮(无需手动)', () => {
    vi.useFakeTimers()
    try {
      render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
      fireEvent.keyDown(window, { key: 'x' })
      fireEvent.keyDown(window, { key: 'c' }) // 全释放 → 自动结束
      // 完成态:显示成功 + 倒计时提示
      expect(screen.getByText(tZh('practice.success'))).toBeInTheDocument()
      expect(screen.getByText(/0\.5/)).toBeInTheDocument()
      // 还没到 0.5s,仍是完成态
      expect(screen.queryByRole('button', { name: tZh('practice.endAndSave') })).not.toBeInTheDocument()
      // 推进 0.5s → 自动开始下一轮(回到练习态,有"结束并保存"按钮)
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getByRole('button', { name: tZh('practice.endAndSave') })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('暂停循环:完成态点"暂停"按钮后不自动进入下一轮', () => {
    vi.useFakeTimers()
    try {
      render(<PlayZone combo={shortCombo} scheme={'LEGACY'} {...props} />)
      fireEvent.keyDown(window, { key: 'x' })
      fireEvent.keyDown(window, { key: 'c' }) // 完成
      fireEvent.click(screen.getByRole('button', { name: tZh('practice.pauseLoop') }))
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      // 暂停后即使过 1s 仍是完成态,不会自动开始
      expect(screen.getByText(tZh('practice.success'))).toBeInTheDocument()
      // 显示"再练一次"手动按钮
      expect(screen.getByRole('button', { name: tZh('practice.again') })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
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
    // DOTA1 主题下 Tornado 中文名为"龙卷风"(dota1 旧译)
    const d1src = screen.getByRole('img', { name: '龙卷风' }).getAttribute('src')

    expect(d2src).toBeTruthy()
    expect(d1src).toBeTruthy()
    expect(d1src).not.toBe(d2src) // 两主题资源分流
  })

  it('DOTA1 主题下 LEGACY 槽位标签显示技能传统键(X/C 而非 D/F)', () => {
    render(<PlayZone combo={shortCombo} scheme={'LEGACY'} locale={ZH_LOCALE} t={tZh} iconTheme={DOTA1_THEME} />)
    // 预切 Tornado 在第一槽,LEGACY 标签应为 "X · 龙卷风"(DOTA1 旧译)
    expect(screen.getByText(/X · 龙卷风/)).toBeInTheDocument()
    // 不应出现误导的 "D · 第一顺位"
    expect(screen.queryByText(/D · 第一顺位/)).not.toBeInTheDocument()
  })
})
