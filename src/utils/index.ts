import Taro from '@tarojs/taro'

export const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): ((...args: Args) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number
): ((...args: Args) => void) => {
  let inThrottle = false
  return (...args: Args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const getDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

export const getDaysLater = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export const getBase64FromImage = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    Taro.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (res) => resolve(`data:image/jpeg;base64,${res.data}`),
      fail: reject
    })
  })
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
