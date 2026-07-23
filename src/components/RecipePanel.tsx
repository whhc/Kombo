import { SPELL_RECIPE } from '../domain/spellBook'
import { ALL_SPELLS } from '../domain/spellNames'
import { SpellIcon } from './SpellIcon'
import { ElementIcon } from './ElementIcon'
import { spellName as spellNameFn, elementName } from '../domain/i18n'
import type { Locale, IconTheme } from '../domain/i18n'

interface Props {
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/**
 * 技能配方参考面板:10 个技能 + 各自的 3 元素配方(用元素图标)。
 * 供自由练习时参考,帮助不熟悉技能的用户。配方顺序与帮助页一致。
 */
export function RecipePanel({ theme, locale, t }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-2 w-full max-w-2xl p-3 rounded bg-neutral-900/60 border border-white/10"
      role="group"
      aria-label={t('recipe.title')}
    >
      {ALL_SPELLS.map((spell) => (
        <div key={spell} className="flex items-center gap-2 p-1.5 rounded bg-neutral-800/60 border border-white/5">
          <SpellIcon spell={spell} tooltipName={spellNameFn(locale, theme, spell)} size={24} theme={theme} />
          <span className="text-xs text-neutral-300">{spellNameFn(locale, theme, spell)}</span>
          {/* 配方:3 个元素图标(从左到右,与帮助页配方顺序一致) */}
          <span className="ml-auto flex gap-1 items-center">
            {SPELL_RECIPE[spell].map((el, i) => (
              <ElementIcon key={i} element={el} tooltipName={elementName(locale, el)} size={18} theme={theme} />
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
