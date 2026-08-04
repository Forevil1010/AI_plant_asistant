import { AppState, reducer } from '../src/store'
import { CareTask } from '../src/types'

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

const state: AppState = {
  gardenPlants: [],
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
