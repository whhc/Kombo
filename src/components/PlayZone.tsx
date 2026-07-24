import { useEffect, useState, useMemo, useRef } from 'react'
import { OrbDisplay } from './OrbDisplay'
import { SlotDisplay } from './SlotDisplay'
import { ProgressBar } from './ProgressBar'
import { SpellHistory } from './SpellHistory'
import { OptimalPathDisplay } from './OptimalPathDisplay'
import { RecipePanel } from './RecipePanel'
import { handleInvokerKey, type InvokerState } from '../domain/invokerEngine'
import { createSession, pushAction, finishSession, createInitialInvokerState, type SessionState } from '../domain/sessionEngine'
import { evaluateSession } from '../domain/evaluator'
import { resolveComboName } from '../domain/resolveComboName'
import { solveCombo } from '../domain/solver'
import type { TargetCombo, SpellName, SessionMetrics } from '../domain/types'
import { saveSession, storeSessionBackend } from '../domain/sessionStore'
import { spellName as spellNameFn } from '../domain/i18n'
import { playSpellSound, playInvokeSound, playKillSound } from '../sound/soundManager'
import { StreakTracker } from '../domain/streakTracker'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import type { KeybindScheme } from '../domain/keymap'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

/** 技能冷却时长 2 秒(释放成功后该技能进入冷却) */
const COOLDOWN_MS = 2000

interface Props {
  combo: TargetCombo | null
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
  /** 内嵌模式:退出(不保存)回调;无则使用独立模式(自动保存+循环) */
  onQuit?: () => void
  /** 是否显示最优键序提示(练习开始前可见) */
  showOptimalPath?: boolean
  /** 切换最优键序显示(走 settings 持久化) */
  onToggleOptimalPath?: () => void
  /** 是否开启技能音效(切球/合成/释放);默认 false(自由/内嵌模式不传时静音) */
  soundEnabled?: boolean
  /** 是否开启击杀音效(First Blood/连杀广播);默认 false */
  killSoundEnabled?: boolean
}

/**
 * 主练习区。三种模式按 props 组合:
 *   combo=null + 无onQuit → 自由模式(SpellHistory FIFO10,重置)
 *   combo非空 + 有onQuit → 内嵌模式(Quit退出,不保存不循环)
 *   combo非空 + 无onQuit → 独立模式(自动保存+循环,当前行为)
 */
