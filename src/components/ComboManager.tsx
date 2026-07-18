import { useState } from 'react'
import type { TargetCombo } from '../domain/types'
import { SPELL_CN } from '../domain/spellNames'
import { ComboEditor } from './ComboEditor'

interface Props {
  combos: TargetCombo[]
  onSave: (combo: TargetCombo) => void
  onDelete: (comboId: string) => void
  onSelect: (combo: TargetCombo) => void
}

/** 连招列表 + 新建/编辑/删除入口 */
export function ComboManager({ combos, onSave, onDelete, onSelect }: Props) {
  const [editing, setEditing] = useState<TargetCombo | null>(null)
  const [creating, setCreating] = useState(false)

  if (creating || editing) {
    return (
      <ComboEditor
        initial={editing ?? undefined}
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
        <h2 className="text-lg font-semibold">连招库</h2>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500"
          onClick={() => setCreating(true)}
        >
          新建连招
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {combos.map((c) => (
          <li
            key={c.comboId}
            className="flex items-center justify-between p-3 rounded bg-neutral-800 border border-white/10"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-neutral-400">
                {c.spells.map((s) => SPELL_CN[s]).join(' → ')}
                {(c.preCastSlots.d || c.preCastSlots.f) && (
                  <span className="ml-2 text-amber-400">
                    预切:{[c.preCastSlots.d && SPELL_CN[c.preCastSlots.d], c.preCastSlots.f && SPELL_CN[c.preCastSlots.f]].filter(Boolean).join(' / ')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500" onClick={() => onSelect(c)}>
                练习
              </button>
              <button type="button" className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10" onClick={() => setEditing(c)}>
                编辑
              </button>
              <button type="button" className="px-2 py-1 text-xs rounded bg-rose-700 hover:bg-rose-600" onClick={() => onDelete(c.comboId)}>
                删除
              </button>
            </div>
          </li>
        ))}
        {combos.length === 0 && <li className="text-neutral-500 text-sm">还没有连招,点"新建连招"创建一条。</li>}
      </ul>
    </div>
  )
}
