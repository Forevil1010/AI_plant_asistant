import {
  AppStats,
  CareRecord,
  CareTask,
  DiagnosisHistory,
  GardenPlant,
  IdentifyHistory
} from '../types'

const KEYS = {
  version: 'plant-assistant:version',
  plants: 'plant-assistant:plants',
  records: 'plant-assistant:records',
  tasks: 'plant-assistant:tasks',
  identifications: 'plant-assistant:identifications',
  diagnoses: 'plant-assistant:diagnoses'
} as const

const STORAGE_VERSION = 1

function readList<T>(key: string): T[] {
  const value = wx.getStorageSync(key)
  return Array.isArray(value) ? value : []
}
function writeList<T>(key: string, value: T[]): void {
  wx.setStorageSync(key, value)
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function initializeStorage(): void {
  const version = wx.getStorageSync(KEYS.version)
  if (version === STORAGE_VERSION) return

  Object.values(KEYS).forEach((key) => {
    if (key !== KEYS.version && !Array.isArray(wx.getStorageSync(key))) {
      wx.setStorageSync(key, [])
    }
  })
  wx.setStorageSync(KEYS.version, STORAGE_VERSION)
}

export function getPlants(): GardenPlant[] {
  return readList<GardenPlant>(KEYS.plants).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getPlant(id: string): GardenPlant | undefined {
  return getPlants().find((plant) => plant.id === id)
}

export function savePlant(plant: GardenPlant): void {
  const plants = getPlants()
  const index = plants.findIndex((item) => item.id === plant.id)
  if (index >= 0) plants[index] = plant
  else plants.unshift(plant)
  writeList(KEYS.plants, plants)
}

export function deletePlant(id: string): void {
  writeList(KEYS.plants, getPlants().filter((plant) => plant.id !== id))
  writeList(KEYS.records, getRecords().filter((record) => record.plantId !== id))
  writeList(KEYS.tasks, getTasks().filter((task) => task.plantId !== id))
}

export function getRecords(plantId?: string): CareRecord[] {
  const records = readList<CareRecord>(KEYS.records)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return plantId ? records.filter((record) => record.plantId === plantId) : records
}

export function addRecord(record: CareRecord): void {
  writeList(KEYS.records, [record, ...getRecords()])
}

export function deleteRecord(id: string): void {
  writeList(KEYS.records, getRecords().filter((record) => record.id !== id))
}

export function getTasks(plantId?: string): CareTask[] {
  const tasks = readList<CareTask>(KEYS.tasks)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  return plantId ? tasks.filter((task) => task.plantId === plantId) : tasks
}

export function saveTask(task: CareTask): void {
  const tasks = getTasks()
  const index = tasks.findIndex((item) => item.id === task.id)
  if (index >= 0) tasks[index] = task
  else tasks.push(task)
  writeList(KEYS.tasks, tasks)
}

export function deleteTask(id: string): void {
  writeList(KEYS.tasks, getTasks().filter((task) => task.id !== id))
}

export function addIdentifyHistory(history: IdentifyHistory): void {
  writeList(KEYS.identifications, [history, ...getIdentifyHistory()].slice(0, 50))
}

export function getIdentifyHistory(): IdentifyHistory[] {
  return readList<IdentifyHistory>(KEYS.identifications)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function deleteIdentifyHistory(id: string): void {
  writeList(KEYS.identifications, getIdentifyHistory().filter((item) => item.id !== id))
}

export function addDiagnosisHistory(history: DiagnosisHistory): void {
  writeList(KEYS.diagnoses, [history, ...getDiagnosisHistory()].slice(0, 50))
}

export function getDiagnosisHistory(): DiagnosisHistory[] {
  return readList<DiagnosisHistory>(KEYS.diagnoses)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function deleteDiagnosisHistory(id: string): void {
  writeList(KEYS.diagnoses, getDiagnosisHistory().filter((item) => item.id !== id))
}

export function getStats(): AppStats {
  return {
    plants: getPlants().length,
    records: getRecords().length,
    tasksPending: getTasks().filter((task) => task.status === 'pending').length,
    identifications: getIdentifyHistory().length,
    diagnoses: getDiagnosisHistory().length
  }
}

export function clearAllData(): void {
  writeList(KEYS.plants, [])
  writeList(KEYS.records, [])
  writeList(KEYS.tasks, [])
  writeList(KEYS.identifications, [])
  writeList(KEYS.diagnoses, [])
}
