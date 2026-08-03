import { addDays, formatDate, isOverdue, isToday, toDateValue } from '../src/utils/date'

describe('date utilities', () => {
  it('formats date input values', () => {
    expect(toDateValue(new Date(2026, 7, 3, 9, 5))).toBe('2026-08-03')
    expect(formatDate('2026-08-03')).toBe('2026年8月3日')
  })

  it('detects today and overdue values', () => {
    const now = new Date(2026, 7, 3, 12, 0)
    expect(isToday('2026-08-03 08:00', now)).toBe(true)
    expect(isOverdue('2026-08-03 08:00', now)).toBe(true)
    expect(isOverdue('2026-08-03 18:00', now)).toBe(false)
  })

  it('adds calendar days', () => {
    expect(toDateValue(addDays(new Date(2026, 7, 3), 7))).toBe('2026-08-10')
  })
})
