const pad = (value: number): string => String(value).padStart(2, '0')

export function toDateInputValue(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
export function toDateTimeInputValue(date = new Date()): string {
  return `${toDateInputValue(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDateTime(value: string): string {
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDate(value: string): string {
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function isToday(value: string, now = new Date()): boolean {
  const date = new Date(value.replace(' ', 'T'))
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isOverdue(value: string, now = new Date()): boolean {
  const date = new Date(value.replace(' ', 'T'))
  return date.getTime() < now.getTime()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
