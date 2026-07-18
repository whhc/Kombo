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

/** 数据复盘区:combo 选择器 + 时间范围 + 双折线趋势(历时+切球达成率) */
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

  const noData = sessions.length === 0
    ? t('dashboard.empty')
    : filtered.length === 0
      ? t('dashboard.noRecordInRange')
      : null

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      <div className="flex gap-3 items-center flex-wrap">
        <select
          className="bg-neutral-800 px-2 py-1 rounded text-sm text-neutral-200"
          value={comboId}
          onChange={(e) => setComboId(e.target.value)}
          aria-label="选择连招"
        >
          <option value="">全部连招</option>
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

      {noData ? (
        <p className="text-neutral-400 text-sm">{noData}</p>
      ) : (
        <TrendChart sessions={filtered} t={t} />
      )}
    </div>
  )
}

function TrendChart({ sessions, t }: { sessions: ExecutionSession[]; t: (key: string) => string }) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' })
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current || sessions.length === 0) return

    const xs = sessions.map((_, i) => i + 1) // 轮次 1,2,3...
    // 主Y轴:历时(越低越好)
    const durations = sessions.map((s) => Math.round(s.metrics?.durationMs ?? 0))
    // 次Y轴:切球达成率(%,越高越好,FAILED 轮次不画点)
    const ratios = sessions.map((s) => ({
      value: s.metrics?.orbRatio !== null ? Math.round(s.metrics!.orbRatio * 100) : null,
    }))

    chartRef.current.setOption({
      backgroundColor: 'transparent',
      legend: { textStyle: { color: '#cbd5e1' }, top: 0 },
      grid: { left: 55, right: 55, top: 30, bottom: 40 },
      xAxis: {
        type: 'category',
        data: xs,
        name: t('dashboard.round'),
        nameTextStyle: { color: '#94a3b8' },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: [
        {
          type: 'value',
          name: t('metrics.duration'),
          nameTextStyle: { color: '#94a3b8' },
          axisLabel: { color: '#94a3b8', formatter: '{value}ms' },
          splitLine: { lineStyle: { color: '#334155' } },
        },
        {
          type: 'value',
          name: t('metrics.orbRatio'),
          nameTextStyle: { color: '#94a3b8' },
          axisLabel: { color: '#94a3b8', formatter: '{value}%' },
          max: 100,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: t('metrics.duration'),
          type: 'line',
          data: durations,
          yAxisIndex: 0,
          smooth: true,
          lineStyle: { color: '#38bdf8' },
          itemStyle: { color: '#38bdf8' },
        },
        {
          name: t('metrics.orbRatio'),
          type: 'line',
          data: ratios.map((r) => r.value),
          yAxisIndex: 1,
          smooth: true,
          connectNulls: false,
          lineStyle: { color: '#a78bfa' },
          itemStyle: { color: '#a78bfa' },
        },
      ],
    })
  }, [sessions, t])

  if (sessions.length === 0) return null

  return <div ref={ref} className="w-full h-72" aria-label="成长趋势图" />
}
