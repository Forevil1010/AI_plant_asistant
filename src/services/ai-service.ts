import Taro from '@tarojs/taro'
import { AiResultSource, DiagnosisResult, PlantKnowledge } from '../types'
import { plantKnowledge, searchPlantKnowledge } from '../data/plants'
import { identifyPlant as mockIdentify, diagnosePlant as mockDiagnose } from './mock-ai'
import { fileToBase64 } from '../utils/image'

const BASE_URL = __API_BASE_URL__.replace(/\/$/, '')
const USE_MOCK = __USE_MOCK__ || !BASE_URL

async function request<T>(url: string, data: Record<string, unknown>): Promise<T> {
  if (!BASE_URL) {
    throw new Error('未配置 AI 服务地址')
  }

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
  source: AiResultSource
}

export interface DiagnosisResponse {
  result: DiagnosisResult
  source: AiResultSource
}

export interface PlantSearchResponse {
  results: PlantKnowledge[]
  source: AiResultSource
}

function getResultSource(result: { isMock?: boolean; isFallback?: boolean }): AiResultSource {
  if (result.isFallback) return 'fallback'
  if (result.isMock) return 'mock'
  return 'ai'
}

function attachKnownPlantImage(result: PlantKnowledge): PlantKnowledge {
  if (result.imageUrl) return result
  const resultNames = [result.name, result.latinName, ...result.aliases]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  const knownPlant = plantKnowledge.find((plant) =>
    [plant.name, plant.latinName, ...plant.aliases]
      .some((value) => resultNames.includes(value.trim().toLowerCase()))
  )
  return knownPlant ? { ...result, imageUrl: knownPlant.imageUrl } : result
}

export async function searchPlantByText(query: string): Promise<PlantSearchResponse> {
  const localResults = () => searchPlantKnowledge(query)

  if (USE_MOCK) {
    return { results: localResults(), source: 'mock' }
  }

  try {
    const result = await request<{
      results: PlantKnowledge[]
      isMock?: boolean
      isFallback?: boolean
    }>('/plant/search', { query })

    return {
      results: (result.results || []).map(attachKnownPlantImage),
      source: getResultSource(result)
    }
  } catch {
    Taro.showToast({ title: 'AI 搜索连接失败，显示本地结果', icon: 'none' })
    return { results: localResults(), source: 'fallback' }
  }
}

export async function identifyPlant(imagePath: string): Promise<IdentifyResponse> {
  if (USE_MOCK) {
    const { result, candidates } = await mockIdentify(imagePath)
    return { result, candidates, isMock: true, source: 'mock' }
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

    const attachSourceImage = (plant: PlantKnowledge): PlantKnowledge => ({
      ...plant,
      imageUrl: plant.imageUrl || imagePath
    })
    return {
      ...result,
      result: attachSourceImage(result.result),
      candidates: (result.candidates || []).map(attachSourceImage),
      source: getResultSource(result)
    }
  } catch (error) {
    Taro.showToast({ title: '连接失败，展示模拟结果', icon: 'none' })
    const { result, candidates } = await mockIdentify(imagePath)
    return { result, candidates, isFallback: true, source: 'fallback' }
  }
}

export async function diagnosePlant(
  description: string,
  hasImage: boolean,
  imagePath?: string
): Promise<DiagnosisResponse> {
  if (USE_MOCK) {
    return { result: await mockDiagnose(description, hasImage), source: 'mock' }
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

    return { result: result.result, source: getResultSource(result) }
  } catch (error) {
    Taro.showToast({ title: '连接失败，展示模拟结果', icon: 'none' })
    return { result: await mockDiagnose(description, hasImage), source: 'fallback' }
  }
}
