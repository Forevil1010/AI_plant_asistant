import { AppState, reducer } from '../src/store'
import { CareTask, GardenPlant, IdentifyHistory } from '../src/types'

jest.mock('@tarojs/taro', () => ({
  __esModule: true,
  default: {
    getStorageSync: jest.fn(),
    setStorageSync: jest.fn(),
    removeStorageSync: jest.fn()
  }
}))

const task: CareTask = {
  id: 'task-1',
  plantId: 'plant-1',
  type: 'water',
  dueAt: '2026-08-03T08:00:00.000Z',
  repeat: 'none',
  note: '',
  status: 'pending',
  createdAt: '2026-08-01T08:00:00.000Z'
}

const plant: GardenPlant = {
  id: 'plant-1',
  name: '龟背竹',
  nickname: '小龟',
  imageUrl: '',
  location: '客厅',
  acquiredAt: '2026-07-01',
  note: '',
  createdAt: '2026-08-01T08:00:00.000Z'
}

const state: AppState = {
  gardenPlants: [plant],
  careRecords: [],
  careTasks: [task],
  identifyHistory: [],
  diagnosisHistory: []
}

describe('care task snoozing', () => {
  it('moves a pending task by the requested number of days', () => {
    const next = reducer(state, { type: 'SNOOZE_TASK', id: task.id, days: 3 })

    expect(next.careTasks[0].dueAt).toBe('2026-08-06T08:00:00.000Z')
    expect(state.careTasks[0].dueAt).toBe('2026-08-03T08:00:00.000Z')
  })

  it('does not move a completed task', () => {
    const completedState = {
      ...state,
      careTasks: [{ ...task, status: 'done' as const }]
    }

    expect(reducer(completedState, { type: 'SNOOZE_TASK', id: task.id, days: 7 })).toBe(completedState)
  })
})

describe('care task repeat rules', () => {
  const baseTask = (repeat: CareTask['repeat']): CareTask => ({ ...task, repeat })

  it('creates the next occurrence when finishing a daily task', () => {
    const dailyState = { ...state, careTasks: [baseTask('daily')] }
    const next = reducer(dailyState, { type: 'FINISH_TASK', id: task.id, status: 'done' })

    expect(next.careTasks).toHaveLength(2)
    expect(next.careTasks[0].status).toBe('done')
    expect(next.careTasks[1].status).toBe('pending')
    expect(next.careTasks[1].dueAt).toBe('2026-08-04T08:00:00.000Z')
  })

  it('creates the next occurrence when finishing a weekly task', () => {
    const weeklyState = { ...state, careTasks: [baseTask('weekly')] }
    const next = reducer(weeklyState, { type: 'FINISH_TASK', id: task.id, status: 'done' })

    expect(next.careTasks[1].dueAt).toBe('2026-08-10T08:00:00.000Z')
  })

  it('creates the next occurrence when finishing a monthly task', () => {
    const monthlyState = { ...state, careTasks: [baseTask('monthly')] }
    const next = reducer(monthlyState, { type: 'FINISH_TASK', id: task.id, status: 'done' })

    expect(next.careTasks[1].dueAt).toBe('2026-09-03T08:00:00.000Z')
  })

  it('does not create a next occurrence when finishing a non-repeating task', () => {
    const next = reducer(state, { type: 'FINISH_TASK', id: task.id, status: 'done' })

    expect(next.careTasks).toHaveLength(1)
    expect(next.careTasks[0].status).toBe('done')
  })

  it('writes a care record only when the task is marked done', () => {
    const next = reducer(state, { type: 'FINISH_TASK', id: task.id, status: 'skipped' })

    expect(next.careRecords).toHaveLength(0)
  })
})

describe('cascade deletion', () => {
  it('removes the plant together with its care records and tasks', () => {
    const fullState: AppState = {
      ...state,
      careRecords: [
        { id: 'record-1', plantId: 'plant-1', type: 'water', note: '', createdAt: '2026-08-02T08:00:00.000Z' },
        { id: 'record-2', plantId: 'plant-2', type: 'fertilize', note: '', createdAt: '2026-08-02T09:00:00.000Z' }
      ],
      careTasks: [
        task,
        { ...task, id: 'task-2', plantId: 'plant-2' }
      ]
    }

    const next = reducer(fullState, { type: 'REMOVE_PLANT', id: 'plant-1' })

    expect(next.gardenPlants).toHaveLength(0)
    expect(next.careRecords).toHaveLength(1)
    expect(next.careRecords[0].id).toBe('record-2')
    expect(next.careTasks).toHaveLength(1)
    expect(next.careTasks[0].id).toBe('task-2')
  })
})

describe('plant save and update', () => {
  it('adds a new plant at the head of the list', () => {
    const newPlant: GardenPlant = { ...plant, id: 'plant-2', name: '橡皮树' }
    const next = reducer(state, { type: 'SAVE_PLANT', plant: newPlant })

    expect(next.gardenPlants).toHaveLength(2)
    expect(next.gardenPlants[0].id).toBe('plant-2')
  })

  it('updates an existing plant in place', () => {
    const updated: GardenPlant = { ...plant, nickname: '大龟' }
    const next = reducer(state, { type: 'SAVE_PLANT', plant: updated })

    expect(next.gardenPlants).toHaveLength(1)
    expect(next.gardenPlants[0].nickname).toBe('大龟')
  })
})

describe('identify history update', () => {
  it('updates the result of an existing identify history entry', () => {
    const entry: IdentifyHistory = {
      id: 'id-1',
      imageUrl: '',
      result: { ...plant, confidence: 0.6 },
      source: 'mock',
      createdAt: '2026-08-01T08:00:00.000Z'
    }
    const historyState: AppState = { ...state, identifyHistory: [entry] }
    const newResult = { ...plant, confidence: 0.95, name: '新名称' }

    const next = reducer(historyState, { type: 'UPDATE_IDENTIFY_HISTORY', id: 'id-1', result: newResult })

    expect(next.identifyHistory[0].result.name).toBe('新名称')
  })
})
