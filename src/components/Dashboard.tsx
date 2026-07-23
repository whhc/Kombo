import { useMemo, useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { ExecutionSession, TargetCombo } from '../domain/types'
import { resolveComboName } from '../domain/resolveComboName'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  sessions: ExecutionSession[]
  combos: TargetCombo[]
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
}

type Range = 'all' | 'today' | '7d' | '30d'
const DAY_MS = 24 * 60 * 60 * 1000

/** 数据复盘区:combo 选择器 + 时间范围 + 成功率徽章 + 三指标归一化趋势(仅成功轮次) */
export function Dashboard({ sessions, combos, iconTheme, locale, t }: Props) {
  const [comboId, setComboId] = useState<string>('')
  const [range, setRange] = useState<Range>('all')

  const filtered = useMemo(() => {
    let list = comboId ? sessions.filter((s) => s.comboId === comboId) : sessions
    if (range !== 'all') {
      const now = Date.now()
      const span = range === 'today' ? DAY_MS : range === '7d' ? 7 * DAY_MS : 30 * DAY_MS
      list = list.filter((s) => now - s.startTime <= span)
    }
    // 按时间升序
    return [...list].sort((a, b) => a.startTime - b.startTime)
  }, [sessions, comboId, range])

  // 成功率:基于 filtered(含失败)统计;趋势图只画成功轮次
  const successRate = useMemo(() => {
    if (filtered.length === 0) return null
    const ok = filtered.filter((s) => s.status === 'SUCCESS').length
    return ok / filtered.length
  }, [filtered])

  const successOnly = useMemo(
    () => filtered.filter((s) => s.status === 'SUCCESS'),
    [filtered],
  )

  const noData = sessions.length === 0
    ? t('dashboard.empty')
    : filtered.length === 0
      ? t('dashboard.noRecordInRange')
      : null

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl px-4">
      {/* 标题行:左侧 combo/时间筛选,右侧成功率徽章 */}
      <div className="flex gap-3 items-center flex-wrap justify-between">
        <div className="flex gap-3 items-center flex-wrap">
          <select
            className="bg-neutral-800 px-2 py-1 rounded text-sm text-neutral-200"
            value={comboId}
            onChange={(e) => setComboId(e.target.value)}
            aria-label={t('dashboard.allCombos')}
          >
            <option value="">{t('dashboard.allCombos')}</option>
            {combos.map((c) => (
              <option key={c.comboId} value={c.comboId}>
                {resolveComboName(c, (k) => t(k), locale, iconTheme)}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {(['all', 'today', '7d', '30d'] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`px-2 py-0.5 text-xs rounded border ${range === r ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
                onClick={() => setRange(r)}
              >
                {r === 'all' ? t('dashboard.range.all') : r === 'today' ? t('dashboard.range.today') : r === '7d' ? t('dashboard.range.7d') : t('dashboard.range.30d')}
              </button>
            ))}
          </div>
        </div>
        {successRate !== null ? (
          <span
            className={`px-2 py-0.5 text-xs rounded border ${successRate >= 0.8 ? 'border-emerald-500/50 text-emerald-300 bg-emerald-900/20' : successRate >= 0.5 ? 'border-amber-500/50 text-amber-300 bg-amber-900/20' : 'border-rose-500/50 text-rose-300 bg-rose-900/20'}`}
            title={t('dashboard.successRateHint')}
          >
            {t('dashboard.successRate')}: {Math.round(successRate * 100)}% ({filtered.filter((s) => s.status === 'SUCCESS').length}/{filtered.length})
          </span>
        ) : (
          <span
            className="px-2 py-0.5 text-xs rounded border border-neutral-600/50 text-neutral-400 bg-neutral-800/20"
            title={t('dashboard.successRateHint')}
          >
            {t('dashboard.successRateUnknown')}
          </span>
        )}
      </div>

      {noData ? (
        <p className="text-neutral-400 text-sm">{noData}</p>
      ) : successOnly.length === 0 ? (
        <p className="text-neutral-400 text-sm">{t('dashboard.noSuccessInRange')}</p>
      ) : (
        <>
          {/* 汇总卡组:一眼看清当前筛选范围的总览 */}
          <SummaryCards sessions={filtered} successOnly={successOnly} t={t} />
          <TrendChart sessions={successOnly} t={t} />
        </>
      )}
    </div>
  )
}

/** 四个汇总卡:总轮次 / 成功率 / 平均按键达成率 / 最佳速度 */
function SummaryCards({
  sessions,
  successOnly,
  t,
}: {
  sessions: ExecutionSession[]
  successOnly: ExecutionSession[]
  t: (key: string) => string
}) {
  const total = sessions.length
  const okCount = successOnly.length
  const rate = total > 0 ? Math.round((okCount / total) * 100) : 0

  // 平均按键达成率(只看成功轮次的有效 keyRatio)
  const keyRatios = successOnly
    .map((s) => s.metrics?.keyRatio)
    .filter((v): v is number => v != null)
  const avgKeyRatio = keyRatios.length > 0 ? Math.round((keyRatios.reduce((a, b) => a + b, 0) / keyRatios.length) * 100) : 0

  // 最佳速度(成功轮次中最快用时,单位 ms → s)
  const durations = successOnly.map((s) => s.metrics?.durationMs ?? 0).filter((d) => d > 0)
  const bestMs = durations.length > 0 ? Math.min(...durations) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card label={t('dashboard.totalRounds')} value={String(total)} />
      <Card label={t('dashboard.successRate')} value={`${rate}%`} accent={rate >= 80 ? 'text-emerald-300' : rate >= 50 ? 'text-amber-300' : 'text-rose-300'} />
      <Card label={t('metrics.keyRatio')} value={`${avgKeyRatio}%`} accent="text-sky-300" />
      <Card label={t('dashboard.bestSpeed')} value={bestMs > 0 ? `${(bestMs / 1000).toFixed(1)}s` : '—'} accent="text-fuchsia-300" />
    </div>
  )
}

function Card({ label, value, accent = 'text-neutral-100' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded bg-neutral-900/60 border border-white/10">
      <span className="text-neutral-400 text-xs">{label}</span>
      <span className={`text-xl font-semibold ${accent}`}>{value}</span>
    </div>
  )
}

function TrendChart({ sessions, t }: { sessions: ExecutionSession[]; t: (key: string) => string }) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' })
    // 窗口缩放时图表自适应
    const onResize = () => chartRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current || sessions.length === 0) return

    const xs = sessions.map((_, i) => i + 1) // 轮次 1,2,3...

    // 三指标都归一化到 0-100%,越高越好。FAILED 轮次 orbRatio/keyRatio 为 null。
    // ① 切球达成率:直接 ×100
    const orbScores = sessions.map((s) =>
      s.metrics?.orbRatio != null ? Math.round(s.metrics.orbRatio * 100) : null,
    )
    // ② 总按键达成率:直接 ×100
    const keyScores = sessions.map((s) =>
      s.metrics?.keyRatio != null ? Math.round(s.metrics.keyRatio * 100) : null,
    )
    // ③ 时长得分:越快越好。基准 = 当前筛选数据中最快的轮次(= 100 分)。
    //   其他轮次 score = min/actual × 100。FAILED 轮次 metrics 可能为 0,排除。
    const validDurations = sessions
      .map((s) => s.metrics?.durationMs ?? 0)
      .filter((d) => d > 0)
    const minDuration = validDurations.length > 0 ? Math.min(...validDurations) : 0
    const durationScores = sessions.map((s) => {
      const d = s.metrics?.durationMs ?? 0
      if (d <= 0 || minDuration <= 0) return null
      return Math.round((minDuration / d) * 100)
    })

    chartRef.current.setOption({
      backgroundColor: 'transparent',
      legend: { textStyle: { color: '#cbd5e1' }, top: 0 },
      grid: { left: 55, right: 30, top: 30, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        textStyle: { color: '#e2e8f0' },
      },
      xAxis: {
        type: 'category',
        data: xs,
        name: t('dashboard.round'),
        nameTextStyle: { color: '#94a3b8' },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { color: '#94a3b8', formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#334155' } },
      },
      series: [
        {
          name: t('metrics.orbRatio'),
          type: 'line',
          data: orbScores,
          smooth: true,
          connectNulls: false,
          lineStyle: { color: '#a78bfa' },
          itemStyle: { color: '#a78bfa' },
        },
        {
          name: t('metrics.keyRatio'),
          type: 'line',
          data: keyScores,
          smooth: true,
          connectNulls: false,
          lineStyle: { color: '#34d399' },
          itemStyle: { color: '#34d399' },
        },
        {
          name: t('metrics.durationScore'),
          type: 'line',
          data: durationScores,
          smooth: true,
          connectNulls: false,
          lineStyle: { color: '#38bdf8' },
          itemStyle: { color: '#38bdf8' },
        },
      ],
    })
  }, [sessions, t])

  if (sessions.length === 0) return null

  return <div ref={ref} className="w-full h-72 md:h-80" aria-label="成长趋势图" />
}