export function PlayZone({ combo, scheme, iconTheme, locale, t, onQuit, showOptimalPath = false, onToggleOptimalPath, soundEnabled = false, killSoundEnabled = false }: Props) {
  const streakTrackerRef = useRef(new StreakTracker())
  const [invoker, setInvoker] = useState<InvokerState>({ orbs: [], slots: [null, null] })
  const [session, setSession] = useState<SessionState | null>(null)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)
  const [finished, setFinished] = useState<{ status: 'SUCCESS' | 'FAILED'; metrics: SessionMetrics } | null>(null)
  const [spellHistory, setSpellHistory] = useState<SpellName[]>([])
  // 实时计时器:首有效键时间戳(0=未开始);elapsedMs 为显示值
  const [roundStartTs, setRoundStartTs] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 技能冷却:技能 → 到期时间戳。释放成功后该技能 2s 冷却,期内拦截释放
  const [cooldowns, setCooldowns] = useState<Map<SpellName, number>>(new Map())
  // 自由模式:是否显示技能配方面板
  const [showRecipe, setShowRecipe] = useState(false)

  useEffect(() => {
    if (!combo) {
      setSession(null)
      setInvoker({ orbs: [], slots: [null, null] })
      setFinished(null)
      setSpellHistory([])
      return
    }
    resetRound(combo)
    setSpellHistory([])
    // 重新进入连招:重置击杀 streak(含 FirstBlood)
    streakTrackerRef.current.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo])

  function resetRound(c: TargetCombo) {
    setSession(createSession(c))
    setInvoker(createInitialInvokerState(c))
    setLastTs(0)
    setLastCast(null)
    setFinished(null)
    // 计时器归零
    stopTimer()
    setRoundStartTs(0)
    setElapsedMs(0)
    // 清空冷却
    setCooldowns(new Map())
  }

  /** 停止计时器 interval(完成态/重置/卸载时调用) */
  function stopTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  /** 首有效键启动计时器 */
  function startTimer(startTs: number) {
    setRoundStartTs(startTs)
    stopTimer()
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTs)
    }, 50)
  }

  // 自动保存(独立/内嵌模式均适用,completed 时触发)
  const endSession = () => {
    if (!combo || !session) return
    const now = Date.now()
    const result = finishSession(session, combo, now)
    const metrics = evaluateSession(result, combo, scheme)
    const withMetrics = { ...result, metrics }
    saveSession(storeSessionBackend, withMetrics)
    setFinished({ status: result.status, metrics })
    // 完成态停表(冻结在 evaluator 的精确 durationMs 上)
    stopTimer()
    setElapsedMs(metrics.durationMs)
    // 击杀 streak:成功 → 推进并播音;失败(自身死亡)→ onFail 重置
    if (result.status === 'SUCCESS') {
      const announce = streakTrackerRef.current.onRoundSuccess(now)
      playKillSound(announce, killSoundEnabled)
    } else {
      streakTrackerRef.current.onFail()
    }
  }

  // 组件卸载时清理计时器,避免泄漏
  useEffect(() => () => stopTimer(), [])

  useEffect(() => {
    if (!combo) return
    if (session?.completed && !finished) endSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.completed, finished, combo])

  useEffect(() => {
    // 完成态:空格键重新开始一轮(不评估按键,只响应空格)
    if (finished) {
      const onFinishedKey = (e: KeyboardEvent) => {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault()
          if (combo) resetRound(combo)
        }
      }
      window.addEventListener('keydown', onFinishedKey)
      return () => window.removeEventListener('keydown', onFinishedKey)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      // Esc:组合模式 + 未完成态时放弃本轮(不存盘静默重置)
      if (e.key === 'Escape' && combo && !finished) {
        e.preventDefault()
        resetRound(combo)
        return
      }

      const key = e.key.toUpperCase()
      const now = Date.now()
      const result = handleInvokerKey(invoker, key, now, lastTs, scheme)
      if (!result.action) return
      const action = result.action

      // 冷却硬拦截:CAST 时检查该技能是否在冷却期内,是则作废此次释放
      // (不更新 invoker/slots、不进 session、不播音)
      if (action.actionType === 'CAST' && action.spellName) {
        const expiry = cooldowns.get(action.spellName)
        if (expiry && now < expiry) {
          return // 冷却中,拦截
        }
        // 仅"目标推进释放"触发冷却:连招模式下命中当前目标步才进冷却,
        // 错序释放不触发(避免阻塞后续合法释放);自由模式无目标,所有 CAST 都触发
        const isTargetCast =
          !combo || (session != null && action.spellName === combo.spells[session.progress])
        if (isTargetCast) {
          setCooldowns((prev) => {
            const next = new Map(prev)
            next.set(action.spellName!, now + COOLDOWN_MS)
            return next
          })
        }
      }

      // 首个有效按键启动计时器(与 evaluator durationMs 口径一致:首有效键起)
      if (combo && roundStartTs === 0) {
        startTimer(now)
      }

      setInvoker(result.state)
      setLastTs(now)

      if (action.actionType === 'CAST' || action.actionType === 'MISS_CAST') {
        setLastCast({ type: action.actionType, spell: action.spellName ?? null })
        if (action.actionType === 'CAST' && action.spellName) {
          setSpellHistory((prev) => [...prev.slice(-9), action.spellName!])
          playSpellSound(action.spellName, soundEnabled)
        }
      }

      // 成功合成技能(按 R 出有效技能,action.spellName 非空)时播放合成音
      if (action.actionType === 'INVOKE' && action.spellName) {
        playInvokeSound(soundEnabled)
      }

      if (combo && session) {
        setSession((prev) => (prev ? pushAction(prev, action, combo) : prev))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo, session, invoker, lastTs, scheme, onQuit, finished, soundEnabled, roundStartTs, cooldowns])

  // ─── 自由模式(combo=null) ───
  if (!combo) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
        <p className="text-amber-300 text-sm">{t('practice.freePlay')}</p>
        <OrbDisplay orbs={invoker.orbs} theme={iconTheme} locale={locale} t={t} />
        <SlotDisplay slots={invoker.slots} scheme={scheme} theme={iconTheme} locale={locale} t={t} cooldowns={cooldowns} />
        <div className="text-sm h-6">
          {lastCast && (
            <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
              {lastCast.type === 'CAST' ? t('practice.cast') : t('practice.missCast')}
              {lastCast.spell ? `: ${spellNameFn(locale, iconTheme, lastCast.spell)}` : ''}
            </span>
          )}
        </div>
        <SpellHistory spells={spellHistory} theme={iconTheme} locale={locale} />
        {/* 技能配方参考面板(可切换):标题行带眼睛按钮控制显示/隐藏 */}
        <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-neutral-100"
            onClick={() => setShowRecipe((v) => !v)}
            aria-label={t('practice.recipeToggle')}
            aria-expanded={showRecipe}
          >
            <span>{t('recipe.title')}</span>
            {showRecipe ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {showRecipe && <RecipePanel theme={iconTheme} locale={locale} />}
        </div>
      </div>
    )
  }

  // ─── 组合模式(独立/内嵌) ───
  const showQuit = onQuit !== undefined

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <p className="text-amber-300 text-sm flex items-center gap-2">
        <span>{t('practice.currentCombo')}: {resolveComboName(combo, t, locale, iconTheme)}</span>
        {/* 实时计时器:首有效键起,完成态停表冻结 */}
        {roundStartTs > 0 && (
          <span className="text-sky-300 font-mono text-xs" aria-label={t('practice.timer')}>
            ⏱ {(elapsedMs / 1000).toFixed(1)}s
          </span>
        )}
        {onToggleOptimalPath && (
          <button
            type="button"
            className="px-1.5 py-0.5 text-xs rounded border border-white/20 hover:bg-white/10"
            onClick={onToggleOptimalPath}
            aria-label={t('combo.toggleOptimalPath')}
            title={t('combo.toggleOptimalPath')}
          >
            {showOptimalPath ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        )}
      </p>
      <OrbDisplay orbs={invoker.orbs} theme={iconTheme} locale={locale} t={t} />
      <SlotDisplay slots={invoker.slots} scheme={scheme} theme={iconTheme} locale={locale} t={t} cooldowns={cooldowns} />
      <ProgressBar combo={combo} progress={session?.progress ?? 0} failedSteps={session?.failedSteps ?? []} theme={iconTheme} locale={locale} t={t} />

      {/* 最优键序提示:练习前作参考(finished 后隐藏避免干扰) */}
      {showOptimalPath && !finished && (
        <OptimalPathHint combo={combo} scheme={scheme} iconTheme={iconTheme} locale={locale} label={t('combo.optimalPath')} />
      )}

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
          <span className={`flex items-center gap-1.5 font-bold text-lg ${finished.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {finished.status === 'SUCCESS' ? <Check size={20} /> : <X size={20} />}
            {finished.status === 'SUCCESS' ? t('practice.success') : t('practice.failed')}
          </span>
          <MetricsPanel metrics={finished.metrics} t={t} />
          <div className="flex gap-2 items-center">
            <button type="button" className="px-3 py-1 text-sm rounded bg-sky-600 hover:bg-sky-500" onClick={() => combo && resetRound(combo)}>
              {t('practice.again')}
            </button>
            {showQuit && <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onQuit}>{t('practice.quit')}</button>}
          </div>
          <span className="text-xs text-neutral-500">{t('practice.againHint')}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={endSession}>
              {t('practice.endAndSave')}
            </button>
            {showQuit && <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onQuit}>{t('practice.quit')}</button>}
          </div>
          <span className="text-xs text-neutral-500">{t('practice.discardHint')}</span>
        </div>
      )}
    </div>
  )
}

/** 三维评估结果展示 */
function MetricsPanel({ metrics, t }: { metrics: SessionMetrics; t: (key: string) => string }) {
  const orbPct = metrics.orbRatio !== null ? `${Math.round(metrics.orbRatio * 100)}%` : t('metrics.failedNA')
  const keyPct = metrics.keyRatio !== null ? `${Math.round(metrics.keyRatio * 100)}%` : t('metrics.failedNA')
  return (
    <div className="flex gap-6 text-sm" aria-label="评估结果">
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-xs">{t('metrics.orbRatio')}</span>
        <span className={metrics.orbRatio !== null ? 'text-amber-300 font-semibold' : 'text-neutral-500'}>{orbPct}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-neutral-400 text-xs">{t('metrics.keyRatio')}</span>
        <span className={metrics.keyRatio !== null ? 'text-emerald-300 font-semibold' : 'text-neutral-500'}>{keyPct}</span>
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

/** 练习页面的最优键序提示行 */
function OptimalPathHint({
  combo,
  scheme,
  iconTheme,
  locale,
  label,
}: {
  combo: TargetCombo
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
  label: string
}) {
  const solution = useMemo(() => solveCombo(combo, scheme), [combo, scheme])
  if (!solution || solution.steps.length === 0) return null
  return (
    <div className="flex flex-col items-center gap-1 max-w-2xl">
      <span className="text-[10px] text-neutral-500">{label}</span>
      <OptimalPathDisplay steps={solution.steps} iconTheme={iconTheme} locale={locale} startingOrbs={solution.startingOrbs} />
    </div>
  )
}
