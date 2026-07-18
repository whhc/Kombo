import { useEffect, useState } from 'react'
import type { TargetCombo } from '../domain/types'
import { listCombos, saveCombo, deleteCombo, localStorageBackend } from '../domain/comboStore'
import { PRESET_COMBOS } from '../domain/presets'

/** 连招集合 = 预设 + 用户自建(都从 localStorage 读;预设首次写入) */
export function useCombos() {
  const [combos, setCombos] = useState<TargetCombo[]>(() => seedAndGet())

  useEffect(() => {
    // 确保预设存在(首次加载时写入)
    const list = seedAndGet()
    setCombos(list)
  }, [])

  const addOrUpdate = (combo: TargetCombo) => {
    saveCombo(localStorageBackend, combo)
    setCombos(listCombos(localStorageBackend))
  }

  const remove = (comboId: string) => {
    deleteCombo(localStorageBackend, comboId)
    setCombos(listCombos(localStorageBackend))
  }

  return { combos, addOrUpdate, remove }
}

/** 确保所有预设已在存储中,然后返回当前全部连招 */
function seedAndGet(): TargetCombo[] {
  const existing = listCombos(localStorageBackend)
  const existingIds = new Set(existing.map((c) => c.comboId))
  const missing = PRESET_COMBOS.filter((p) => !existingIds.has(p.comboId))
  if (missing.length > 0) {
    for (const p of missing) saveCombo(localStorageBackend, p)
    return listCombos(localStorageBackend)
  }
  return existing
}
