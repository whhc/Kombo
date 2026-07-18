import { describe, it, expect } from 'vitest'
import { invoke } from './spellBook'

describe('spellBook — 祈唤查表', () => {
  it('QQQ → ColdSnap', () => {
    expect(invoke(['Q', 'Q', 'Q'])).toBe('ColdSnap')
  })

  it('合成判定忽略元素排列顺序(QWE = EWQ = DeafeningBlast)', () => {
    expect(invoke(['Q', 'W', 'E'])).toBe('DeafeningBlast')
    expect(invoke(['E', 'W', 'Q'])).toBe('DeafeningBlast')
    expect(invoke(['W', 'E', 'Q'])).toBe('DeafeningBlast')
  })

  it('不足 3 个元素时返回 null(无法祈唤)', () => {
    expect(invoke(['Q', 'W'])).toBeNull()
    expect(invoke([])).toBeNull()
  })
})
