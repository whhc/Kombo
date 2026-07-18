import { useState } from 'react'
import type { TargetCombo, SpellName } from '../domain/types'
import { ALL_SPELLS, SPELL_CN } from '../domain/spellNames'

interface Props {
  initial?: TargetCombo
  onSave: (combo: TargetCombo) => void
  onCancel: () => void
}

/** 连招编辑器:命名 + 选技能成序列 + 可选预切前缀 + 保存 */
export function ComboEditor({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [spells, setSpells] = useState<SpellName[]>(initial?.spells ?? [])
  const [preD, setPreD] = useState<SpellName | ''>(initial?.preCastSlots.d ?? '')
  const [preF, setPreF] = useState<SpellName | ''>(initial?.preCastSlots.f ?? '')

  const addSpell = (s: SpellName) => setSpells((prev) => [...prev, s])
  const removeSpellAt = (i: number) => setSpells((prev) => prev.filter((_, idx) => idx !== i))

  // 预切约束:连续前缀。D 只能是 spells[0],F 只能是 spells[1] 且需先选 D。
  // spells 变化时,把越界的预切清掉
  const validD: SpellName | '' = spells.length >= 1 ? spells[0] : ''
  const validF: SpellName | '' = spells.length >= 2 && preD !== '' ? spells[1] : ''
  const dOptions = spells.length >= 1 ? [spells[0]] : []
  const fOptions = spells.length >= 2 && preD !== '' ? [spells[1]] : []

  const handleSave = () => {
    if (spells.length === 0) return // 拦截空序列
    const preCastSlots: TargetCombo['preCastSlots'] = {}
    if (preD && preD === validD) preCastSlots.d = preD
    if (preF && preF === validF) preCastSlots.f = preF
    onSave({
      comboId: initial?.comboId ?? `combo-${Date.now()}`,
      name: name.trim() || '未命名连招',
      spells,
      preCastSlots,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg max-w-2xl w-full">
      <label className="flex flex-col gap-1 text-sm">
        连招名称
        <input
          className="bg-neutral-800 px-2 py-1 rounded text-neutral-100"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="连招名称"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-neutral-400">技能序列(点击添加,允许重复)</span>
        <div className="flex flex-wrap gap-2">
          {ALL_SPELLS.map((s) => (
            <button
              key={s}
              type="button"
              className="px-2 py-1 text-xs rounded bg-neutral-700 hover:bg-neutral-600"
              onClick={() => addSpell(s)}
            >
              添加 {SPELL_CN[s]}
            </button>
          ))}
        </div>
        <ol className="flex flex-wrap gap-2 mt-1">
          {spells.map((s, i) => (
            <li key={`${s}-${i}`} className="px-2 py-1 text-xs rounded bg-amber-600/30 border border-amber-500/40">
              {i + 1}. {SPELL_CN[s]}{' '}
              <button type="button" className="text-rose-400 ml-1" onClick={() => removeSpellAt(i)}>
                ×
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-4 text-sm">
        <label className="flex flex-col gap-1">
          预切 D 槽
          <select
            className="bg-neutral-800 px-2 py-1 rounded"
            aria-label="预切 D 槽"
            value={preD}
            onChange={(e) => {
              setPreD(e.target.value as SpellName | '')
              if (e.target.value === '') setPreF('')
            }}
            disabled={dOptions.length === 0}
          >
            <option value="">不预切</option>
            {dOptions.map((s) => (
              <option key={s} value={s}>
                {SPELL_CN[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          预切 F 槽
          <select
            className="bg-neutral-800 px-2 py-1 rounded"
            aria-label="预切 F 槽"
            value={preF}
            onChange={(e) => setPreF(e.target.value as SpellName | '')}
            disabled={fOptions.length === 0}
          >
            <option value="">不预切</option>
            {fOptions.map((s) => (
              <option key={s} value={s}>
                {SPELL_CN[s]}
              </option>
            ))}
          </select>
        </label>
        {validF === '' && preD !== '' && spells.length < 2 && (
          <span className="text-xs text-neutral-500 self-end">需至少 2 个技能才能预切 F 槽</span>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" className="px-3 py-1 text-sm rounded border border-white/20 hover:bg-white/10" onClick={onCancel}>
          取消
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
          onClick={handleSave}
          disabled={spells.length === 0}
        >
          保存连招
        </button>
      </div>
    </div>
  )
}
