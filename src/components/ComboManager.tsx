import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import type { TargetCombo } from '../domain/types'
import { SpellIcon } from './SpellIcon'
import { ComboEditor } from './ComboEditor'
import { PlayZone } from './PlayZone'
import { OptimalPathDisplay } from './OptimalPathDisplay'
import { resolveComboName } from '../domain/resolveComboName'
import { spellName as spellNameFn } from '../domain/i18n'
import { solveCombo } from '../domain/solver'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'
import type { KeybindScheme } from '../domain/keymap'

interface Props {
  combos: TargetCombo[]
  onSave: (combo: TargetCombo) => void
  onDelete: (comboId: string) => void
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
  t: (key: string) => string
  /** 是否显示最优键序 */
  showOptimalPath: boolean
  /** 切换显示 */
  onToggleOptimalPath: () => void
  /** 是否开启技能音效 */
  soundEnabled: boolean
  /** 是否开启击杀音效 */
  killSoundEnabled: boolean
}

/** 连招列表 + 新建/编辑 + 内嵌练习(practicing) */
export function ComboManager({ combos, onSave, onDelete, scheme, iconTheme, locale, t, showOptimalPath, onToggleOptimalPath, soundEnabled, killSoundEnabled }: Props) {
  const [editing, setEditing] = useState<TargetCombo | null>(null)
  const [creating, setCreating] = useState(false)
  const [practicing, setPracticing] = useState<TargetCombo | null>(null)
  const [pendingDelete, setPendingDelete] = useState<TargetCombo | null>(null)

  // 编辑/新建优先
  if (creating || editing) {
    return (
      <ComboEditor
        initial={editing ?? undefined}
        iconTheme={iconTheme}
        locale={locale}
        t={t}
        scheme={scheme}
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

  // 内嵌练习
  if (practicing) {
    return (
      <PlayZone
        combo={practicing}
        scheme={scheme}
        iconTheme={iconTheme}
        locale={locale}
        t={t}
        onQuit={() => setPracticing(null)}
        showOptimalPath={showOptimalPath}
        onToggleOptimalPath={onToggleOptimalPath}
        soundEnabled={soundEnabled}
        killSoundEnabled={killSoundEnabled}
      />
    )
  }

  // 列表
  return (
    <div className="flex flex-col gap-4 max-w-5xl w-full px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('combo.library')}</h2>
        <button
          type="button"
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500"
          onClick={() => setCreating(true)}
        >
          {t('combo.new')}
        </button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {combos.map((c) => (
          <li
            key={c.comboId}
            className="flex flex-col gap-3 p-3 rounded bg-neutral-800 border border-white/10"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-medium break-words">{resolveComboName(c, t, locale, iconTheme)}</span>
              <span className="flex items-center gap-1 text-xs text-neutral-400 flex-wrap">
                {c.spells.map((s, i) => (
                  <SpellIcon key={i} spell={s} tooltipName={spellNameFn(locale, iconTheme, s)} size={20} theme={iconTheme} className="opacity-80" />
                ))}
                {(c.preCastSlots.d || c.preCastSlots.f) && (
                  <span className="ml-2 text-amber-400">
                    {t('combo.preCastLabel')}:
                    {/* 显示顺序 = 释放顺序:f(先释放) / d(后释放) */}
                    {[c.preCastSlots.f && spellNameFn(locale, iconTheme, c.preCastSlots.f), c.preCastSlots.d && spellNameFn(locale, iconTheme, c.preCastSlots.d)].filter(Boolean).join(' / ')}
                  </span>
                )}
              </span>
            </div>
            {showOptimalPath && (
              <ComboOptimalPath combo={c} scheme={scheme} iconTheme={iconTheme} locale={locale} />
            )}
            {/* 按钮组固定在卡片底部 */}
            <div className="flex gap-2 mt-auto">
              <button type="button" className="flex-1 px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500" onClick={() => setPracticing(c)}>
                {t('combo.practice')}
              </button>
              <button type="button" className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10" onClick={() => setEditing(c)}>
                {t('combo.edit')}
              </button>
              <button type="button" className="flex items-center justify-center px-2 py-1 text-xs rounded bg-rose-700 hover:bg-rose-600" onClick={() => setPendingDelete(c)} aria-label={t('combo.delete')}>
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
        {combos.length === 0 && <li className="text-neutral-500 text-sm">{t('combo.empty')}</li>}
      </ul>

      {/* 删除确认弹窗 */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPendingDelete(null)}>
          <div
            className="max-w-xs p-4 rounded-lg bg-neutral-900 border border-white/15 shadow-xl flex flex-col gap-3 text-sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={t('combo.deleteConfirm')}
          >
            <p className="text-neutral-200">{t('combo.deleteConfirm')}</p>
            <p className="text-neutral-400 text-xs break-words">{resolveComboName(pendingDelete, t, locale, iconTheme)}</p>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-3 py-1 text-xs rounded border border-white/20 hover:bg-white/10" onClick={() => setPendingDelete(null)}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded bg-rose-700 hover:bg-rose-600"
                onClick={() => {
                  onDelete(pendingDelete.comboId)
                  setPendingDelete(null)
                }}
              >
                {t('combo.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 列表卡片里的最优键序行:memo 化避免每次父组件渲染都重算 BFS */
function ComboOptimalPath({
  combo,
  scheme,
  iconTheme,
  locale,
}: {
  combo: TargetCombo
  scheme: KeybindScheme
  iconTheme: IconTheme
  locale: Locale
}) {
  const solution = useMemo(
    () => (combo.spells.length > 0 ? solveCombo(combo, scheme) : null),
    [combo, scheme],
  )
  if (!solution || solution.steps.length === 0) return null
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
      <span className="text-[10px] text-neutral-500 shrink-0">{locale === 'zh' ? `${solution.orbSwitches} 切` : `${solution.orbSwitches} sw`}</span>
      <OptimalPathDisplay steps={solution.steps} iconTheme={iconTheme} locale={locale} startingOrbs={solution.startingOrbs} />
    </div>
  )
}
