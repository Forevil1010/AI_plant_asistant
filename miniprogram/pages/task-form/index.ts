import { CareType, GardenPlant, RepeatRule } from '../../types'
import { addDays, toDateInputValue } from '../../utils/date'
import { careTypeLabels, repeatRuleLabels } from '../../utils/labels'
import { createId, getPlants, saveTask } from '../../utils/storage'

interface TaskFormData {
  plants: GardenPlant[]
  plantNames: string[]
  plantIndex: number
  careTypes: CareType[]
  careTypeNames: string[]
  careTypeIndex: number
  repeatRules: RepeatRule[]
  repeatNames: string[]
  repeatIndex: number
  date: string
  time: string
  note: string
}

const careTypes: CareType[] = ['water', 'fertilize', 'prune', 'repot', 'medicine', 'observe']
const repeatRules: RepeatRule[] = ['none', 'daily', 'weekly', 'monthly']

Page<TaskFormData, Record<string, any>>({
  data: {
    plants: [],
    plantNames: [],
    plantIndex: 0,
    careTypes,
    careTypeNames: careTypes.map((type) => careTypeLabels[type]),
    careTypeIndex: 0,
    repeatRules,
    repeatNames: repeatRules.map((rule) => repeatRuleLabels[rule]),
    repeatIndex: 0,
    date: toDateInputValue(addDays(new Date(), 1)),
    time: '09:00',
    note: ''
  },

  onLoad(options: any) {
    const plants = getPlants()
    if (!plants.length) {
      wx.showModal({
        title: '还没有植物',
        content: '请先向花园添加植物，再创建养护任务。',
        showCancel: false,
        success: () => wx.navigateBack()
      })
      return
    }
    const requestedId = options?.plantId as string | undefined
    const requestedIndex = requestedId ? plants.findIndex((plant) => plant.id === requestedId) : -1
    this.setData({
      plants,
      plantNames: plants.map((plant) => plant.nickname || plant.name),
      plantIndex: requestedIndex >= 0 ? requestedIndex : 0
    })
  },

  onPlantChange(event: any) {
    this.setData({ plantIndex: Number(event.detail.value) })
  },

  onTypeChange(event: any) {
    this.setData({ careTypeIndex: Number(event.detail.value) })
  },

  onRepeatChange(event: any) {
    this.setData({ repeatIndex: Number(event.detail.value) })
  },

  onDateChange(event: any) {
    this.setData({ date: event.detail.value })
  },

  onTimeChange(event: any) {
    this.setData({ time: event.detail.value })
  },

  onNoteInput(event: any) {
    this.setData({ note: event.detail.value })
  },

  save() {
    const plant = this.data.plants[this.data.plantIndex]
    if (!plant) {
      wx.showToast({ title: '请选择植物', icon: 'none' })
      return
    }
    saveTask({
      id: createId('task'),
      plantId: plant.id,
      type: this.data.careTypes[this.data.careTypeIndex],
      dueAt: `${this.data.date}T${this.data.time}:00`,
      repeat: this.data.repeatRules[this.data.repeatIndex],
      note: this.data.note.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    wx.showToast({ title: '任务已创建', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 500)
  }
})
