import { useEffect, useRef } from 'react'
import { Volume2, VolumeX, Keyboard, Languages } from 'lucide-react'
import type { UserSettings } from '../domain/settings'
import type { Locale } from '../domain/i18n'

interface Props {
  open: boolean
  onClose: () => void
  settings: UserSettings
  setSettings: (next: UserSettings | ((prev: UserSettings) => UserSettings)) => void
  locale: Locale
  toggleLocale: () => void
  t: (key: string) => string
}

/**
 * 设置弹层(Popover):键位 / 语言 / 音效。
 * 由顶栏齿轮按钮触发;点击面板外部或 Esc 关闭。
 */
export function SettingsPanel({ open, onClose, settings, setSettings, locale, toggleLocale, t }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // 点击外部或 Esc 关闭
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-4 top-14 z-50 w-56 p-3 rounded-lg bg-neutral-900 border border-white/15 shadow-xl shadow-black/40 flex flex-col gap-3 text-sm"
      role="dialog"
      aria-label={t('settings.title')}
    >
      {/* 键位 */}
      <Row icon={<Keyboard size={14} />} label={t('settings.keybind')}>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-white/20 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={settings.iconTheme === 'DOTA1'}
          onClick={() =>
            setSettings((prev) => ({
              ...prev,
              keybindScheme: prev.keybindScheme === 'LEGACY' ? 'DOTA2' : 'LEGACY',
            }))
          }
        >
          {settings.keybindScheme}
          {settings.iconTheme === 'DOTA1' && ` ${t('settings.keybind.lockedLegacy')}`}
        </button>
      </Row>

      {/* 语言 */}
      <Row icon={<Languages size={14} />} label={t('settings.language')}>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-white/20 hover:bg-white/10"
          onClick={toggleLocale}
          aria-label={t('settings.language')}
        >
          {locale === 'zh' ? '中 / EN' : 'EN / 中'}
        </button>
      </Row>

      {/* 技能音效(切球/合成/释放) */}
      <Row icon={settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} label={t('settings.sound')}>
        <button
          type="button"
          className={`px-2 py-0.5 text-xs rounded border ${settings.soundEnabled ? 'border-sky-500/50 text-sky-300 bg-sky-900/20' : 'border-white/20 hover:bg-white/10'}`}
          onClick={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          aria-label={settings.soundEnabled ? t('settings.soundOff') : t('settings.soundOn')}
        >
          {settings.soundEnabled ? 'ON' : 'OFF'}
        </button>
      </Row>

      {/* 击杀音效(First Blood/连杀广播) */}
      <Row icon={settings.killSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} label={t('settings.killSound')}>
        <button
          type="button"
          className={`px-2 py-0.5 text-xs rounded border ${settings.killSoundEnabled ? 'border-sky-500/50 text-sky-300 bg-sky-900/20' : 'border-white/20 hover:bg-white/10'}`}
          onClick={() => setSettings((prev) => ({ ...prev, killSoundEnabled: !prev.killSoundEnabled }))}
          aria-label={settings.killSoundEnabled ? t('settings.soundOff') : t('settings.soundOn')}
        >
          {settings.killSoundEnabled ? 'ON' : 'OFF'}
        </button>
      </Row>
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-neutral-300">
        {icon}
        {label}
      </span>
      {children}
    </div>
  )
}
