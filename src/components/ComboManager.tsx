import { useState } from 'react'
import type { TargetCombo } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { ComboEditor } from './ComboEditor'
import { PlayZone } from './PlayZone'
import { resolveComboName } from '../domain/resolveComboName'
import { spellName as spellNameFn } from '../domain/i18n'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'
import type { KeybindScheme } from '../domain/keymap'

interface Props {
  combos: TargetCombo[]
  onSave: (combo: TargetCombo) => void
  onDelete: (comboId: string) => void
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 连招列表 + 新建/编辑 + 内嵌练习(practicing) */
export function ComboManager({ combos, onSave, onDelete, scheme, iconTheme, locale, t }: Props) {
  const [editing, setEditing] = useState<TargetCombo | null>(null)
  const [creating, setCreating] = useState(false)
  const [practicing, setPracticing] = useState<TargetCombo | null>(null)

  // 编辑/新建优先
  if (creating || editing) {
    return (
      <ComboEditor
        initial={editing ?? undefined}
        iconTheme={iconTheme}
        locale={locale}
        t={t}
        onSave={(combo) => {
          onSave(combo)
          setCreating(false)
          setEditing(null)
        }}
        onCancel={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    )
  }

  // 内嵌练习
  if (practicing) {
    return (
      <PlayZone
        combo={practicing}
        scheme={scheme}
        iconTheme={iconTheme}
        locale={locale}
        t={t}
        onQuit={() => setPracticing(null)}
      />
    )
  }

  // 列表
  return (
    <div className="flex flex-col gap-3 max-w-2xl w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('combo.library')}</h2>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500"
          onClick={() => setCreating(true)}
        >
          {t('combo.new')}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {combos.map((c) => (
          <li
            key={c.comboId}
            className="flex items-center justify-between p-3 rounded bg-neutral-800 border border-white/10"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{resolveComboName(c, t, locale, iconTheme)}</span>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                {c.spells.map((s, i) => (
                  <SpellIcon key={i} spell={s} tooltipName={spellNameFn(locale, iconTheme, s)} size={20} theme={iconTheme} className="opacity-80" />
                ))}
                {(c.preCastSlots.d || c.preCastSlots.f) && (
                  <span className="ml-2 text-amber-400">
                    {t('combo.preCastLabel')}:
                    {[c.preCastSlots.d && spellNameFn(locale, iconTheme, c.preCastSlots.d), c.preCastSlots.f && spellNameFn(locale, iconTheme, c.preCastSlots.f)].filter(Boolean).join(' / ')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500" onClick={() => setPracticing(c)}>
                {t('combo.practice')}
              </button>
              <button type="button" className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10" onClick={() => setEditing(c)}>
                {t('combo.edit')}
              </button>
              <button type="button" className="px-2 py-1 text-xs rounded bg-rose-700 hover:bg-rose-600" onClick={() => onDelete(c.comboId)}>
                ×
              </button>
            </div>
          </li>
        ))}
        {combos.length === 0 && <li className="text-neutral-500 text-sm">{t('combo.empty')}</li>}
      </ul>
    </div>
  )
}
