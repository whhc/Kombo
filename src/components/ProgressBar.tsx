import type { TargetCombo } from '../domain/types'
import { SPELL_CN } from '../domain/spellNames'

interface Props {
  combo: TargetCombo
  progress: number
  failedSteps: number[]
}

/** 目标连招进度条:温和提示当前步,标红跑偏步骤,已完成置灰 */
export function ProgressBar({ combo, progress, failedSteps }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-center" aria-label="目标连招进度">
      {combo.spells.map((spell, i) => {
        const done = i < progress
        const current = i === progress
        const failed = failedSteps.includes(i)
        const cls = failed
          ? 'border-rose-500 bg-rose-500/20 text-rose-300'
          : current
            ? 'border-amber-400 bg-amber-400/25 text-amber-200'
            : done
              ? 'border-emerald-600 bg-emerald-600/20 text-emerald-300'
              : 'border-white/15 bg-white/5 text-neutral-400'
        return (
          <span key={`${spell}-${i}`} className={`px-2 py-1 text-xs rounded border ${cls}`}>
            {i + 1}. {SPELL_CN[spell]}
          </span>
        )
      })}
    </div>
  )
}
