export type CareType = 'water' | 'fertilize' | 'prune' | 'repot' | 'medicine' | 'observe'
export type TaskStatus = 'pending' | 'done' | 'skipped'
export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly'

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
  imagePath: string
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
  imagePath: string
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
  imagePath: string
  result: PlantKnowledge
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
  imagePath?: string
  description: string
  result: DiagnosisResult
  createdAt: string
  plantId?: string
}

export interface AppStats {
  plants: number
  records: number
  tasksPending: number
  identifications: number
  diagnoses: number
}
