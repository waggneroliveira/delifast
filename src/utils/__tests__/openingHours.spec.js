import { describe, expect, it } from 'vitest'
import { groupOpeningHours, isStoreOpenAt } from '../openingHours'

const weeklySchedule = [
  { day_of_week: 1, open_time: '14:00', close_time: '18:00', is_closed: false },
  { day_of_week: 2, open_time: '14:00', close_time: '18:00', is_closed: false },
  { day_of_week: 3, open_time: '14:00', close_time: '18:00', is_closed: false },
  { day_of_week: 4, open_time: '14:00', close_time: '18:00', is_closed: false },
  { day_of_week: 5, open_time: '14:00', close_time: '18:00', is_closed: false },
  { day_of_week: 6, open_time: null, close_time: null, is_closed: true },
  { day_of_week: 7, open_time: null, close_time: null, is_closed: true },
]

describe('opening hours', () => {
  it('omits closed days and groups consecutive days with the same schedule', () => {
    expect(groupOpeningHours(weeklySchedule)).toEqual([
      {
        key: '14:00-18:00',
        daysLabel: 'Seg à Sex',
        hoursLabel: '14:00 às 18:00',
      },
    ])
  })

  it('formats separate consecutive ranges without using an all-days label', () => {
    const schedule = [1, 2, 4, 5, 6, 7].map((dayOfWeek) => ({
      day_of_week: dayOfWeek,
      open_time: '10:00',
      close_time: '20:00',
      is_closed: false,
    }))

    expect(groupOpeningHours(schedule)[0].daysLabel).toBe('Seg à Ter e Qui à Dom')
  })

  it('returns no groups when every day is closed', () => {
    expect(groupOpeningHours(weeklySchedule.map((schedule) => ({
      ...schedule,
      is_closed: true,
    })))).toEqual([])
  })

  it('updates open status at the opening and closing times', () => {
    expect(isStoreOpenAt(weeklySchedule, new Date(2026, 10, 16, 13, 59))).toBe(false)
    expect(isStoreOpenAt(weeklySchedule, new Date(2026, 10, 16, 14, 0))).toBe(true)
    expect(isStoreOpenAt(weeklySchedule, new Date(2026, 10, 16, 18, 0))).toBe(false)
  })

  it('keeps an overnight schedule open after midnight', () => {
    const schedule = [
      { day_of_week: 1, open_time: '22:00', close_time: '02:00', is_closed: false },
      { day_of_week: 2, open_time: null, close_time: null, is_closed: true },
    ]

    expect(isStoreOpenAt(schedule, new Date(2026, 10, 17, 1, 0))).toBe(true)
    expect(isStoreOpenAt(schedule, new Date(2026, 10, 17, 2, 0))).toBe(false)
  })
})
