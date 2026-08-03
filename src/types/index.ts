export interface User {
  id: string
  openId: string
  nickname: string
  avatarUrl: string
  plantCount: number
  identifyCount: number
  diagnoseCount: number
  createTime: string
}

export interface CareTips {
  water: string
  light: string
  temperature: string
  fertilizer: string
}

export interface Plant {
  id: string
  name: string
  englishName: string
  family: string
  genus: string
  origin: string
  description: string
  careTips: CareTips
  features: string[]
  imageUrl: string
  viewCount: number
}

export interface GardenPlant {
  id: string
  userId: string
  plantId: string
  name: string
  englishName: string
  imageUrl: string
  position: string
  waterInterval: number
  healthStatus: 'healthy' | 'warning' | 'diseased' | 'unknown'
  addTime: string
  lastWaterTime: string
  nextWaterTime: string
}

export interface CareRecord {
  id: string
  plantId: string
  plantName: string
  taskType: 'water' | 'fertilize' | 'prune' | 'spray' | 'other'
  taskName: string
  status: 'pending' | 'completed' | 'overdue'
  deadline: string
  completeAt?: string
}

export interface IdentifyResult {
  name: string
  englishName: string
  family: string
  genus: string
  confidence: number
  description: string
  careTips: CareTips
  imageUrl: string
}

export interface DiagnoseResult {
  diseaseName: string
  diseaseType: string
  confidence: number
  symptoms: string
  cause: string
  treatment: string[]
  preventive: string[]
}

export interface Article {
  id: string
  title: string
  content: string
  summary: string
  category: 'care' | 'pest' | 'design' | 'knowledge'
  imageUrl: string
  viewCount: number
  publishTime: string
}

export interface DailyTip {
  id: string
  title: string
  content: string
  imageUrl: string
  date: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Pagination<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}