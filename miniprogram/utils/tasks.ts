import { CareTask, TaskStatus } from '../types'
import { addRecord, createId, getTasks, saveTask } from './storage'

function nextDueAt(task: CareTask): string | undefined {
  if (task.repeat === 'none') return undefined
  const next = new Date(task.dueAt)
  if (Number.isNaN(next.getTime())) return undefined

  if (task.repeat === 'daily') next.setDate(next.getDate() + 1)
  if (task.repeat === 'weekly') next.setDate(next.getDate() + 7)
  if (task.repeat === 'monthly') next.setMonth(next.getMonth() + 1)
  return next.toISOString()
}
export function finishTask(taskId: string, status: Extract<TaskStatus, 'done' | 'skipped'>): boolean {
  const task = getTasks().find((item) => item.id === taskId)
  if (!task || task.status !== 'pending') return false

  const completedAt = new Date().toISOString()
  saveTask({ ...task, status, completedAt })

  if (status === 'done') {
    addRecord({
      id: createId('record'),
      plantId: task.plantId,
      type: task.type,
      note: task.note || '由养护任务完成',
      createdAt: completedAt
    })
  }

  const dueAt = nextDueAt(task)
  if (dueAt) {
    saveTask({
      ...task,
      id: createId('task'),
      dueAt,
      status: 'pending',
      createdAt: completedAt,
      completedAt: undefined
    })
  }
  return true
}
