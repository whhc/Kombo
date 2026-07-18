import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, effectiveScheme, type UserSettings } from '../domain/settings'

const STORAGE_KEY = 'kombo.settings'

function load(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>
      return {
        iconTheme: parsed.iconTheme === 'DOTA1' ? 'DOTA1' : 'DOTA2',
        keybindScheme: parsed.keybindScheme === 'LEGACY' ? 'LEGACY' : 'DOTA2',
      }
    }
  } catch {
    // 忽略损坏数据,回退默认
  }
  return DEFAULT_SETTINGS
}

/** UserSettings 状态 + 持久化到 localStorage */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // 忽略写入失败(隐私模式等)
    }
  }, [settings])

  return { settings, setSettings, scheme: effectiveScheme(settings) }
}
