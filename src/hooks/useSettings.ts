import { useState, useCallback } from 'react'
import { DEFAULT_SETTINGS, effectiveScheme, type UserSettings } from '../domain/settings'
import { getSync, setSync } from '../domain/storeBackend'

const STORAGE_KEY = 'kombo.settings'

function load(): UserSettings {
  try {
    const raw = getSync(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserSettings>
      return {
        iconTheme: parsed.iconTheme === 'DOTA1' ? 'DOTA1' : 'DOTA2',
        keybindScheme: parsed.keybindScheme === 'LEGACY' ? 'LEGACY' : 'DOTA2',
        showOptimalPath: parsed.showOptimalPath !== false, // 默认 true,仅显式 false 才关
        soundEnabled: parsed.soundEnabled !== false, // 默认 true,仅显式 false 才关
        killSoundEnabled: parsed.killSoundEnabled !== false, // 默认 true(旧记录无此字段时也开)
      }
    }
  } catch {
    // 忽略
  }
  return DEFAULT_SETTINGS
}

/** 同步写入 StoreBackend(内存 + 异步落盘) */
function save(s: UserSettings): void {
  try {
    setSync(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // 忽略
  }
}

/**
 * UserSettings 状态 + 同步持久化到 localStorage。
 * 设置变更时立即写入,下次打开无需重新设置。
 */
export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(load)

  const setSettings = useCallback((next: UserSettings | ((prev: UserSettings) => UserSettings)) => {
    setSettingsState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      save(resolved) // 同步落盘,不依赖 effect
      return resolved
    })
  }, [])

  return { settings, setSettings, scheme: effectiveScheme(settings) }
}
