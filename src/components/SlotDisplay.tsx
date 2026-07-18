import type { SpellName } from '../domain/types'

/** 双技能槽位 UI:[第一顺位 D, 第二顺位 F] */
export function SlotDisplay({ slots }: { slots: [SpellName | null, SpellName | null] }) {
  return (
    <div className="flex gap-3" aria-label="技能槽位">
      <Slot label="D · 第一顺位" spell={slots[0]} />
      <Slot label="F · 第二顺位" spell={slots[1]} />
    </div>
  )
}

function Slot({ label, spell }: { label: string; spell: SpellName | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-20 w-20 rounded-lg border-2 flex items-center justify-center text-sm font-semibold ${
          spell ? 'border-amber-400 bg-amber-400/15 text-amber-200' : 'border-dashed border-white/15 bg-white/5 text-neutral-500'
        }`}
        aria-label={spell ? `槽位 ${label}: ${spell}` : `槽位 ${label}: 空`}
      >
        {spell ?? '—'}
      </div>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  )
}
