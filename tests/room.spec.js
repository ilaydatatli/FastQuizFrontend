import { describe, expect, it } from 'vitest'
import { cleanRoomCode, hoursLeft, isRoomCode, roomUrl } from '../src/composables/room.js'

describe('room helpers', () => {
  it('cleans what people type or paste', () => {
    expect(cleanRoomCode(' kedi 42 ')).toBe('KEDI42')
    expect(cleanRoomCode('ked-i42')).toBe('KEDI42')
    expect(cleanRoomCode(undefined)).toBe('')
  })

  it('accepts only 6 letters and numbers', () => {
    expect(isRoomCode('KEDI42')).toBe(true)
    expect(isRoomCode('KEDI4')).toBe(false)
    expect(isRoomCode('KEDİ42')).toBe(false)
  })

  it('counts whole hours left and null when closed', () => {
    const now = Date.parse('2026-11-23T12:00:00Z')
    expect(hoursLeft('2026-11-24T12:00:00Z', now)).toBe(24)
    expect(hoursLeft('2026-11-24T11:59:00Z', now)).toBe(24)
    expect(hoursLeft('2026-11-23T13:01:00Z', now)).toBe(1)
    expect(hoursLeft('2026-11-23T12:59:00Z', now)).toBe(0)
    expect(hoursLeft('2026-11-23T11:59:00Z', now)).toBeNull()
  })

  it('builds the share link', () => {
    expect(roomUrl('KEDI42', 'https://example.com')).toBe('https://example.com/room/KEDI42')
  })
})
