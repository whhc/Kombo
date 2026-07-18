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

/** 将预设按 comboId 强制写入存储(覆盖旧名),然后返回全部连招 */
function seedAndGet(): TargetCombo[] {
  for (const p of PRESET_COMBOS) saveCombo(localStorageBackend, p)
  return listCombos(localStorageBackend)
}
