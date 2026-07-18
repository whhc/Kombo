import { useEffect, useState } from 'react'
import { OrbDisplay } from './OrbDisplay'
import { SlotDisplay } from './SlotDisplay'
import { ProgressBar } from './ProgressBar'
import { handleInvokerKey, type InvokerState } from '../domain/invokerEngine'
import { createSession, pushAction, finishSession, createInitialInvokerState, type SessionState } from '../domain/sessionEngine'
import { evaluateSession } from '../domain/evaluator'
import { resolveComboName } from '../domain/resolveComboName'
import type { TargetCombo, SpellName, SessionMetrics } from '../domain/types'
import { saveSession, localStorageSessionBackend } from '../domain/sessionStore'
import { spellName as spellNameFn } from '../domain/i18n'
import type { KeybindScheme } from '../domain/keymap'
import type { Locale } from '../domain/i18n'

interface Props {
  combo: TargetCombo | null
  scheme: KeybindScheme
  locale: Locale
  t: (key: string) => string
}

/** 主练习区:持目标连招时启动会话,记录动作,进度条温和提示,宽松继续 */
export function PlayZone({ combo, scheme, locale, t }: Props) {
  const [invoker, setInvoker] = useState<InvokerState>({ orbs: [], slots: [null, null] })
  const [session, setSession] = useState<SessionState | null>(null)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)
  const [finished, setFinished] = useState<{ status: 'SUCCESS' | 'FAILED'; metrics: SessionMetrics } | null>(null)

  useEffect(() => {
    if (!combo) {
      setSession(null)
      setInvoker({ orbs: [], slots: [null, null] })
      setFinished(null)
      return
    }
    setSession(createSession(combo))
    setInvoker(createInitialInvokerState(combo))
    setLastTs(0)
    setLastCast(null)
    setFinished(null)
  }, [combo])

  useEffect(() => {
    if (!combo || !session || finished) return
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = performance.now()
      const result = handleInvokerKey(invoker, key, now, lastTs, scheme)
      if (result.action) {
        setInvoker(result.state)
        setLastTs(now)
        if (result.action.actionType === 'CAST' || result.action.actionType === 'MISS_CAST') {
          setLastCast({ type: result.action.actionType, spell: result.action.spellName ?? null })
        }
        setSession((prev) => (prev ? pushAction(prev, result.action!, combo) : prev))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, session, invoker, lastTs, scheme, finished])

  const endSession = () => {
    if (!combo || !session) return
    const result = finishSession(session, combo, performance.now())
    const metrics = evaluateSession(result, combo)
    const withMetrics = { ...result, metrics }
    saveSession(localStorageSessionBackend, withMetrics)
    setFinished({ status: result.status, metrics })
  }

  if (!combo) {
    return <p className="text-neutral-400 text-sm">{t('practice.guide')}</p>
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <p className="text-amber-300 text-sm">{t('practice.currentCombo')}: {resolveComboName(combo, t)}</p>
      <OrbDisplay orbs={invoker.orbs} locale={locale} t={t} />
      <SlotDisplay slots={invoker.slots} scheme={scheme} locale={locale} t={t} />
      <ProgressBar combo={combo} progress={session?.progress ?? 0} failedSteps={session?.failedSteps ?? []} locale={locale} t={t} />

      <div className="text-sm h-6">
        {lastCast && !finished && (
          <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
            {lastCast.type === 'CAST' ? t('practice.cast') : t('practice.missCast')}
            {lastCast.spell ? `: ${spellNameFn(locale, lastCast.spell)}` : ''}
          </span>
        )}
      </div>

      {finished ? (
        <div className="flex flex-col items-center gap-3">
          <span className={finished.status === 'SUCCESS' ? 'text-emerald-400 font-bold text-lg' : 'text-rose-400 font-bold text-lg'}>
            {finished.status === 'SUCCESS' ? t('practice.success') : t('practice.failed')}
          </span>
          <MetricsPanel metrics={finished.metrics} t={t} />
          <button
            type="button"
            className="px-3 py-1 text-sm rounded bg-sky-600 hover:bg-sky-500"
            onClick={() => {
              setSession(createSession(combo))
              setInvoker(createInitialInvokerState(combo))
              setLastTs(0)
              setLastCast(null)
              setFinished(null)
            }}
          >
            {t('practice.again')}
          </button>
        </div>
      ) : (
        <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={endSession}>
          {t('practice.endAndSave')}
        </button>
      )}
    </div>
  )
}

/** 三维评估结果展示(doc.md §4.2) */
function MetricsPanel({ metrics, t }: { metrics: SessionMetrics; t: (key: string) => string }) {
  const orbPct = metrics.orbRatio !== null ? `${Math.round(metrics.orbRatio * 100)}%` : t('metrics.failedNA')
  return (
    <div className="flex gap-6 text-sm" aria-label="评估结果">
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-xs">{t('metrics.orbRatio')}</span>
        <span className={metrics.orbRatio !== null ? 'text-amber-300 font-semibold' : 'text-neutral-500'}>{orbPct}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-xs">{t('metrics.excess')}</span>
        <span className="text-rose-300 font-semibold">{metrics.excessOrbSwitches}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-xs">{t('metrics.duration')}</span>
        <span className="text-sky-300 font-semibold">{Math.round(metrics.durationMs)}</span>
      </div>
    </div>
  )
}
