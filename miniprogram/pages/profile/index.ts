import { AppStats } from '../../types'
import { clearAllData, getStats } from '../../utils/storage'

interface ProfileData {
  stats: AppStats
}

Page<ProfileData, Record<string, any>>({
  data: {
    stats: {
      plants: 0,
      records: 0,
      tasksPending: 0,
      identifications: 0,
      diagnoses: 0
    }
  },

  onShow() {
    this.setData({ stats: getStats() })
  },

  openIdentifyHistory() {
    wx.navigateTo({ url: '/pages/history/index?type=identify' })
  },

  openDiagnoseHistory() {
    wx.navigateTo({ url: '/pages/history/index?type=diagnose' })
  },

  showCloudStatus() {
    wx.showModal({
      title: '当前为本地模式',
      content: '数据只保存在这台设备中。注册小程序并开通 CloudBase 后，才能启用云同步和微信订阅消息。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私说明',
      content: '当前版本不会把图片或养护数据上传到网络，所有数据仅保存在本机。接入第三方 AI 前会另行说明图片用途和保存规则。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  showAbout() {
    wx.showModal({
      title: 'AI 园林助手 v0.1.0',
      content: '面向普通植物爱好者的免费养护工具。当前识别和诊断结果由模拟服务生成。',
      showCancel: false,
      confirmText: '关闭'
    })
  },

  clearData() {
    wx.showModal({
      title: '清除所有本地数据？',
      content: '花园植物、养护记录、任务和历史都会删除，且无法恢复。',
      confirmText: '确认清除',
      confirmColor: '#A33D34',
      success: (response: any) => {
        if (!response.confirm) return
        clearAllData()
        this.setData({ stats: getStats() })
        wx.showToast({ title: '本地数据已清除', icon: 'none' })
      }
    })
  }
})
