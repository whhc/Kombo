import { useMemo, useState } from 'react'
import type { ExecutionSession } from '../domain/types'
import { RhythmScatter } from './RhythmScatter'
import type { Locale } from '../domain/i18n'

interface Props {
  sessions: ExecutionSession[]
  locale: Locale
  t: (key: string) => string
}

type Range = 'all' | 'today' | '7d' | '30d'

const DAY_MS = 24 * 60 * 60 * 1000

/** 数据复盘区(doc.md §5.1/§5.2):历史会话列表 + 节奏散点图 */
export function Dashboard({ sessions, t }: Props) {
  const [range, setRange] = useState<Range>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (range === 'all') return sessions
    const now = Date.now()
    const span = range === 'today' ? DAY_MS : range === '7d' ? 7 * DAY_MS : 30 * DAY_MS
    return sessions.filter((s) => now - s.startTime <= span)
  }, [sessions, range])

  const selected = filtered.find((s) => s.sessionId === selectedId) ?? null

  if (sessions.length === 0) {
    return (
      <div className="text-neutral-400 text-sm flex flex-col items-center gap-2">
        <p>{t('dashboard.empty')}</p>
        <p>{t('dashboard.emptyHint')}</p>
      </div>
    )
  }

  const rangeLabel = (r: Range) =>
    r === 'all' ? t('dashboard.range.all') : r === 'today' ? t('dashboard.range.today') : r === '7d' ? t('dashboard.range.7d') : t('dashboard.range.30d')

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      <div className="flex gap-2 items-center">
        <span className="text-sm text-neutral-400">{t('dashboard.timeRange')}</span>
        {(['all', 'today', '7d', '30d'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            className={`px-2 py-0.5 text-xs rounded border ${range === r ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setRange(r)}
          >
            {rangeLabel(r)}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {filtered.map((s) => (
          <li
            key={s.sessionId}
            className={`flex items-center justify-between p-2 rounded bg-neutral-800 border cursor-pointer ${selectedId === s.sessionId ? 'border-sky-500' : 'border-white/10'}`}
            onClick={() => setSelectedId(s.sessionId)}
          >
            <span className={s.status === 'SUCCESS' ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {s.status === 'SUCCESS' ? '✓' : '✗'} {new Date(s.startTime).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400">
              {s.metrics
                ? `${t('dashboard.ratio')} ${s.metrics.orbRatio !== null ? Math.round(s.metrics.orbRatio * 100) + '%' : 'N/A'} · ${Math.round(s.metrics.durationMs)}ms · ${t('dashboard.excess')}${s.metrics.excessOrbSwitches}`
                : t('dashboard.notEvaluated')}
            </span>
          </li>
        ))}
        {filtered.length === 0 && <li className="text-neutral-500 text-sm">{t('dashboard.noRecordInRange')}</li>}
      </ul>

      {selected && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-neutral-300">{t('dashboard.rhythmTitle')}</h3>
          <RhythmScatter actions={selected.actions} t={t} />
        </div>
      )}
    </div>
  )
}
