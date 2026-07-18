import type { SpellName } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { spellName as spellNameFn } from '../domain/i18n'
import { slotReleaseKey } from '../domain/keymap'
import type { KeybindScheme } from '../domain/keymap'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  slots: [SpellName | null, SpellName | null]
  scheme: KeybindScheme
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 双技能槽位:显示该槽位的释放键标签(LEGACY=技能传统键,DOTA2=D/F) */
export function SlotDisplay({ slots, scheme, theme, locale, t }: Props) {
  return (
    <div className="flex gap-4" aria-label={t('app.title')}>
      <Slot index={0} spell={slots[0]} scheme={scheme} theme={theme} locale={locale} t={t} />
      <Slot index={1} spell={slots[1]} scheme={scheme} theme={theme} locale={locale} t={t} />
    </div>
  )
}

function Slot({
  index,
  spell,
  scheme,
  theme,
  locale,
  t,
}: {
  index: 0 | 1
  spell: SpellName | null
  scheme: KeybindScheme
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}) {
  const releaseKey = slotReleaseKey(scheme, index, spell)
  // 标签:DOTA2 固定 D/F + 顺位描述;LEGACY 显示该技能传统键
  const label =
    scheme === 'DOTA2'
      ? `${releaseKey} · ${index === 0 ? t('slot.first').split(' · ')[1] : t('slot.second').split(' · ')[1]}`
      : spell
        ? `${releaseKey} · ${spellNameFn(locale, spell)}`
        : t('slot.empty')

  return (
    <div className="flex flex-col items-center gap-1">
      {spell ? (
        <SpellIcon spell={spell} tooltipName={spellNameFn(locale, spell)} size={56} theme={theme} />
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
