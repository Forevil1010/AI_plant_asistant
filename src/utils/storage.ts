import Taro from '@tarojs/taro'

const storage = {
  get: <T = unknown>(key: string): T | null => {
    try {
      const value = Taro.getStorageSync(key)
      if (value === undefined || value === null || value === '') return null
      if (typeof value === 'string') return JSON.parse(value) as T
      return value as T
    } catch {
      return null
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      Taro.setStorageSync(key, value)
    } catch {}
  },

  remove: (key: string): void => {
    try {
      Taro.removeStorageSync(key)
    } catch {}
  },

  clear: (): void => {
    try {
      Taro.clearStorageSync()
    } catch {}
  }
}

export default storage
