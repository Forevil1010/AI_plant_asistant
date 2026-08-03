import { Taro } from '@tarojs/taro'

const storage = {
  get: <T = any>(key: string): T | null => {
    try {
      const value = Taro.getStorageSync(key)
      if (value) {
        return JSON.parse(value)
      }
      return null
    } catch {
      return null
    }
  },

  set: <T = any>(key: string, value: T): void => {
    try {
      Taro.setStorageSync(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  remove: (key: string): void => {
    try {
      Taro.removeStorageSync(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },

  clear: (): void => {
    try {
      Taro.clearStorageSync()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }
}

export default storage