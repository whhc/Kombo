import { useEffect, useState } from 'react'
import { OrbDisplay } from './OrbDisplay'
import { SlotDisplay } from './SlotDisplay'
import { ProgressBar } from './ProgressBar'
import { SpellHistory } from './SpellHistory'
import { handleInvokerKey, type InvokerState } from '../domain/invokerEngine'
import { createSession, pushAction, finishSession, createInitialInvokerState, type SessionState } from '../domain/sessionEngine'
import { evaluateSession } from '../domain/evaluator'
import { resolveComboName } from '../domain/resolveComboName'
import type { TargetCombo, SpellName, SessionMetrics } from '../domain/types'
import { saveSession, localStorageSessionBackend } from '../domain/sessionStore'
import { spellName as spellNameFn } from '../domain/i18n'
import type { KeybindScheme } from '../domain/keymap'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  combo: TargetCombo | null
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
  /** 内嵌模式:退出(不保存)回调;无则使用独立模式(自动保存+循环) */
  onQuit?: () => void
}

/**
 * 主练习区。三种模式按 props 组合:
 *   combo=null + 无onQuit → 自由模式(SpellHistory FIFO10,重置)
 *   combo非空 + 有onQuit → 内嵌模式(Quit退出,不保存不循环)
 *   combo非空 + 无onQuit → 独立模式(自动保存+循环,当前行为)
 */
export function PlayZone({ combo, scheme, iconTheme, locale, t, onQuit }: Props) {
  const [invoker, setInvoker] = useState<InvokerState>({ orbs: [], slots: [null, null] })
  const [session, setSession] = useState<SessionState | null>(null)
  const [loopPaused, setLoopPaused] = useState(false)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)
  const [finished, setFinished] = useState<{ status: 'SUCCESS' | 'FAILED'; metrics: SessionMetrics } | null>(null)
  const [spellHistory, setSpellHistory] = useState<SpellName[]>([])

  useEffect(() => {
    if (!combo) {
      setSession(null)
      setInvoker({ orbs: [], slots: [null, null] })
      setFinished(null)
      setLoopPaused(false)
      setSpellHistory([])
      return
    }
    resetRound(combo)
    setSpellHistory([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo])

  function resetRound(c: TargetCombo) {
    setSession(createSession(c))
    setInvoker(createInitialInvokerState(c))
    setLastTs(0)
    setLastCast(null)
    setFinished(null)
  }

  // 自动循环(独立/内嵌模式均适用)
  useEffect(() => {
    if (!combo) return
    if (!finished || loopPaused || !combo) return
    const timer = setTimeout(() => resetRound(combo), 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, loopPaused, combo])

  // 自动保存(独立/内嵌模式均适用,completed 时触发)
  const endSession = () => {
    if (!combo || !session) return
    const result = finishSession(session, combo, Date.now())
    const metrics = evaluateSession(result, combo)
    const withMetrics = { ...result, metrics }
    saveSession(localStorageSessionBackend, withMetrics)
    setFinished({ status: result.status, metrics })
  }

  useEffect(() => {
    if (!combo) return
    if (session?.completed && !finished) endSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.completed, finished, combo])

  useEffect(() => {
    if (finished) return

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = Date.now()
      const result = handleInvokerKey(invoker, key, now, lastTs, scheme)
      if (!result.action) return
      const action = result.action
      setInvoker(result.state)
      setLastTs(now)

      if (action.actionType === 'CAST' || action.actionType === 'MISS_CAST') {
        setLastCast({ type: action.actionType, spell: action.spellName ?? null })
        if (action.actionType === 'CAST' && action.spellName) {
          setSpellHistory((prev) => [...prev.slice(-9), action.spellName!])
        }
      }

      if (combo && session) {
        setSession((prev) => (prev ? pushAction(prev, action, combo) : prev))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, session, invoker, lastTs, scheme, onQuit, finished])

  // ─── 自由模式(combo=null) ───
  if (!combo) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
        <p className="text-amber-300 text-sm">{t('practice.freePlay')}</p>
        <OrbDisplay orbs={invoker.orbs} theme={iconTheme} locale={locale} t={t} />
        <SlotDisplay slots={invoker.slots} scheme={scheme} theme={iconTheme} locale={locale} t={t} />
        <div className="text-sm h-6">
          {lastCast && (
            <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
              {lastCast.type === 'CAST' ? t('practice.cast') : t('practice.missCast')}
              {lastCast.spell ? `: ${spellNameFn(locale, iconTheme, lastCast.spell)}` : ''}
            </span>
          )}
        </div>
        <SpellHistory spells={spellHistory} theme={iconTheme} locale={locale} />
        <button
          type="button"
          className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10"
          onClick={() => setSpellHistory([])}
        >
          {t('practice.reset')}
        </button>
      </div>
    )
  }

  // ─── 组合模式(独立/内嵌) ───
  const showQuit = onQuit !== undefined

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <p className="text-amber-300 text-sm">{t('practice.currentCombo')}: {resolveComboName(combo, t, locale, iconTheme)}</p>
      <OrbDisplay orbs={invoker.orbs} theme={iconTheme} locale={locale} t={t} />
      <SlotDisplay slots={invoker.slots} scheme={scheme} theme={iconTheme} locale={locale} t={t} />
      <ProgressBar combo={combo} progress={session?.progress ?? 0} failedSteps={session?.failedSteps ?? []} theme={iconTheme} locale={locale} t={t} />

      <div className="text-sm h-6">
        {lastCast && !finished && (
          <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
            {lastCast.type === 'CAST' ? t('practice.cast') : t('practice.missCast')}
            {lastCast.spell ? `: ${spellNameFn(locale, iconTheme, lastCast.spell)}` : ''}
          </span>
        )}
      </div>

      <SpellHistory spells={spellHistory} theme={iconTheme} locale={locale} />

      {finished ? (
        <div className="flex flex-col items-center gap-3">
          <span className={finished.status === 'SUCCESS' ? 'text-emerald-400 font-bold text-lg' : 'text-rose-400 font-bold text-lg'}>
            {finished.status === 'SUCCESS' ? t('practice.success') : t('practice.failed')}
          </span>
          <MetricsPanel metrics={finished.metrics} t={t} />
          {loopPaused ? (
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1 text-sm rounded bg-sky-600 hover:bg-sky-500" onClick={() => combo && resetRound(combo)}>
                {t('practice.again')}
              </button>
              {showQuit && <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onQuit}>{t('practice.quit')}</button>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-400">{t('practice.autoNext')}</span>
              <div className="flex gap-2">
                <button type="button" className="px-3 py-1 text-xs rounded border border-white/20 hover:bg-white/10" onClick={() => setLoopPaused(true)}>
                  {t('practice.pauseLoop')}
                </button>
                {showQuit && <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onQuit}>{t('practice.quit')}</button>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={endSession}>
            {t('practice.endAndSave')}
          </button>
          {showQuit && <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onQuit}>{t('practice.quit')}</button>}
        </div>
      )}
    </div>
  )
}

/** 三维评估结果展示 */
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
