import { describe, it, expect } from 'vitest'
import { SPELL_RECIPE } from '../domain/spellBook'
import { ALL_SPELLS } from '../domain/spellNames'
import {
  SPELL_SOUND,
  INVOKE_SOUND,
  streakToTier,
  preloadSounds,
  playSpellSound,
  playInvokeSound,
  playKillSound,
} from './soundManager'

describe('soundManager — 映射完整性', () => {
  it('SPELL_SOUND 覆盖全部 10 技能(与 SPELL_RECIPE 同 key 集)', () => {
    expect(Object.keys(SPELL_SOUND).sort()).toEqual(Object.keys(SPELL_RECIPE).sort())
  })

  it('每个技能都有非空音频路径', () => {
    for (const spell of ALL_SPELLS) {
      expect(SPELL_SOUND[spell]).toBeTruthy()
      expect(SPELL_SOUND[spell]).toMatch(/^sounds\/dota2\/.+\.mp3$/)
    }
  })

  it('INVOKE_SOUND 是合成音路径', () => {
    expect(INVOKE_SOUND).toBe('sounds/dota2/Invoke.mp3')
  })
})

describe('soundManager — streakToTier 连杀等级映射', () => {
  it('0 及以下返回 null(未达成)', () => {
    expect(streakToTier(0)).toBeNull()
    expect(streakToTier(-1)).toBeNull()
  })

  it('1=First Blood, 2=Double, 3=Triple, 4=Ultra', () => {
    expect(streakToTier(1)).toBe('FirstBlood')
    expect(streakToTier(2)).toBe('DoubleKill')
    expect(streakToTier(3)).toBe('TripleKill')
    expect(streakToTier(4)).toBe('UltraKill')
  })

  it('5 及以上均为 Rampage(暴走)', () => {
    expect(streakToTier(5)).toBe('Rampage')
    expect(streakToTier(10)).toBe('Rampage')
    expect(streakToTier(99)).toBe('Rampage')
  })

  it('KILL_SOUND 当前音频文件尚未就位(playKillSound 不应抛错)', () => {
    // 资产缺失时 no-op;此用例验证连杀骨架可安全调用
    expect(() => playKillSound(3, false)).not.toThrow()
  })
})

describe('soundManager — enabled 短路与副作用隔离', () => {
  it('enabled=false 时播放 API 不抛错(jsdom 无 Audio 也应静默)', () => {
    expect(() => playSpellSound('Tornado', false)).not.toThrow()
    expect(() => playInvokeSound(false)).not.toThrow()
    expect(() => playKillSound(2, false)).not.toThrow()
  })

  it('preloadSounds 在无 Audio 环境下静默(jsdom)', () => {
    expect(() => preloadSounds()).not.toThrow()
  })
})
