import { findPlantKnowledge } from '../../data/plants'
import { CareRecord, CareTask, CareType, GardenPlant, PlantKnowledge } from '../../types'
import { formatDate, formatDateTime } from '../../utils/date'
import { careTypeLabels, repeatRuleLabels, taskStatusLabels } from '../../utils/labels'
import {
  addRecord,
  createId,
  deletePlant,
  deleteRecord,
  deleteTask,
  getPlant,
  getRecords,
  getTasks
} from '../../utils/storage'
import { finishTask } from '../../utils/tasks'

interface RecordView extends CareRecord {
  typeLabel: string
  timeLabel: string
}

interface TaskView extends CareTask {
  typeLabel: string
  timeLabel: string
  repeatLabel: string
  statusLabel: string
}

interface PlantDetailData {
  plantId: string
  plant: GardenPlant | null
  knowledge: PlantKnowledge | null
  acquiredLabel: string
  records: RecordView[]
  tasks: TaskView[]
  careActions: Array<{ type: CareType; label: string }>
}

const careActions: Array<{ type: CareType; label: string }> = [
  { type: 'water', label: '浇水' },
  { type: 'fertilize', label: '施肥' },
  { type: 'prune', label: '修剪' },
  { type: 'repot', label: '换盆' },
  { type: 'medicine', label: '用药' },
  { type: 'observe', label: '观察' }
]

Page<PlantDetailData, Record<string, any>>({
  data: {
    plantId: '',
    plant: null,
    knowledge: null,
    acquiredLabel: '',
    records: [],
    tasks: [],
    careActions
  },

  onLoad(options: any) {
    this.setData({ plantId: options?.id || '' })
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const plant = getPlant(this.data.plantId)
    if (!plant) {
      wx.showModal({
        title: '植物不存在',
        content: '这株植物可能已经被删除。',
        showCancel: false,
        success: () => wx.navigateBack()
      })
      return
    }
    wx.setNavigationBarTitle({ title: plant.nickname || plant.name })
    this.setData({
      plant,
      knowledge: plant.knowledgeId ? findPlantKnowledge(plant.knowledgeId) || null : null,
      acquiredLabel: formatDate(plant.acquiredAt),
      records: getRecords(plant.id).map<RecordView>((record) => ({
        ...record,
        typeLabel: careTypeLabels[record.type],
        timeLabel: formatDateTime(record.createdAt)
      })),
      tasks: getTasks(plant.id).slice(0, 12).map<TaskView>((task) => ({
        ...task,
        typeLabel: careTypeLabels[task.type],
        timeLabel: formatDateTime(task.dueAt),
        repeatLabel: repeatRuleLabels[task.repeat],
        statusLabel: taskStatusLabels[task.status]
      }))
    })
  },

  addCareRecord(event: any) {
    const type = event.currentTarget.dataset.type as CareType
    addRecord({
      id: createId('record'),
      plantId: this.data.plantId,
      type,
      note: '快捷记录',
      createdAt: new Date().toISOString()
    })
    wx.showToast({ title: `已记录${careTypeLabels[type]}`, icon: 'success' })
    this.refresh()
  },

  editPlant() {
    wx.navigateTo({ url: `/pages/plant-form/index?id=${this.data.plantId}` })
  },

  addTask() {
    wx.navigateTo({ url: `/pages/task-form/index?plantId=${this.data.plantId}` })
  },

  removeRecord(event: any) {
    const id = event.currentTarget.dataset.id as string
    wx.showModal({
      title: '删除养护记录？',
      content: '删除后无法恢复。',
      confirmColor: '#A33D34',
      success: (response: any) => {
        if (!response.confirm) return
        deleteRecord(id)
        this.refresh()
      }
    })
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
  },

  removeTask(event: any) {
    const id = event.currentTarget.dataset.id as string
    wx.showModal({
      title: '删除任务？',
      content: '重复任务后续也不会再生成。',
      confirmColor: '#A33D34',
      success: (response: any) => {
        if (!response.confirm) return
        deleteTask(id)
        this.refresh()
      }
    })
  },

  removePlant() {
    const name = this.data.plant?.nickname || this.data.plant?.name || '这株植物'
    wx.showModal({
      title: `删除${name}？`,
      content: '关联的养护记录和任务也会一并删除，且无法恢复。',
      confirmColor: '#A33D34',
      success: (response: any) => {
        if (!response.confirm) return
        deletePlant(this.data.plantId)
        wx.showToast({ title: '植物已删除', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 400)
      }
    })
  }
})
