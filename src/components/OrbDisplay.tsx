import type { Element } from '../domain/types'
import { ELEMENT_INFO } from '../domain/orbDisplay'

/** 头顶元素球的 UI 展示:固定 3 个槽位,按顺序填充,空槽显示占位 */
export function OrbDisplay({ orbs }: { orbs: Element[] }) {
  const slots: (Element | null)[] = [orbs[0] ?? null, orbs[1] ?? null, orbs[2] ?? null]

  return (
    <div className="flex gap-3" aria-label="元素球">
      {slots.map((orb, i) =>
        orb ? (
          <div
            key={i}
            className={`h-16 w-16 rounded-full border-2 border-white/30 ${ELEMENT_INFO[orb].tw} flex items-center justify-center text-white text-sm font-bold`}
            aria-label={ELEMENT_INFO[orb].name}
          >
            {orb}
          </div>
        ) : (
          <div
            key={i}
            className="h-16 w-16 rounded-full border-2 border-dashed border-white/15 bg-white/5"
            aria-label="空槽"
          />
        ),
      )}
    </div>
  )
}
