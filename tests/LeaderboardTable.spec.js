import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LeaderboardTable from '../src/components/LeaderboardTable.vue'

const categoryRow = { rank: 1, nickname: 'neonfox', points: 3640, correct_count: 20, language: 'tr' }
const overallRow = { rank: 1, nickname: 'neonfox', points: 5200, categories_played: 3 }

describe('LeaderboardTable', () => {
  it('shows language and correct answers on a category board', () => {
    const cells = mount(LeaderboardTable, { props: { entries: [categoryRow] } }).findAll('td')
    expect(cells.map((c) => c.text())).toEqual(['1', 'neonfox', expect.stringContaining('🇹🇷'), '20', '3640'])
  })

  it('shows "played / total" categories on the Genel board', () => {
    const wrapper = mount(LeaderboardTable, { props: { entries: [overallRow], categoryCount: 9 } })
    expect(wrapper.findAll('td').map((c) => c.text())).toEqual(['1', 'neonfox', '3/9', '5200'])
    expect(wrapper.findAll('th')).toHaveLength(4)
  })
})
