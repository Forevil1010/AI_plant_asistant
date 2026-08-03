import Taro from '@tarojs/taro'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  timeout?: number
}

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

const request = async <T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { url, method = 'GET', data, header = {}, timeout = 30000 } = options

  const token = Taro.getStorageSync('token')
  const defaultHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof token === 'string' && token ? { Authorization: `Bearer ${token}` } : {}),
    ...header
  }

  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: defaultHeader,
      timeout
    })

    const { statusCode, data: resData } = response

    if (statusCode === 200) {
      if (resData.code === 1002) {
        Taro.removeStorageSync('token')
        throw new Error('未登录')
      }
      return resData
    } else {
      throw new Error(`HTTP Error: ${statusCode}`)
    }
  } catch (error) {
    Taro.showToast({
      title: '网络请求失败',
      icon: 'error'
    })
    throw error
  }
}

const get = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request({ url, method: 'GET', data })
}

const post = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request({ url, method: 'POST', data })
}

const put = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request({ url, method: 'PUT', data })
}

const del = <T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> => {
  return request({ url, method: 'DELETE', data })
}

export { request, get, post, put, del, ApiResponse }
export default request
