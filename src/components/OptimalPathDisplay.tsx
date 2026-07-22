import type { SolverStep } from '../domain/solver'
import type { Element } from '../domain/types'
import { ElementIcon } from './ElementIcon'
import { SpellIcon } from './SpellIcon'
import { invokeIconUrl, type IconTheme } from '../domain/icons'
import type { Locale } from '../domain/i18n'
import { spellName as spellNameFn, elementName } from '../domain/i18n'

interface Props {
  steps: SolverStep[]
  iconTheme: IconTheme
  locale: Locale
  /** 起手保留球序(预切连招时非空);显示在路径最前作"留置状态" */
  startingOrbs?: Element[]
}

/**
 * 最优键序展示:把求解器输出的 steps 渲染成图标链。
 *
 * 分段规则:用「·」分隔相邻技能段(每个 CAST 标志一段结束)。
 * - 切球(Q/W/E):ElementIcon + 键位标注
 * - 合成(R):Invoke 图标(R 本身) + 结果技能图标(小,作合成结果提示)
 * - 释放(CAST):SpellIcon + 释放键标注
 *
 * 若有起手保留球序(预切连招),在最前以 [W,E,E] 形式展示当前头顶状态。
 */
export function OptimalPathDisplay({ steps, iconTheme, locale, startingOrbs }: Props) {
  if (steps.length === 0) return null

  // 切片:按 CAST 边界分段,段间插入分隔符
  const segments: SolverStep[][] = []
  let cur: SolverStep[] = []
  for (const s of steps) {
    cur.push(s)
    if (s.kind === 'CAST') {
      segments.push(cur)
      cur = []
    }
  }
  if (cur.length > 0) segments.push(cur)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* 起手保留球序(预切连招) */}
      {startingOrbs && startingOrbs.length > 0 && (
        <>
          <span className="flex items-center mr-1 px-1 py-0.5 rounded bg-neutral-700/40 border border-white/10" title={locale === 'zh' ? '起手保留球序' : 'Starting orbs'}>
            {startingOrbs.map((el, i) => (
              <ElementIcon key={i} element={el} tooltipName={elementName(locale, el)} size={18} theme={iconTheme} className="-ml-1 first:ml-0" />
            ))}
          </span>
          <span className="text-neutral-500 mx-0.5">→</span>
        </>
      )}
      {segments.map((seg, si) => (
        <div key={si} className="contents">
          {si > 0 && <span className="text-neutral-500 mx-1">·</span>}
          {seg.map((step, i) => (
            <StepIcon key={i} step={step} iconTheme={iconTheme} locale={locale} />
          ))}
        </div>
      ))}
    </div>
  )
}

function StepIcon({
  step,
  iconTheme,
  locale,
}: {
  step: SolverStep
  iconTheme: IconTheme
  locale: Locale
}) {
  if (step.kind === 'ORB') {
    const el = step.key as Element
    return (
      <span className="flex items-center" title={elementName(locale, el)}>
        <ElementIcon element={el} tooltipName={elementName(locale, el)} size={24} theme={iconTheme} />
        <kbd className="ml-0.5 text-[10px] text-neutral-400">{step.key}</kbd>
      </span>
    )
  }
  if (step.kind === 'INVOKE') {
    // R 键:显示 Invoke 图标(R 本身),右下角叠加合成结果技能小图标
    const resultName = spellNameFn(locale, iconTheme, step.spell)
    return (
      <span className="flex items-center mx-0.5 relative" title={`R · ${resultName}`}>
        <img
          src={invokeIconUrl(iconTheme)}
          alt="Invoke"
          title={`R · ${resultName}`}
          className="rounded object-cover border-2 border-white/30"
          style={{ width: 24, height: 24 }}
          loading="lazy"
        />
        <kbd className="ml-0.5 text-[10px] text-sky-300">R</kbd>
        <span className="ml-1 relative" title={resultName}>
          <SpellIcon spell={step.spell} tooltipName={resultName} size={18} theme={iconTheme} className="opacity-70" />
        </span>
      </span>
    )
  }
  // CAST:技能图标 + 释放键标注
  const spell = step.spell
  const name = spellNameFn(locale, iconTheme, spell)
  return (
    <span className="flex items-center mx-0.5" title={`${step.key} · ${name}`}>
      <SpellIcon spell={spell} tooltipName={`${step.key} · ${name}`} size={24} theme={iconTheme} />
      <kbd className="ml-0.5 text-[10px] text-amber-300">{step.key}</kbd>
    </span>
  )
}
