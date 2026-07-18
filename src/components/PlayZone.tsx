import { useEffect, useState } from 'react'
import { OrbDisplay } from './OrbDisplay'
import { SlotDisplay } from './SlotDisplay'
import { ProgressBar } from './ProgressBar'
import { handleInvokerKey, type InvokerState } from '../domain/invokerEngine'
import { createSession, pushAction, finishSession, createInitialInvokerState, type SessionState } from '../domain/sessionEngine'
import type { TargetCombo, SpellName } from '../domain/types'
import { saveSession, localStorageSessionBackend } from '../domain/sessionStore'
import type { KeybindScheme } from '../domain/keymap'

interface Props {
  combo: TargetCombo | null
  scheme: KeybindScheme
}

/** 主练习区:持目标连招时启动会话,记录动作,进度条温和提示,宽松继续 */
export function PlayZone({ combo, scheme }: Props) {
  const [invoker, setInvoker] = useState<InvokerState>({ orbs: [], slots: [null, null] })
  const [session, setSession] = useState<SessionState | null>(null)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)
  const [finished, setFinished] = useState<{ status: 'SUCCESS' | 'FAILED' } | null>(null)

  // combo 变化时重置会话 + 应用预切起手
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
    saveSession(localStorageSessionBackend, result)
    setFinished({ status: result.status })
  }

  if (!combo) {
    return <p className="text-neutral-400 text-sm">从"连招库"选择一条连招开始练习。</p>
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <p className="text-amber-300 text-sm">当前连招:{combo.name}</p>
      <OrbDisplay orbs={invoker.orbs} />
      <SlotDisplay slots={invoker.slots} />
      <ProgressBar combo={combo} progress={session?.progress ?? 0} failedSteps={session?.failedSteps ?? []} />

      <div className="text-sm h-6">
        {lastCast && !finished && (
          <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
            {lastCast.type === 'CAST' ? '释放' : '空放'}
            {lastCast.spell ? `: ${lastCast.spell}` : ''}
          </span>
        )}
      </div>

      {finished ? (
        <div className="flex flex-col items-center gap-2">
          <span className={finished.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            {finished.status === 'SUCCESS' ? '✓ 成功' : '✗ 失败(有跑偏步骤)'}
          </span>
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
            再练一次
          </button>
        </div>
      ) : (
        <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={endSession}>
          结束并保存
        </button>
      )}
    </div>
  )
}
