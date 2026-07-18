import type { TargetCombo } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { spellName as spellNameFn } from '../domain/i18n'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  combo: TargetCombo
  progress: number
  failedSteps: number[]
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 目标连招进度条:温和提示当前步,标红跑偏步骤,已完成置灰 */
export function ProgressBar({ combo, progress, failedSteps, theme, locale, t }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-center" aria-label={t('app.title')}>
      {combo.spells.map((spell, i) => {
        const done = i < progress
        const current = i === progress
        const failed = failedSteps.includes(i)
        const cls = failed
          ? 'border-rose-500 bg-rose-500/20'
          : current
            ? 'border-amber-400 bg-amber-400/25'
            : done
              ? 'border-emerald-600 bg-emerald-600/20'
              : 'border-white/15 bg-white/5'
        return (
          <div key={`${spell}-${i}`} className={`relative p-1 rounded border ${cls}`} title={spellNameFn(locale, theme, spell)}>
            <SpellIcon spell={spell} tooltipName={`${i + 1}. ${spellNameFn(locale, theme, spell)}`} size={32} theme={theme} className={done ? 'opacity-60' : ''} />
            <span className="absolute -top-1 -left-1 text-[10px] bg-neutral-900 rounded-full w-4 h-4 flex items-center justify-center">
              {i + 1}
            </span>
          </div>
        )
      })}
    </div>
  )
}
