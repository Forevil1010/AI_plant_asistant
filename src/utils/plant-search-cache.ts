import Taro from '@tarojs/taro'
import { PlantKnowledge } from '../types'

const STORAGE_KEY = 'ai-plant-search-result'

export function savePlantSearchResult(plant: PlantKnowledge): void {
  Taro.setStorageSync(STORAGE_KEY, plant)
}

export function readPlantSearchResult(id: string): PlantKnowledge | undefined {
  const value = Taro.getStorageSync<PlantKnowledge | undefined>(STORAGE_KEY)
  return value && value.id === id ? value : undefined
}
