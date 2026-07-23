import { SPELL_RECIPE } from '../domain/spellBook'
import { ALL_SPELLS } from '../domain/spellNames'
import { SpellIcon } from './SpellIcon'
import { ElementIcon } from './ElementIcon'
import { spellName as spellNameFn, elementName } from '../domain/i18n'
import type { Locale, IconTheme } from '../domain/i18n'
import type { Element } from '../domain/types'

interface Props {
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 元素排序权重:Q < W < E(配方按此顺序展示,如陨石显示 WEE 而非 EEW) */
const ELEMENT_ORDER: Record<Element, number> = { Q: 0, W: 1, E: 2 }

/**
 * 技能配方参考面板:10 个技能 + 各自的 3 元素配方(用元素图标)。
 * 供自由练习时参考,帮助不熟悉技能的用户。配方顺序遵循 Q→W→E 排列
 * (不追求最优键序,纯按元素字母序),技能按主元素 Q→W→E 分组排列。
 */
export function RecipePanel({ theme, locale, t }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-2 w-full max-w-2xl p-3 rounded bg-neutral-900/60 border border-white/10"
      role="group"
      aria-label={t('recipe.title')}
    >
      {ALL_SPELLS.map((spell) => {
        // 配方元素按 Q→W→E 排序后展示
        const sortedRecipe = [...SPELL_RECIPE[spell]].sort((a, b) => ELEMENT_ORDER[a] - ELEMENT_ORDER[b])
        return (
          <div key={spell} className="flex items-center gap-2 p-1.5 rounded bg-neutral-800/60 border border-white/5">
            <SpellIcon spell={spell} tooltipName={spellNameFn(locale, theme, spell)} size={24} theme={theme} />
            <span className="text-xs text-neutral-300">{spellNameFn(locale, theme, spell)}</span>
            <span className="ml-auto flex gap-1 items-center">
              {sortedRecipe.map((el, i) => (
                <ElementIcon key={i} element={el} tooltipName={elementName(locale, el)} size={18} theme={theme} />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

