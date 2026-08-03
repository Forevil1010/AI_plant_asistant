import { identifyPlant } from '../../services/mock-ai'
import { PlantKnowledge } from '../../types'
import { persistLocalImage } from '../../utils/image'
import { addIdentifyHistory, createId, savePlant } from '../../utils/storage'

interface IdentifyData {
  imagePath: string
  result: PlantKnowledge | null
  loading: boolean
  added: boolean
  confidenceText: string
}

Page<IdentifyData, Record<string, any>>({
  data: {
    imagePath: '',
    result: null,
    loading: false,
    added: false,
    confidenceText: ''
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
        this.setData({ imagePath: file.tempFilePath, result: null, added: false })
      },
      fail: (error: any) => {
        if (String(error?.errMsg || '').includes('cancel')) return
        wx.showToast({ title: '无法读取图片，请检查权限', icon: 'none' })
      }
    })
  },

  removeImage() {
    this.setData({ imagePath: '', result: null, added: false })
  },

  async analyze() {
    if (!this.data.imagePath || this.data.loading) {
      wx.showToast({ title: '请先选择植物图片', icon: 'none' })
      return
    }

    this.setData({ loading: true, result: null, added: false })
    try {
      const result = await identifyPlant(this.data.imagePath)
      const savedImagePath = await persistLocalImage(this.data.imagePath)
      addIdentifyHistory({
        id: createId('identify'),
        imagePath: savedImagePath,
        result,
        createdAt: new Date().toISOString()
      })
      this.setData({
        imagePath: savedImagePath,
        result,
        confidenceText: `${Math.round(result.confidence * 100)}%`,
        loading: false
      })
    } catch {
      this.setData({ loading: false })
      wx.showToast({ title: '识别失败，请稍后重试', icon: 'none' })
    }
  },

  addToGarden() {
    const result = this.data.result
    if (!result || this.data.added) return

    const now = new Date().toISOString()
    savePlant({
      id: createId('plant'),
      knowledgeId: result.id,
      name: result.name,
      nickname: result.name,
      imagePath: result.imagePath,
      location: '室内',
      acquiredAt: now.slice(0, 10),
      note: '由植物识别添加',
      createdAt: now
    })
    this.setData({ added: true })
    wx.showToast({ title: '已加入花园', icon: 'success' })
  },

  goGarden() {
    wx.switchTab({ url: '/pages/garden/index' })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index?type=identify' })
  }
})
