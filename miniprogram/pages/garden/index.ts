import { CareTask, GardenPlant } from '../../types'
import { formatDateTime, isOverdue } from '../../utils/date'
import { careTypeLabels } from '../../utils/labels'
import {
  addRecord,
  createId,
  getPlants,
  getRecords,
  getTasks
} from '../../utils/storage'
import { finishTask } from '../../utils/tasks'

interface PlantView extends GardenPlant {
  lastCareLabel: string
  pendingTasks: number
}

interface TaskView extends CareTask {
  plantName: string
  typeLabel: string
  dueLabel: string
  overdue: boolean
}

interface GardenData {
  activeView: 'plants' | 'tasks'
  plants: PlantView[]
  tasks: TaskView[]
  plantCount: number
  pendingCount: number
}

Page<GardenData, Record<string, any>>({
  data: {
    activeView: 'plants',
    plants: [],
    tasks: [],
    plantCount: 0,
    pendingCount: 0
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const plants = getPlants()
    const records = getRecords()
    const tasks = getTasks()
    const plantMap = new Map(plants.map((plant) => [plant.id, plant.nickname || plant.name]))

    const plantViews = plants.map<PlantView>((plant) => {
      const lastRecord = records.find((record) => record.plantId === plant.id)
      const pendingTasks = tasks.filter((task) => task.plantId === plant.id && task.status === 'pending').length
      return {
        ...plant,
        lastCareLabel: lastRecord
          ? `${careTypeLabels[lastRecord.type]}于 ${formatDateTime(lastRecord.createdAt)}`
          : '还没有养护记录',
        pendingTasks
      }
    })

    const pendingTaskViews = tasks
      .filter((task) => task.status === 'pending')
      .map<TaskView>((task) => ({
        ...task,
        plantName: plantMap.get(task.plantId) || '已删除植物',
        typeLabel: careTypeLabels[task.type],
        dueLabel: formatDateTime(task.dueAt),
        overdue: isOverdue(task.dueAt)
      }))

    this.setData({
      plants: plantViews,
      tasks: pendingTaskViews,
      plantCount: plants.length,
      pendingCount: pendingTaskViews.length
    })
  },

  showPlants() {
    this.setData({ activeView: 'plants' })
  },

  showTasks() {
    this.setData({ activeView: 'tasks' })
  },

  addPlant() {
    wx.navigateTo({ url: '/pages/plant-form/index' })
  },

  addTask() {
    if (!this.data.plants.length) {
      wx.showToast({ title: '请先添加一株植物', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/task-form/index' })
  },

  openPlant(event: any) {
    wx.navigateTo({ url: `/pages/plant-detail/index?id=${event.currentTarget.dataset.id}` })
  },

  quickWater(event: any) {
    const plantId = event.currentTarget.dataset.id as string
    addRecord({
      id: createId('record'),
      plantId,
      type: 'water',
      note: '快捷记录',
      createdAt: new Date().toISOString()
    })
    wx.showToast({ title: '已记录浇水', icon: 'success' })
    this.refresh()
  },

  completeTask(event: any) {
    if (!finishTask(event.currentTarget.dataset.id, 'done')) return
    wx.showToast({ title: '任务已完成', icon: 'success' })
    this.refresh()
  },

  skipTask(event: any) {
    if (!finishTask(event.currentTarget.dataset.id, 'skipped')) return
    wx.showToast({ title: '任务已跳过', icon: 'none' })
    this.refresh()
  }
})
