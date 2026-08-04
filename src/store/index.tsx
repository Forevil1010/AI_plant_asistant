import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import Taro from '@tarojs/taro'
import {
  CareRecord,
  CareTask,
  DiagnosisHistory,
  GardenPlant,
  IdentifyHistory,
  TaskStatus
} from '../types'

export interface AppState {
  gardenPlants: GardenPlant[]
  careRecords: CareRecord[]
  careTasks: CareTask[]
  identifyHistory: IdentifyHistory[]
  diagnosisHistory: DiagnosisHistory[]
}

const STORAGE_KEYS: Record<keyof AppState, string> = {
  gardenPlants: 'plant-assistant:garden-plants',
  careRecords: 'plant-assistant:care-records',
  careTasks: 'plant-assistant:care-tasks',
  identifyHistory: 'plant-assistant:identify-history',
  diagnosisHistory: 'plant-assistant:diagnosis-history'
}

function readList<T>(key: string): T[] {
  try {
    const value = Taro.getStorageSync(key)
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value) {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // Corrupt local cache should not prevent the app from opening.
  }
  return []
}

function createInitialState(): AppState {
  return {
    gardenPlants: readList<GardenPlant>(STORAGE_KEYS.gardenPlants),
    careRecords: readList<CareRecord>(STORAGE_KEYS.careRecords),
    careTasks: readList<CareTask>(STORAGE_KEYS.careTasks),
    identifyHistory: readList<IdentifyHistory>(STORAGE_KEYS.identifyHistory),
    diagnosisHistory: readList<DiagnosisHistory>(STORAGE_KEYS.diagnosisHistory)
  }
}

function persist<K extends keyof AppState>(key: K, value: AppState[K]): void {
  Taro.setStorageSync(STORAGE_KEYS[key], value)
}

