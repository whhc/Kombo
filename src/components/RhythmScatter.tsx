import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { ActionNode } from '../domain/types'
import { toScatterPoints } from '../domain/rhythmChart'

const COLOR_BY_TYPE: Record<ActionNode['actionType'], string> = {
  ORB: '#38bdf8',
  INVOKE: '#a78bfa',
  CAST: '#34d399',
  MISS_CAST: '#f87171',
}

interface Props {
  actions: ActionNode[]
  t: (key: string) => string
}

/** 按键节奏散点图(doc.md §5.2):X 相对时间,Y 两次按键间隔 */
export function RhythmScatter({ actions, t }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    // 用 SVG renderer:jsdom 无 canvas,SVG 可在测试环境渲染
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' })
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    const points = toScatterPoints(actions)
    // 按 actionType 分组,便于图例区分
    const types: ActionNode['actionType'][] = ['ORB', 'INVOKE', 'CAST', 'MISS_CAST']
    const series = types
      .map((t) => ({
        name: t,
        type: 'scatter' as const,
        symbolSize: 10,
        itemStyle: { color: COLOR_BY_TYPE[t] },
        data: points.filter((p) => p.actionType === t).map((p) => [p.x, p.y]),
      }))
      .filter((s) => s.data.length > 0)

    chartRef.current.setOption({
      backgroundColor: 'transparent',
      grid: { left: 50, right: 20, top: 30, bottom: 40 },
      legend: { textStyle: { color: '#cbd5e1' }, top: 0 },
      xAxis: { type: 'value', name: t('scatter.xAxis'), nameTextStyle: { color: '#94a3b8' }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', name: t('scatter.yAxis'), nameTextStyle: { color: '#94a3b8' }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155' } } },
      series,
    })
  }, [actions, t])

  return <div ref={ref} className="w-full h-72" aria-label="按键节奏散点图" />
}
