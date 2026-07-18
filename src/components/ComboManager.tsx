import { useState } from 'react'
import type { TargetCombo } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { ComboEditor } from './ComboEditor'
import { resolveComboName } from '../domain/resolveComboName'
import { spellName as spellNameFn } from '../domain/i18n'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  combos: TargetCombo[]
  onSave: (combo: TargetCombo) => void
  onDelete: (comboId: string) => void
  onSelect: (combo: TargetCombo) => void
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 连招列表 + 新建/编辑/删除入口 */
export function ComboManager({ combos, onSave, onDelete, onSelect, iconTheme, locale, t }: Props) {
  const [editing, setEditing] = useState<TargetCombo | null>(null)
  const [creating, setCreating] = useState(false)

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
              <span className="font-medium">{resolveComboName(c, t)}</span>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                {c.spells.map((s, i) => (
                  <SpellIcon key={i} spell={s} tooltipName={spellNameFn(locale, s)} size={20} theme={iconTheme} className="opacity-80" />
                ))}
                {(c.preCastSlots.d || c.preCastSlots.f) && (
                  <span className="ml-2 text-amber-400">
                    {t('combo.preCastLabel')}:
                    {[c.preCastSlots.d && spellNameFn(locale, c.preCastSlots.d), c.preCastSlots.f && spellNameFn(locale, c.preCastSlots.f)].filter(Boolean).join(' / ')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500" onClick={() => onSelect(c)}>
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
