import { useEffect, useState } from 'react'
import { OrbDisplay } from './OrbDisplay'
import { SlotDisplay } from './SlotDisplay'
import { handleInvokerKey, type InvokerState } from '../domain/invokerEngine'
import type { SpellName } from '../domain/types'
import type { KeybindScheme } from '../domain/keymap'

const INITIAL: InvokerState = { orbs: [], slots: [null, null] }

interface Props {
  /** 当前选中的连招(Issue 05 用于进度条;这里仅显示名称) */
  activeComboName?: string
  scheme: KeybindScheme
}

/** 主练习区:元素球 + 槽位 + 释放记录(无目标连招进度,留 Issue 05) */
export function PlayZone({ activeComboName, scheme }: Props) {
  const [state, setState] = useState<InvokerState>(INITIAL)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = performance.now()
      const result = handleInvokerKey(state, key, now, lastTs, scheme)
      if (result.action) {
        setState(result.state)
        setLastTs(now)
        if (result.action.actionType === 'CAST' || result.action.actionType === 'MISS_CAST') {
          setLastCast({ type: result.action.actionType, spell: result.action.spellName ?? null })
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state, lastTs, scheme])

  return (
    <div className="flex flex-col items-center gap-8">
      {activeComboName && <p className="text-amber-300 text-sm">当前连招:{activeComboName}</p>}
      <OrbDisplay orbs={state.orbs} />
      <SlotDisplay slots={state.slots} />
      <div className="text-sm h-6">
        {lastCast && (
          <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
            {lastCast.type === 'CAST' ? '释放' : '空放'}
            {lastCast.spell ? `: ${lastCast.spell}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}
