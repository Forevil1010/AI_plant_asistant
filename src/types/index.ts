export type CareType = 'water' | 'fertilize' | 'prune' | 'repot' | 'medicine' | 'observe'
export type TaskStatus = 'pending' | 'done' | 'skipped'
export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly'
export type AiResultSource = 'ai' | 'mock' | 'fallback'

export interface PlantCareGuide {
  light: string
  water: string
  temperature: string
  soil: string
  fertilizer: string
}

export interface PlantKnowledge {
  id: string
  name: string
  latinName: string
  aliases: string[]
  summary: string
  imageUrl: string
  confidence: number
  tags: string[]
  care: PlantCareGuide
  safety: string
}

export interface GardenPlant {
  id: string
  knowledgeId?: string
  name: string
  nickname: string
  imageUrl: string
  location: string
  acquiredAt: string
  note: string
  createdAt: string
}

export interface CareRecord {
  id: string
  plantId: string
  type: CareType
  note: string
  createdAt: string
}

export interface CareTask {
  id: string
  plantId: string
  type: CareType
  dueAt: string
  repeat: RepeatRule
  note: string
  status: TaskStatus
  createdAt: string
  completedAt?: string
}

export interface IdentifyHistory {
  id: string
  imageUrl: string
  result: PlantKnowledge
  source?: AiResultSource
  createdAt: string
}

export interface DiagnosisResult {
  title: string
  confidenceLabel: string
  severity: '轻微' | '中等' | '严重'
  evidence: string[]
  causes: string[]
  actions: string[]
  followUp: string
  safety: string
}

export interface DiagnosisHistory {
  id: string
  imageUrl?: string
  description: string
  result: DiagnosisResult
  source?: AiResultSource
  createdAt: string
  plantId?: string
}

export interface AppStats {
  plants: number
  records: number
  pendingTasks: number
  identifications: number
  diagnoses: number
}

// Reserved API-facing types. The local MVP does not require login or a remote backend.
export interface User {
  id: string
  openId: string
  nickname: string
  avatarUrl: string
}

export interface Plant extends PlantKnowledge {
  family?: string
  genus?: string
  origin?: string
  viewCount?: number
}

export type IdentifyResult = PlantKnowledge
export type DiagnoseResult = DiagnosisResult

export interface Article {
  id: string
  title: string
  content: string
  summary: string
  category: 'care' | 'pest' | 'knowledge'
  imageUrl: string
  publishTime: string
}

export interface DailyTip {
  id: string
  title: string
  content: string
  imageUrl: string
  date: string
}

export interface ApiResponse<T = unknown> {
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
