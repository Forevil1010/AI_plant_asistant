import { GardenPlant } from '../../types'
import { toDateInputValue } from '../../utils/date'
import { persistLocalImage } from '../../utils/image'
import { createId, getPlant, savePlant } from '../../utils/storage'

interface PlantFormData {
  editingId: string
  name: string
  nickname: string
  imagePath: string
  location: string
  acquiredAt: string
  note: string
  saving: boolean
}

Page<PlantFormData, Record<string, any>>({
  data: {
    editingId: '',
    name: '',
    nickname: '',
    imagePath: '/assets/plants/pothos.jpg',
    location: '客厅',
    acquiredAt: toDateInputValue(),
    note: '',
    saving: false
  },

  onLoad(options: any) {
    const id = options?.id as string | undefined
    if (!id) return
    const plant = getPlant(id)
    if (!plant) {
      wx.showToast({ title: '没有找到这株植物', icon: 'none' })
      return
    }
    wx.setNavigationBarTitle({ title: '编辑植物' })
    this.setData({
      editingId: plant.id,
      name: plant.name,
      nickname: plant.nickname,
      imagePath: plant.imagePath,
      location: plant.location,
      acquiredAt: plant.acquiredAt,
      note: plant.note
    })
  },

  onNameInput(event: any) {
    const name = event.detail.value
    this.setData({ name, nickname: this.data.nickname || name })
  },

  onNicknameInput(event: any) {
    this.setData({ nickname: event.detail.value })
  },

  onLocationInput(event: any) {
    this.setData({ location: event.detail.value })
  },

  onNoteInput(event: any) {
    this.setData({ note: event.detail.value })
  },

  onDateChange(event: any) {
    this.setData({ acquiredAt: event.detail.value })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (response: any) => {
        const path = response.tempFiles?.[0]?.tempFilePath
        if (path) this.setData({ imagePath: path })
      },
      fail: (error: any) => {
        if (!String(error?.errMsg || '').includes('cancel')) {
          wx.showToast({ title: '无法读取图片', icon: 'none' })
        }
      }
    })
  },

  async save() {
    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '请输入植物名称', icon: 'none' })
      return
    }
    if (this.data.saving) return
    this.setData({ saving: true })

    const existing = this.data.editingId ? getPlant(this.data.editingId) : undefined
    const imagePath = await persistLocalImage(this.data.imagePath)
    const plant: GardenPlant = {
      id: existing?.id || createId('plant'),
      knowledgeId: existing?.knowledgeId,
      name,
      nickname: this.data.nickname.trim() || name,
      imagePath,
      location: this.data.location.trim() || '未设置位置',
      acquiredAt: this.data.acquiredAt,
      note: this.data.note.trim(),
      createdAt: existing?.createdAt || new Date().toISOString()
    }
    savePlant(plant)
    wx.showToast({ title: existing ? '修改已保存' : '植物已添加', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 500)
  }
})
