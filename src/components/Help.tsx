import { SPELL_RECIPE } from '../domain/spellBook'
import { spellName as spellNameFn, elementName } from '../domain/i18n'
import { SpellIcon } from './SpellIcon'
import { ElementIcon } from './ElementIcon'
import type { SpellName, Element } from '../domain/types'
import type { Locale, IconTheme } from '../domain/i18n'

interface Props {
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/** 帮助页:使用方法 + 复盘指标说明 */
export function Help({ iconTheme, locale, t }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl text-sm leading-relaxed">
      {/* 关于 */}
      <Section title={t('help.about.title')}>
        <p>{t('help.about.body')}</p>
      </Section>

      {/* 概览 */}
      <Section title={t('help.overview.title')}>
        <p>{t('help.overview.body')}</p>
        <div className="grid grid-cols-3 gap-3 my-2">
          {(['Q', 'W', 'E'] as Element[]).map((el) => (
            <div key={el} className="flex items-center gap-2 p-2 rounded bg-neutral-800 border border-white/10">
              <ElementIcon element={el} tooltipName={elementName(locale, el)} size={32} theme={iconTheme} />
              <div className="flex flex-col">
                <span className="text-neutral-400 text-xs">{elementName(locale, el)}</span>
                <kbd className="text-xs text-amber-300">{el}</kbd>
              </div>
            </div>
          ))}
        </div>
        <p className="text-neutral-400 text-xs">{t('help.overview.fifo')}</p>
      </Section>

      {/* 十技能表 */}
      <Section title={t('help.spells.title')}>
        <p>{t('help.spells.body')}</p>
        <div className="grid grid-cols-2 gap-2 my-2">
          {(Object.keys(SPELL_RECIPE) as SpellName[]).map((spell) => (
            <div key={spell} className="flex items-center gap-2 p-2 rounded bg-neutral-800 border border-white/10">
              <SpellIcon spell={spell} tooltipName={spellNameFn(locale, iconTheme, spell)} size={28} theme={iconTheme} />
              <span className="text-neutral-200">{spellNameFn(locale, iconTheme, spell)}</span>
              <span className="ml-auto flex gap-0.5">
                {SPELL_RECIPE[spell].map((el, i) => (
                  <kbd key={i} className="text-[10px] px-1 rounded bg-neutral-700 text-neutral-300">{el}</kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 练习用法 */}
      <Section title={t('help.practice.title')}>
        <ul className="list-disc list-inside space-y-1 text-neutral-300">
          <li>{t('help.practice.keys')}</li>
          <li>{t('help.practice.freePlay')}</li>
          <li>{t('help.practice.recipe')}</li>
          <li>{t('help.practice.comboFlow')}</li>
          <li>{t('help.practice.finished')}</li>
          <li>{t('help.practice.space')}</li>
          <li>{t('help.practice.preCast')}</li>
          <li>{t('help.practice.sound')}</li>
        </ul>
      </Section>

      {/* 连招库 */}
      <Section title={t('help.combo.title')}>
        <ul className="list-disc list-inside space-y-1 text-neutral-300">
          <li>{t('help.combo.create')}</li>
          <li>{t('help.combo.preCastOrder')}</li>
          <li>{t('help.combo.optimalPath')}</li>
          <li>{t('help.combo.toggle')}</li>
        </ul>
      </Section>

      {/* 复盘指标 */}
      <Section title={t('help.metrics.title')}>
        <p>{t('help.metrics.intro')}</p>
        <div className="flex flex-col gap-3 my-2">
          <MetricCard
            color="text-amber-300"
            name={t('metrics.orbRatio')}
            desc={t('help.metrics.orbRatio')}
            locale={locale}
          />
          <MetricCard
            color="text-emerald-300"
            name={t('metrics.keyRatio')}
            desc={t('help.metrics.keyRatio')}
            locale={locale}
          />
          <MetricCard
            color="text-sky-300"
            name={t('metrics.durationScore')}
            desc={t('help.metrics.durationScore')}
            locale={locale}
          />
          <MetricCard
            color="text-fuchsia-300"
            name={t('dashboard.successRate')}
            desc={t('help.metrics.successRate')}
            locale={locale}
          />
        </div>
        <p className="text-neutral-400 text-xs">{t('help.metrics.failedNote')}</p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1 p-4 rounded bg-neutral-900/60 border border-white/10">
      <h2 className="text-base font-semibold text-neutral-100 mb-1">{title}</h2>
      {children}
    </section>
  )
}

function MetricCard({
  color,
  name,
  desc,
  locale,
}: {
  color: string
  name: string
  desc: string
  locale: Locale
}) {
  void locale
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded bg-neutral-800 border border-white/10">
      <span className={`font-semibold ${color}`}>{name}</span>
      <span className="text-neutral-400 text-xs">{desc}</span>
    </div>
  )
}
