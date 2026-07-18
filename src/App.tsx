import { useEffect, useState } from 'react'
import { OrbDisplay } from './components/OrbDisplay'
import { SlotDisplay } from './components/SlotDisplay'
import { handleInvokerKey, type InvokerState } from './domain/invokerEngine'
import type { SpellName } from './domain/types'
import { useSettings } from './hooks/useSettings'

const INITIAL: InvokerState = { orbs: [], slots: [null, null] }

function App() {
  const { settings, setSettings, scheme } = useSettings()
  const [state, setState] = useState<InvokerState>(INITIAL)
  const [lastTs, setLastTs] = useState(0)
  const [lastCast, setLastCast] = useState<{ type: 'CAST' | 'MISS_CAST'; spell: SpellName | null } | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = performance.now()
      const result = handleInvokerKey(state, key, now, lastTs, scheme)
      if (result.action) {
        setState(result.state)
        setLastTs(now)
        if (result.action.actionType === 'CAST' || result.action.actionType === 'MISS_CAST') {
          setLastCast({ type: result.action.actionType, spell: result.action.spellName ?? null })
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state, lastTs, scheme])

  return (
    <div className="h-full w-full bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center gap-8">
      <h1 className="text-2xl font-bold">Kombo — 卡尔连招模拟器</h1>
      <p className="text-neutral-400 text-sm">Q / W / E 切球 · R 祈唤 · 释放键释放</p>

      <OrbDisplay orbs={state.orbs} />
      <SlotDisplay slots={state.slots} />

      <div className="text-sm h-6">
        {lastCast && (
          <span className={lastCast.type === 'CAST' ? 'text-emerald-400' : 'text-rose-400'}>
            {lastCast.type === 'CAST' ? '释放' : '空放'}
            {lastCast.spell ? `: ${lastCast.spell}` : ''}
          </span>
        )}
      </div>

      <SettingsBar settings={settings} setSettings={setSettings} />
    </div>
  )
}

function SettingsBar({
  settings,
  setSettings,
}: {
  settings: ReturnType<typeof useSettings>['settings']
  setSettings: ReturnType<typeof useSettings>['setSettings']
}) {
  return (
    <div className="flex gap-2 items-center text-xs">
      <button
        type="button"
        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
        onClick={() => setSettings({ ...settings, iconTheme: settings.iconTheme === 'DOTA1' ? 'DOTA2' : 'DOTA1' })}
      >
        图标: {settings.iconTheme}
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10 disabled:opacity-40"
        // DOTA1 图标下键位方案强制 LEGACY,不允许切;只在 DOTA2 图标下可切
        disabled={settings.iconTheme === 'DOTA1'}
        onClick={() =>
          setSettings({
            ...settings,
            keybindScheme: settings.keybindScheme === 'LEGACY' ? 'DOTA2' : 'LEGACY',
          })
        }
        aria-label={`键位: ${settings.keybindScheme}`}
      >
        键位: {settings.keybindScheme}
        {settings.iconTheme === 'DOTA1' && ' (锁定 LEGACY)'}
      </button>
    </div>
  )
}

export default App
