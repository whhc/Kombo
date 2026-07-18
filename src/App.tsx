import { useState } from 'react'
import { PlayZone } from './components/PlayZone'
import { ComboManager } from './components/ComboManager'
import { useSettings } from './hooks/useSettings'
import { useCombos } from './hooks/useCombos'
import type { TargetCombo } from './domain/types'

type View = 'practice' | 'combos'

function App() {
  const { settings, setSettings, scheme } = useSettings()
  const { combos, addOrUpdate, remove } = useCombos()
  const [view, setView] = useState<View>('practice')
  const [activeCombo, setActiveCombo] = useState<TargetCombo | null>(null)

  return (
    <div className="h-full w-full bg-neutral-950 text-neutral-100 flex flex-col items-center gap-6 py-8">
      <header className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-bold">Kombo — 卡尔连招模拟器</h1>
        <nav className="flex gap-2 text-sm">
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'practice' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setView('practice')}
          >
            练习
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'combos' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setView('combos')}
          >
            连招库
          </button>
        </nav>
      </header>

      {view === 'practice' && <PlayZone activeComboName={activeCombo?.name} scheme={scheme} />}

      {view === 'combos' && (
        <ComboManager
          combos={combos}
          onSave={addOrUpdate}
          onDelete={remove}
          onSelect={(c) => {
            setActiveCombo(c)
            setView('practice')
          }}
        />
      )}

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
