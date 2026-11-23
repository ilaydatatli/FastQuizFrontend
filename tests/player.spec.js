import { describe, expect, it } from 'vitest'
import { motivationLines } from '../src/composables/motivation.js'
import { cleanNickname } from '../src/composables/usePlayer.js'

describe('cleanNickname (same rule as the server)', () => {
  it('accepts letters (Turkish too), digits, space, _ and -, trimmed', () => {
    expect(cleanNickname('  Layla  ')).toBe('Layla')
    expect(cleanNickname('Yavuz Oğlan')).toBe('Yavuz Oğlan')
    expect(cleanNickname('ilayda_99')).toBe('ilayda_99')
    expect(cleanNickname('neon-fox')).toBe('neon-fox')
    expect(cleanNickname('Işık')).toBe('Işık')
  })

  it('rejects too short, too long and other characters', () => {
    for (const bad of ['', 'a', 'x'.repeat(17), '<script>', 'ilayda!', null, undefined]) {
      expect(cleanNickname(bad), String(bad)).toBe(null)
    }
  })
})

const score = (extra) => ({
  rank: 3,
  points: 2000,
  best_points: 2000,
  is_new_best: true,
  points_to_top10: null,
  ...extra,
})
const keys = (s) => motivationLines(s).map((line) => line.key)

describe('motivationLines', () => {
  it('nothing before the score is saved', () => {
    expect(motivationLines(null)).toEqual([])
  })

  it('new record inside the top 10: record + rank', () => {
    expect(motivationLines(score())).toEqual([
      { key: 'result.newBest' },
      { key: 'result.rank', params: { rank: 3 } },
    ])
  })

  it('lower than the record: points needed to beat it', () => {
    const [first] = motivationLines(score({ points: 1800, best_points: 2353, is_new_best: false }))
    expect(first).toEqual({ key: 'result.beatRecord', params: { best: 2353, gap: 2353 - 1800 + 1 } })
  })

  it('outside the top 10: points needed to get in', () => {
    const lines = motivationLines(score({ rank: 14, points_to_top10: 340 }))
    expect(lines[1]).toEqual({ key: 'result.toTop10', params: { points: 340 } })
  })

  it('first place: one message, new record or holding it', () => {
    expect(keys(score({ rank: 1 }))).toEqual(['result.topNew'])
    expect(motivationLines(score({ rank: 1, points: 1500, is_new_best: false }))).toEqual([
      { key: 'result.topHold', params: { best: 2000 } },
    ])
  })
})