type Action =
  | { type: 'SAVE_PLANT'; plant: GardenPlant }
  | { type: 'REMOVE_PLANT'; id: string }
  | { type: 'ADD_RECORD'; record: CareRecord }
  | { type: 'REMOVE_RECORD'; id: string }
  | { type: 'SAVE_TASK'; task: CareTask }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'FINISH_TASK'; id: string; status: Extract<TaskStatus, 'done' | 'skipped'> }
  | { type: 'SNOOZE_TASK'; id: string; days?: number }
  | { type: 'ADD_IDENTIFY_HISTORY'; item: IdentifyHistory }
  | { type: 'REMOVE_IDENTIFY_HISTORY'; id: string }
  | { type: 'ADD_DIAGNOSIS_HISTORY'; item: DiagnosisHistory }
  | { type: 'REMOVE_DIAGNOSIS_HISTORY'; id: string }
  | { type: 'CLEAR_ALL' }

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getNextDueAt(task: CareTask): string | undefined {
  if (task.repeat === 'none') return undefined
  const next = new Date(task.dueAt)
  if (Number.isNaN(next.getTime())) return undefined
  if (task.repeat === 'daily') next.setDate(next.getDate() + 1)
  if (task.repeat === 'weekly') next.setDate(next.getDate() + 7)
  if (task.repeat === 'monthly') next.setMonth(next.getMonth() + 1)
  return next.toISOString()
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SAVE_PLANT': {
      const exists = state.gardenPlants.some((plant) => plant.id === action.plant.id)
      const gardenPlants = exists
        ? state.gardenPlants.map((plant) => plant.id === action.plant.id ? action.plant : plant)
        : [action.plant, ...state.gardenPlants]
      persist('gardenPlants', gardenPlants)
      return { ...state, gardenPlants }
    }
    case 'REMOVE_PLANT': {
      const gardenPlants = state.gardenPlants.filter((plant) => plant.id !== action.id)
      const careRecords = state.careRecords.filter((record) => record.plantId !== action.id)
      const careTasks = state.careTasks.filter((task) => task.plantId !== action.id)
      persist('gardenPlants', gardenPlants)
      persist('careRecords', careRecords)
      persist('careTasks', careTasks)
      return { ...state, gardenPlants, careRecords, careTasks }
    }
    case 'ADD_RECORD': {
      const careRecords = [action.record, ...state.careRecords]
      persist('careRecords', careRecords)
      return { ...state, careRecords }
    }
    case 'REMOVE_RECORD': {
      const careRecords = state.careRecords.filter((record) => record.id !== action.id)
      persist('careRecords', careRecords)
      return { ...state, careRecords }
    }
    case 'SAVE_TASK': {
      const exists = state.careTasks.some((task) => task.id === action.task.id)
      const careTasks = exists
        ? state.careTasks.map((task) => task.id === action.task.id ? action.task : task)
        : [...state.careTasks, action.task]
      persist('careTasks', careTasks)
      return { ...state, careTasks }
    }
    case 'REMOVE_TASK': {
      const careTasks = state.careTasks.filter((task) => task.id !== action.id)
      persist('careTasks', careTasks)
      return { ...state, careTasks }
    }
    case 'FINISH_TASK': {
      const task = state.careTasks.find((item) => item.id === action.id)
      if (!task || task.status !== 'pending') return state
      const completedAt = new Date().toISOString()
      let careTasks = state.careTasks.map((item) => item.id === task.id
        ? { ...item, status: action.status, completedAt }
        : item)
      const nextDueAt = getNextDueAt(task)
      if (nextDueAt) {
        careTasks = [...careTasks, {
          ...task,
          id: createId('task'),
          dueAt: nextDueAt,
          status: 'pending',
          createdAt: completedAt,
          completedAt: undefined
        }]
      }
      let careRecords = state.careRecords
      if (action.status === 'done') {
        careRecords = [{
          id: createId('record'),
          plantId: task.plantId,
          type: task.type,
          note: task.note || '由养护任务完成',
          createdAt: completedAt
        }, ...careRecords]
        persist('careRecords', careRecords)
      }
      persist('careTasks', careTasks)
      return { ...state, careTasks, careRecords }
    }
    case 'SNOOZE_TASK': {
      const task = state.careTasks.find((item) => item.id === action.id)
      if (!task || task.status !== 'pending') return state
      const days = action.days ?? 1
      const newDueAt = new Date(task.dueAt)
      if (Number.isNaN(newDueAt.getTime())) return state
      newDueAt.setDate(newDueAt.getDate() + days)
      const careTasks = state.careTasks.map((item) =>
        item.id === task.id ? { ...item, dueAt: newDueAt.toISOString() } : item
      )
      persist('careTasks', careTasks)
      return { ...state, careTasks }
    }
    case 'ADD_IDENTIFY_HISTORY': {
      const identifyHistory = [action.item, ...state.identifyHistory].slice(0, 50)
      persist('identifyHistory', identifyHistory)
      return { ...state, identifyHistory }
    }
    case 'REMOVE_IDENTIFY_HISTORY': {
      const identifyHistory = state.identifyHistory.filter((item) => item.id !== action.id)
      persist('identifyHistory', identifyHistory)
      return { ...state, identifyHistory }
    }
    case 'ADD_DIAGNOSIS_HISTORY': {
      const diagnosisHistory = [action.item, ...state.diagnosisHistory].slice(0, 50)
      persist('diagnosisHistory', diagnosisHistory)
      return { ...state, diagnosisHistory }
    }
    case 'REMOVE_DIAGNOSIS_HISTORY': {
      const diagnosisHistory = state.diagnosisHistory.filter((item) => item.id !== action.id)
      persist('diagnosisHistory', diagnosisHistory)
      return { ...state, diagnosisHistory }
    }
    case 'CLEAR_ALL': {
      Object.values(STORAGE_KEYS).forEach((key) => Taro.removeStorageSync(key))
      return createInitialState()
    }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  savePlant: (plant: GardenPlant) => void
  removePlant: (id: string) => void
  addCareRecord: (record: CareRecord) => void
  removeCareRecord: (id: string) => void
  saveCareTask: (task: CareTask) => void
  removeCareTask: (id: string) => void
  finishCareTask: (id: string, status: Extract<TaskStatus, 'done' | 'skipped'>) => void
  snoozeCareTask: (id: string, days?: number) => void
  addIdentifyHistory: (item: IdentifyHistory) => void
  removeIdentifyHistory: (id: string) => void
  addDiagnosisHistory: (item: DiagnosisHistory) => void
  removeDiagnosisHistory: (id: string) => void
  clearAllData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const savePlant = useCallback((plant: GardenPlant) => dispatch({ type: 'SAVE_PLANT', plant }), [])
  const removePlant = useCallback((id: string) => dispatch({ type: 'REMOVE_PLANT', id }), [])
  const addCareRecord = useCallback((record: CareRecord) => dispatch({ type: 'ADD_RECORD', record }), [])
  const removeCareRecord = useCallback((id: string) => dispatch({ type: 'REMOVE_RECORD', id }), [])
  const saveCareTask = useCallback((task: CareTask) => dispatch({ type: 'SAVE_TASK', task }), [])
  const removeCareTask = useCallback((id: string) => dispatch({ type: 'REMOVE_TASK', id }), [])
  const finishCareTask = useCallback((id: string, status: Extract<TaskStatus, 'done' | 'skipped'>) => dispatch({ type: 'FINISH_TASK', id, status }), [])
  const snoozeCareTask = useCallback((id: string, days?: number) => dispatch({ type: 'SNOOZE_TASK', id, days }), [])
  const addIdentifyHistory = useCallback((item: IdentifyHistory) => dispatch({ type: 'ADD_IDENTIFY_HISTORY', item }), [])
  const removeIdentifyHistory = useCallback((id: string) => dispatch({ type: 'REMOVE_IDENTIFY_HISTORY', id }), [])
  const addDiagnosisHistory = useCallback((item: DiagnosisHistory) => dispatch({ type: 'ADD_DIAGNOSIS_HISTORY', item }), [])
  const removeDiagnosisHistory = useCallback((id: string) => dispatch({ type: 'REMOVE_DIAGNOSIS_HISTORY', id }), [])
  const clearAllData = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])

  const value = useMemo(() => ({
    state,
    savePlant,
    removePlant,
    addCareRecord,
    removeCareRecord,
    saveCareTask,
    removeCareTask,
    finishCareTask,
    snoozeCareTask,
    addIdentifyHistory,
    removeIdentifyHistory,
    addDiagnosisHistory,
    removeDiagnosisHistory,
    clearAllData
  }), [
    state,
    savePlant,
    removePlant,
    addCareRecord,
    removeCareRecord,
    saveCareTask,
    removeCareTask,
    finishCareTask,
    snoozeCareTask,
    addIdentifyHistory,
    removeIdentifyHistory,
    addDiagnosisHistory,
    removeDiagnosisHistory,
    clearAllData
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
