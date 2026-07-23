import { useEffect, useRef } from 'react'
import { Volume2, VolumeX, Keyboard, Languages, Palette, Lock } from 'lucide-react'
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
      {/* 图标主题(DOTA1/DOTA2):切换会联动键位(DOTA1 强制 LEGACY) */}
      <Row icon={<Palette size={14} />} label={t('settings.iconTheme')}>
        <button
          type="button"
          className="px-2 py-0.5 text-xs rounded border border-white/20 hover:bg-white/10"
          onClick={() => {
            const nextTheme = settings.iconTheme === 'DOTA1' ? 'DOTA2' : 'DOTA1'
            setSettings((prev) => ({
              ...prev,
              iconTheme: nextTheme,
              keybindScheme: nextTheme === 'DOTA1' ? 'LEGACY' : prev.keybindScheme,
            }))
          }}
          aria-label={t('settings.iconTheme')}
        >
          {settings.iconTheme}
        </button>
      </Row>

      {/* 键位 */}
      <Row icon={<Keyboard size={14} />} label={t('settings.keybind')}>
        <button
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-white/20 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          disabled={settings.iconTheme === 'DOTA1'}
          aria-label={t('settings.keybind')}
          onClick={() =>
            setSettings((prev) => ({
              ...prev,
              keybindScheme: prev.keybindScheme === 'LEGACY' ? 'DOTA2' : 'LEGACY',
            }))
          }
          title={settings.iconTheme === 'DOTA1' ? t('settings.keybind.lockedLegacy') : undefined}
        >
          {settings.keybindScheme}
          {settings.iconTheme === 'DOTA1' && <Lock size={10} />}
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
        <Toggle
          on={settings.soundEnabled}
          onClick={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          labelOn={t('settings.soundOn')}
          labelOff={t('settings.soundOff')}
        />
      </Row>

      {/* 击杀音效(First Blood/连杀广播) */}
      <Row icon={settings.killSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} label={t('settings.killSound')}>
        <Toggle
          on={settings.killSoundEnabled}
          onClick={() => setSettings((prev) => ({ ...prev, killSoundEnabled: !prev.killSoundEnabled }))}
          labelOn={t('settings.soundOn')}
          labelOff={t('settings.soundOff')}
        />
      </Row>
    </div>
  )
}

/** 滑块开关:开=天蓝右移,关=灰色左移。无文字,纯视觉状态 */
function Toggle({ on, onClick, labelOn, labelOff }: { on: boolean; onClick: () => void; labelOn: string; labelOff: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? labelOff : labelOn}
      onClick={onClick}
      className={`relative w-9 h-5 rounded-full transition-colors ${on ? 'bg-sky-600' : 'bg-neutral-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`}
      />
    </button>
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
