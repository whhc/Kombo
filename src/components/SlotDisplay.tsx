import type { SpellName } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { spellName as spellNameFn } from '../domain/i18n'
import type { Locale } from '../domain/i18n'

interface Props {
  slots: [SpellName | null, SpellName | null]
  locale: Locale
  t: (key: string) => string
}

/** 双技能槽位:[第一顺位 D, 第二顺位 F] */
export function SlotDisplay({ slots, locale, t }: Props) {
  return (
    <div className="flex gap-4" aria-label={t('app.title')}>
      <Slot label={t('slot.first')} spell={slots[0]} locale={locale} t={t} />
      <Slot label={t('slot.second')} spell={slots[1]} locale={locale} t={t} />
    </div>
  )
}

function Slot({
  label,
  spell,
  locale,
  t,
}: {
  label: string
  spell: SpellName | null
  locale: Locale
  t: (key: string) => string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {spell ? (
        <SpellIcon spell={spell} tooltipName={spellNameFn(locale, spell)} size={56} />
      ) : (
        <div
          className="h-14 w-14 rounded-lg border-2 border-dashed border-white/15 bg-white/5 flex items-center justify-center text-neutral-600 text-xl"
          aria-label={`${label}: ${t('slot.empty')}`}
        >
          —
        </div>
      )}
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  )
}
