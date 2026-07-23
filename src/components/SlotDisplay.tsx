import { useEffect, useState } from 'react'
import type { SpellName } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { CooldownOverlay } from './CooldownOverlay'
import { spellName as spellNameFn } from '../domain/i18n'
import { slotReleaseKey } from '../domain/keymap'
import type { KeybindScheme } from '../domain/keymap'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

/** 冷却时长 2 秒(与 PlayZone 的拦截逻辑保持一致) */
const COOLDOWN_MS = 2000

interface Props {
  slots: [SpellName | null, SpellName | null]
  scheme: KeybindScheme
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
  /** 各技能冷却到期时间戳(来自 PlayZone)。未传则无冷却 */
  cooldowns?: Map<SpellName, number>
}

/** 双技能槽位:显示该槽位的释放键标签(LEGACY=技能传统键,DOTA2=D/F)。
 *  技能处于冷却时叠加时钟扫描遮蔽层。 */
export function SlotDisplay({ slots, scheme, theme, locale, t, cooldowns }: Props) {
  return (
    <div className="flex gap-4" role="group" aria-label={t('slot.group')}>
      <Slot index={0} spell={slots[0]} scheme={scheme} theme={theme} locale={locale} t={t} cooldowns={cooldowns} />
      <Slot index={1} spell={slots[1]} scheme={scheme} theme={theme} locale={locale} t={t} cooldowns={cooldowns} />
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
  cooldowns,
}: {
  index: 0 | 1
  spell: SpellName | null
  scheme: KeybindScheme
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
  cooldowns?: Map<SpellName, number>
}) {
  const releaseKey = slotReleaseKey(scheme, index, spell)
  // 标签:DOTA2 固定 D/F + 顺位描述;LEGACY 显示该技能传统键
  const label =
    scheme === 'DOTA2'
      ? `${releaseKey} · ${index === 0 ? t('slot.first').split(' · ')[1] : t('slot.second').split(' · ')[1]}`
      : spell
        ? `${releaseKey} · ${spellNameFn(locale, theme, spell)}`
        : t('slot.empty')

  // 该技能的冷却到期时间戳;用 state 驱动遮蔽动画,到期后自动清除
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  useEffect(() => {
    if (!spell || !cooldowns) {
      setCooldownUntil(null)
      return
    }
    const until = cooldowns.get(spell) ?? null
    setCooldownUntil(until)
    if (until !== null) {
      // 到期时清除遮蔽
      const remain = until - Date.now()
      if (remain > 0) {
        const id = setTimeout(() => setCooldownUntil(null), remain)
        return () => clearTimeout(id)
      }
      setCooldownUntil(null)
    }
  }, [spell, cooldowns])

  const cooling = cooldownUntil !== null && cooldownUntil > Date.now()

  return (
    <div className="flex flex-col items-center gap-1">
      {spell ? (
        <div className="relative" style={{ width: 56, height: 56 }}>
          <SpellIcon spell={spell} tooltipName={spellNameFn(locale, theme, spell)} size={56} theme={theme} />
          <CooldownOverlay active={cooling} durationMs={COOLDOWN_MS} size={56} />
        </div>
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
