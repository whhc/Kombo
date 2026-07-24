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
import { useUpdater } from './hooks/useUpdater'
import { initStoreBackend } from './domain/storeBackend'
import { Settings, Download } from 'lucide-react'

type View = 'practice' | 'combos' | 'dashboard' | 'help'

function App() {
  const { settings, setSettings, scheme } = useSettings()
  const { combos, addOrUpdate, remove } = useCombos()
  const { sessions, refresh } = useSessions()
  const { locale, toggle, t } = useLocale()
  const { update, installing, applyUpdate, dismiss } = useUpdater()
  const [view, setView] = useState<View>('practice')
  const [settingsOpen, setSettingsOpen] = useState(false)
  // 非 Tauri 环境(测试/纯前端 dev)无需等待 store 初始化,getSync 已降级 localStorage
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  const [storeReady, setStoreReady] = useState(!isTauri)

  // 启动时:初始化存储后端(加载 tauri-plugin-store 到内存缓存)+ 预加载音效
  useEffect(() => {
    if (isTauri) {
      let cancelled = false
      initStoreBackend().finally(() => {
        if (!cancelled) setStoreReady(true)
      })
      return () => { cancelled = true }
    }
    preloadSounds()
  }, [isTauri])

  // Tauri 环境下 store 未就绪时显示 loading(避免空数据闪烁)
  if (!storeReady) {
    return (
      <div className="h-full w-full bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <span className="text-neutral-500 text-sm">Kombo</span>
      </div>
    )
  }

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
          />
          <h1 className="text-base font-bold hidden sm:block">Kombo</h1>
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

        {/* 右:设置齿轮(技能/击杀音效在设置面板内切换) */}
        <div className="flex items-center gap-1">
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
            <PlayZone combo={null} scheme={scheme} iconTheme={settings.iconTheme} locale={locale} t={t} soundEnabled={settings.soundEnabled} killSoundEnabled={settings.killSoundEnabled} />
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
              killSoundEnabled={settings.killSoundEnabled}
            />
          )}

          {view === 'dashboard' && <Dashboard sessions={sessions} combos={combos} iconTheme={settings.iconTheme} locale={locale} t={t} />}

          {view === 'help' && <Help iconTheme={settings.iconTheme} locale={locale} t={t} />}
        </div>
      </main>

      {/* 更新提示浮层(有新版本时显示) */}
      {update && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs p-3 rounded-lg bg-neutral-900 border border-sky-500/40 shadow-xl shadow-black/40 flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-sky-300">
            <Download size={14} />
            <span className="font-medium">{t('updater.available')}: v{update.version}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50"
              onClick={applyUpdate}
              disabled={installing}
            >
              {installing ? t('updater.installing') : t('updater.install')}
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs rounded border border-white/20 hover:bg-white/10"
              onClick={dismiss}
            >
              {t('updater.later')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
