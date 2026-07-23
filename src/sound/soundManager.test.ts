import { describe, it, expect } from 'vitest'
import { SPELL_RECIPE } from '../domain/spellBook'
import { ALL_SPELLS } from '../domain/spellNames'
import { streakToTier, multiToTier } from '../domain/killTier'
import {
  SPELL_SOUND,
  INVOKE_SOUND,
  STREAK_SOUND,
  MULTI_KILL_SOUND,
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

  it('STREAK_SOUND 8 个连杀等级都有非空路径', () => {
    expect(Object.keys(STREAK_SOUND)).toHaveLength(8)
    for (const path of Object.values(STREAK_SOUND)) {
      expect(path).toMatch(/^sounds\/dota2\/.+\.mp3$/)
    }
  })

  it('MULTI_KILL_SOUND 5 个多杀等级都有非空路径', () => {
    expect(Object.keys(MULTI_KILL_SOUND)).toHaveLength(5)
    for (const path of Object.values(MULTI_KILL_SOUND)) {
      expect(path).toMatch(/^sounds\/dota2\/.+\.mp3$/)
    }
  })
})

describe('killTier — 等级映射', () => {
  it('streakToTier:<3 不播,3+ 递增,10+ 为 BeyondGodlike', () => {
    expect(streakToTier(2)).toBeNull()
    expect(streakToTier(3)).toBe('KillingSpree')
    expect(streakToTier(9)).toBe('Godlike')
    expect(streakToTier(10)).toBe('BeyondGodlike')
    expect(streakToTier(99)).toBe('BeyondGodlike')
  })

  it('multiToTier:1=FirstBlood ... 5+=Rampage', () => {
    expect(multiToTier(0)).toBeNull()
    expect(multiToTier(1)).toBe('FirstBlood')
    expect(multiToTier(2)).toBe('DoubleKill')
    expect(multiToTier(5)).toBe('Rampage')
    expect(multiToTier(99)).toBe('Rampage')
  })
})

describe('soundManager — enabled 短路与副作用隔离', () => {
  it('enabled=false 时播放 API 不抛错(jsdom 无 Audio 也应静默)', () => {
    expect(() => playSpellSound('Tornado', false)).not.toThrow()
    expect(() => playInvokeSound(false)).not.toThrow()
    expect(() => playKillSound({ streak: 'Godlike', multi: 'Rampage' }, false)).not.toThrow()
  })

  it('preloadSounds 在无 Audio 环境下静默(jsdom)', () => {
    expect(() => preloadSounds()).not.toThrow()
  })
})


