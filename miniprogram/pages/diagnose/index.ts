import { diagnosePlant } from '../../services/mock-ai'
import { DiagnosisResult, GardenPlant } from '../../types'
import { persistLocalImage } from '../../utils/image'
import { addDiagnosisHistory, createId, getPlants } from '../../utils/storage'

interface DiagnoseData {
  imagePath: string
  description: string
  plants: GardenPlant[]
  plantOptions: string[]
  plantIndex: number
  loading: boolean
  result: DiagnosisResult | null
  severityClass: string
}

Page<DiagnoseData, Record<string, any>>({
  data: {
    imagePath: '',
    description: '',
    plants: [],
    plantOptions: ['不关联花园植物'],
    plantIndex: 0,
    loading: false,
    result: null,
    severityClass: 'severity--low'
  },

  onShow() {
    const plants = getPlants()
    this.setData({
      plants,
      plantOptions: ['不关联花园植物', ...plants.map((plant) => plant.nickname || plant.name)]
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (response: any) => {
        const file = response.tempFiles?.[0]
        if (!file?.tempFilePath) return
        this.setData({ imagePath: file.tempFilePath, result: null })
      },
      fail: (error: any) => {
        if (String(error?.errMsg || '').includes('cancel')) return
        wx.showToast({ title: '无法读取图片，请检查权限', icon: 'none' })
      }
    })
  },

  removeImage() {
    this.setData({ imagePath: '', result: null })
  },

  onDescriptionInput(event: any) {
    this.setData({ description: event.detail.value, result: null })
  },

  onPlantChange(event: any) {
    this.setData({ plantIndex: Number(event.detail.value) })
  },

  async diagnose() {
    const description = this.data.description.trim()
    if (!this.data.imagePath && !description) {
      wx.showToast({ title: '请添加图片或描述症状', icon: 'none' })
      return
    }
    if (this.data.loading) return

    this.setData({ loading: true, result: null })
    try {
      const result = await diagnosePlant(description, Boolean(this.data.imagePath))
      const savedImagePath = this.data.imagePath
        ? await persistLocalImage(this.data.imagePath)
        : ''
      const plant = this.data.plantIndex > 0 ? this.data.plants[this.data.plantIndex - 1] : undefined
      addDiagnosisHistory({
        id: createId('diagnosis'),
        imagePath: savedImagePath || undefined,
        description,
        result,
        createdAt: new Date().toISOString(),
        plantId: plant?.id
      })
      this.setData({
        imagePath: savedImagePath,
        result,
        loading: false,
        severityClass: result.severity === '严重' ? 'severity--high' : result.severity === '中等' ? 'severity--medium' : 'severity--low'
      })
    } catch {
      this.setData({ loading: false })
      wx.showToast({ title: '诊断失败，请稍后重试', icon: 'none' })
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index?type=diagnose' })
  }
})
