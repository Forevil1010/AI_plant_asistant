import Taro from '@tarojs/taro'
import { DiagnosisResult, PlantKnowledge } from '../types'
import { identifyPlant as mockIdentify, diagnosePlant as mockDiagnose } from './mock-ai'
import { fileToBase64 } from '../utils/image'

const BASE_URL =
  (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ||
  'http://localhost:3000/api'

const USE_MOCK =
  typeof process !== 'undefined' && process.env && process.env.USE_MOCK === 'true'

function isH5(): boolean {
  if (typeof process !== 'undefined' && process.env && process.env.TARO_ENV) {
    return process.env.TARO_ENV === 'h5'
  }
  return typeof window !== 'undefined'
}

async function request<T>(url: string, data: Record<string, unknown>): Promise<T> {
  const response = await Taro.request<{ code: number; message: string; data: T }>({
    url: `${BASE_URL}${url}`,
    method: 'POST',
    data,
    header: { 'Content-Type': 'application/json' },
    timeout: 30000
  })

  if (response.statusCode !== 200) {
    throw new Error(`HTTP ${response.statusCode}`)
  }

  if (response.data.code !== 0) {
    throw new Error(response.data.message || '请求失败')
  }

  return response.data.data
}

export interface IdentifyResponse {
  result: PlantKnowledge
  candidates: PlantKnowledge[]
  isFallback?: boolean
  isMock?: boolean
}

export async function identifyPlant(imagePath: string): Promise<IdentifyResponse> {
  if (USE_MOCK) {
    const result = await mockIdentify(imagePath)
    return { result, candidates: [] }
  }

  try {
    const imageBase64 = await fileToBase64(imagePath)
    const result = await request<IdentifyResponse>(
      '/plant/identify',
      { image: imageBase64 }
    )

    if (!result.result) {
      throw new Error('未识别到植物')
    }

    if (result.isFallback) {
      Taro.showToast({ title: 'AI 服务暂不可用，展示模拟结果', icon: 'none' })
    }

    return result
  } catch (error) {
    console.warn('AI 识别失败，降级为模拟识别:', error)
    Taro.showToast({ title: '连接失败，展示模拟结果', icon: 'none' })
    const result = await mockIdentify(imagePath)
    return { result, candidates: [] }
  }
}

export async function diagnosePlant(
  description: string,
  hasImage: boolean,
  imagePath?: string
): Promise<DiagnosisResult> {
  if (USE_MOCK) {
    return mockDiagnose(description, hasImage)
  }

  try {
    const data: Record<string, unknown> = { description }

    if (imagePath) {
      data.image = await fileToBase64(imagePath)
    }

    const result = await request<{ result: DiagnosisResult; isMock?: boolean; isTextOnly?: boolean; isFallback?: boolean }>(
      '/diagnose/detect',
      data
    )

    if (result.isFallback) {
      Taro.showToast({ title: 'AI 服务暂不可用，展示模拟结果', icon: 'none' })
    }

    return result.result
  } catch (error) {
    console.warn('AI 诊断失败，降级为模拟诊断:', error)
    Taro.showToast({ title: '连接失败，展示模拟结果', icon: 'none' })
    return mockDiagnose(description, hasImage)
  }
}
