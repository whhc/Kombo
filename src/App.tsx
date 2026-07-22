import { useState, useEffect } from 'react'
import { PlayZone } from './components/PlayZone'
import { ComboManager } from './components/ComboManager'
import { Dashboard } from './components/Dashboard'
import { Help } from './components/Help'
import { HeroIcon } from './components/HeroIcon'
import { useSettings } from './hooks/useSettings'
import { useCombos } from './hooks/useCombos'
import { useSessions } from './hooks/useSessions'
import { useLocale } from './hooks/useLocale'
import { preloadSounds } from './sound/soundManager'
import { Volume2, VolumeX } from 'lucide-react'
import type { Locale } from './domain/i18n'

type View = 'practice' | 'combos' | 'dashboard' | 'help'

function App() {
  const { settings, setSettings, scheme } = useSettings()
  const { combos, addOrUpdate, remove } = useCombos()
  const { sessions, refresh } = useSessions()
  const { locale, toggle, t } = useLocale()
  const [view, setView] = useState<View>('practice')

  // 挂载时预加载全部音效(浏览器提前解码,避免首次播放延迟)
  useEffect(() => preloadSounds(), [])

  return (
    <div className="h-full w-full bg-neutral-950 text-neutral-100 flex flex-col items-center gap-6 py-8">
      <header className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <HeroIcon
            theme={settings.iconTheme}
            locale={locale}
            size={48}
            onClick={() => {
              const nextTheme = settings.iconTheme === 'DOTA1' ? 'DOTA2' : 'DOTA1'
              setSettings({
                ...settings,
                iconTheme: nextTheme,
                keybindScheme: nextTheme === 'DOTA1' ? 'LEGACY' : settings.keybindScheme,
              })
            }}
          />
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
        </div>
        <nav className="flex gap-2 text-sm">
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'practice' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setView('practice')}
          >
            {t('nav.practice')}
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'combos' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setView('combos')}
          >
            {t('nav.combos')}
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'dashboard' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => {
              refresh()
              setView('dashboard')
            }}
          >
            {t('nav.dashboard')}
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded border ${view === 'help' ? 'bg-white/15 border-white/30' : 'border-white/15 hover:bg-white/5'}`}
            onClick={() => setView('help')}
          >
            {t('nav.help')}
          </button>
        </nav>
      </header>

      {view === 'practice' && (
        <PlayZone combo={null} scheme={scheme} iconTheme={settings.iconTheme} locale={locale} t={t} soundEnabled={settings.soundEnabled} />
      )}

      {view === 'combos' && (
        <ComboManager
          combos={combos}
          onSave={addOrUpdate}
          onDelete={remove}
          scheme={scheme}
          iconTheme={settings.iconTheme}
          locale={locale}
          t={t}
          showOptimalPath={settings.showOptimalPath}
          onToggleOptimalPath={() =>
            setSettings((prev) => ({ ...prev, showOptimalPath: !prev.showOptimalPath }))
          }
          soundEnabled={settings.soundEnabled}
        />
      )}

      {view === 'dashboard' && <Dashboard sessions={sessions} combos={combos} iconTheme={settings.iconTheme} locale={locale} t={t} />}

      {view === 'help' && <Help iconTheme={settings.iconTheme} locale={locale} t={t} />}

      <SettingsBar settings={settings} setSettings={setSettings} locale={locale} toggleLocale={toggle} t={t} />
    </div>
  )
}

function SettingsBar({
  settings,
  setSettings,
  locale,
  toggleLocale,
  t,
}: {
  settings: ReturnType<typeof useSettings>['settings']
  setSettings: ReturnType<typeof useSettings>['setSettings']
  locale: Locale
  toggleLocale: () => void
  t: (key: string) => string
}) {
  return (
    <div className="flex gap-2 items-center text-xs">
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
        aria-label={`${t('settings.keybind')}: ${settings.keybindScheme}`}
      >
        {t('settings.keybind')}: {settings.keybindScheme}
        {settings.iconTheme === 'DOTA1' && ` ${t('settings.keybind.lockedLegacy')}`}
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
        onClick={toggleLocale}
        aria-label={t('settings.language')}
      >
        {locale === 'zh' ? '中 / EN' : 'EN / 中'}
      </button>
      <button
        type="button"
        className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
        onClick={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        aria-label={settings.soundEnabled ? t('settings.soundOff') : t('settings.soundOn')}
      >
        {settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
    </div>
  )
}

export default App
