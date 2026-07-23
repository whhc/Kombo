import { useState, useEffect } from 'react'
import { PlayZone } from './components/PlayZone'
import { ComboManager } from './components/ComboManager'
import { Dashboard } from './components/Dashboard'
import { Help } from './components/Help'
import { HeroIcon } from './components/HeroIcon'
import { SettingsPanel } from './components/SettingsPanel'
import { useSettings } from './hooks/useSettings'
import { useCombos } from './hooks/useCombos'
import { useSessions } from './hooks/useSessions'
import { useLocale } from './hooks/useLocale'
import { preloadSounds } from './sound/soundManager'
import { Settings, Volume2, VolumeX } from 'lucide-react'

type View = 'practice' | 'combos' | 'dashboard' | 'help'

function App() {
  const { settings, setSettings, scheme } = useSettings()
  const { combos, addOrUpdate, remove } = useCombos()
  const { sessions, refresh } = useSessions()
  const { locale, toggle, t } = useLocale()
  const [view, setView] = useState<View>('practice')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 挂载时预加载全部音效(浏览器提前解码,避免首次播放延迟)
  useEffect(() => preloadSounds(), [])

  return (
    <div className="h-full w-full bg-neutral-950 text-neutral-100 flex flex-col">
      {/* ── 顶栏 ── */}
      <header className="relative flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        {/* 左:logo + 标题 + 导航 */}
        <div className="flex items-center gap-4">
          <HeroIcon
            theme={settings.iconTheme}
            locale={locale}
            size={32}
            onClick={() => {
              const nextTheme = settings.iconTheme === 'DOTA1' ? 'DOTA2' : 'DOTA1'
              setSettings({
                ...settings,
                iconTheme: nextTheme,
                keybindScheme: nextTheme === 'DOTA1' ? 'LEGACY' : settings.keybindScheme,
              })
            }}
          />
          <h1 className="text-base font-bold hidden sm:block">{t('app.title')}</h1>
          <nav className="flex gap-1 text-sm" aria-label={t('nav.aria')}>
            {([
              ['practice', t('nav.practice')],
              ['combos', t('nav.combos')],
              ['dashboard', t('nav.dashboard')],
              ['help', t('nav.help')],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`px-3 py-1 rounded transition-colors ${
                  view === key
                    ? 'bg-white/15 text-white'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/5'
                }`}
                onClick={() => {
                  if (key === 'dashboard') refresh()
                  setView(key)
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* 右:音效快捷 + 齿轮 */}
        <div className="flex items-center gap-1">
          {/* 音效快捷切换(保持 settings.soundOff/soundOn aria-label,供测试与无障碍) */}
          <button
            type="button"
            className="p-1.5 rounded hover:bg-white/10"
            onClick={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            aria-label={settings.soundEnabled ? t('settings.soundOff') : t('settings.soundOn')}
          >
            {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-white/10"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={t('settings.title')}
            aria-expanded={settingsOpen}
          >
            <Settings size={16} />
          </button>
        </div>

        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          setSettings={setSettings}
          locale={locale}
          toggleLocale={toggle}
          t={t}
        />
      </header>

      {/* ── 主内容区 ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-center w-full py-6">
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
        </div>
      </main>
    </div>
  )
}

export default App
