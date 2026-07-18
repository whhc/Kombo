import type { Element } from '../domain/types'
import { ElementIcon } from './ElementIcon'
import { elementName } from '../domain/i18n'
import type { Locale } from '../domain/i18n'

interface Props {
  orbs: Element[]
  locale: Locale
  t: (key: string) => string
}

/** 头顶元素球:固定 3 槽位,用元素图标,空槽占位 */
export function OrbDisplay({ orbs, locale, t }: Props) {
  const slots: (Element | null)[] = [orbs[0] ?? null, orbs[1] ?? null, orbs[2] ?? null]

  return (
    <div className="flex gap-3" aria-label={t('app.title')}>
      {slots.map((orb, i) =>
        orb ? (
          <ElementIcon key={i} element={orb} tooltipName={elementName(locale, orb)} />
        ) : (
          <div
            key={i}
            className="h-14 w-14 rounded-full border-2 border-dashed border-white/15 bg-white/5"
            aria-label={t('orb.emptySlot')}
          />
        ),
      )}
    </div>
  )
}
