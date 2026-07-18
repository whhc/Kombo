import { useState, useEffect } from 'react'
import type { TargetCombo, SpellName } from '../domain/types'
import { ALL_SPELLS } from '../domain/spellNames'
import { SpellIcon } from './SpellIcon'
import { spellName as spellNameFn } from '../domain/i18n'
import { isAutoName, isPresetKey } from '../domain/resolveComboName'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'

interface Props {
  initial?: TargetCombo
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
  onSave: (combo: TargetCombo) => void
  onCancel: () => void
}

/** 连招编辑器:命名 + 选技能成序列 + 可选预切前缀 + 保存。
 *  skills 变化时若名称为空(或 auto. 前缀),自动生成为 "auto.Spell1.Spell2…"。 */
export function ComboEditor({ initial, iconTheme, locale, t, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [spells, setSpells] = useState<SpellName[]>(initial?.spells ?? [])
  const [preD, setPreD] = useState<SpellName | ''>(initial?.preCastSlots.d ?? '')
  const [preF, setPreF] = useState<SpellName | ''>(initial?.preCastSlots.f ?? '')

  // 自动命名:spells 变化时若 name 为空或以 auto./preset. 开头,自动填入
  useEffect(() => {
    if (spells.length === 0) return
    if (name === '' || isAutoName(name) || isPresetKey(name)) {
      setName('auto.' + spells.join('.'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spells])

  const addSpell = (s: SpellName) => setSpells((prev) => [...prev, s])
  const removeSpellAt = (i: number) => setSpells((prev) => prev.filter((_, idx) => idx !== i))

  // 预切约束:连续前缀。D=spells[0],F=spells[1] 且需先选 D
  const validD: SpellName | '' = spells.length >= 1 ? spells[0] : ''
  const validF: SpellName | '' = spells.length >= 2 && preD !== '' ? spells[1] : ''
  const dOptions = spells.length >= 1 ? [spells[0]] : []
  const fOptions = spells.length >= 2 && preD !== '' ? [spells[1]] : []

  const handleSave = () => {
    if (spells.length === 0) return
    const preCastSlots: TargetCombo['preCastSlots'] = {}
    if (preD && preD === validD) preCastSlots.d = preD
    if (preF && preF === validF) preCastSlots.f = preF
    onSave({
      comboId: initial?.comboId ?? `combo-${Date.now()}`,
      name: name.trim() || t('combo.new'),
      spells,
      preCastSlots,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg max-w-2xl w-full">
      <label className="flex flex-col gap-1 text-sm">
        {t('combo.name')}
        <input
          className="bg-neutral-800 px-2 py-1 rounded text-neutral-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label={t('combo.name')}
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-neutral-400">{t('combo.spellSequence')}</span>
        <div className="flex flex-wrap gap-2">
          {ALL_SPELLS.map((s) => (
            <button
              key={s}
              type="button"
              className="flex flex-col items-center hover:bg-white/10 rounded p-1"
              aria-label={`${t('combo.addSpell')} ${spellNameFn(locale, iconTheme, s)}`}
              onClick={() => addSpell(s)}
            >
              <SpellIcon spell={s} tooltipName={spellNameFn(locale, iconTheme, s)} size={36} theme={iconTheme} />
            </button>
          ))}
        </div>
        <ol className="flex flex-wrap gap-2 mt-1">
          {spells.map((s, i) => (
            <li key={`${s}-${i}`} className="relative p-1 rounded bg-amber-600/30 border border-amber-500/40">
              <SpellIcon spell={s} tooltipName={`${i + 1}. ${spellNameFn(locale, iconTheme, s)}`} size={32} theme={iconTheme} />
              <span className="absolute -top-1 -left-1 text-[10px] bg-neutral-900 rounded-full w-4 h-4 flex items-center justify-center">
                {i + 1}
              </span>
              <button
                type="button"
                className="absolute -top-2 -right-2 text-rose-400 bg-neutral-900 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => removeSpellAt(i)}
                aria-label="×"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-4 text-sm">
        <label className="flex flex-col gap-1">
          {t('combo.preCastD')}
          <select
            className="bg-neutral-800 px-2 py-1 rounded"
            aria-label={t('combo.preCastD')}
            value={preD}
            onChange={(e) => {
              setPreD(e.target.value as SpellName | '')
              if (e.target.value === '') setPreF('')
            }}
            disabled={dOptions.length === 0}
          >
            <option value="">{t('combo.preCastNone')}</option>
            {dOptions.map((s) => (
              <option key={s} value={s}>
                {spellNameFn(locale, iconTheme, s)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {t('combo.preCastF')}
          <select
            className="bg-neutral-800 px-2 py-1 rounded"
            aria-label={t('combo.preCastF')}
            value={preF}
            onChange={(e) => setPreF(e.target.value as SpellName | '')}
            disabled={fOptions.length === 0}
          >
            <option value="">{t('combo.preCastNone')}</option>
            {fOptions.map((s) => (
              <option key={s} value={s}>
                {spellNameFn(locale, iconTheme, s)}
              </option>
            ))}
          </select>
        </label>
        {validF === '' && preD !== '' && spells.length < 2 && (
          <span className="text-xs text-neutral-500 self-end">{t('combo.preCastFNeed2')}</span>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
          onClick={handleSave}
          disabled={spells.length === 0}
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  )
}
