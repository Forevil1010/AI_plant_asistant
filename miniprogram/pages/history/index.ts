import { DiagnosisHistory, IdentifyHistory } from '../../types'
import { formatDateTime } from '../../utils/date'
import {
  deleteDiagnosisHistory,
  deleteIdentifyHistory,
  getDiagnosisHistory,
  getIdentifyHistory
} from '../../utils/storage'

interface IdentifyView extends IdentifyHistory {
  timeLabel: string
  confidenceText: string
}

interface DiagnoseView extends DiagnosisHistory {
  timeLabel: string
  inputSummary: string
}

interface HistoryData {
  type: 'identify' | 'diagnose'
  title: string
  subtitle: string
  identifyItems: IdentifyView[]
  diagnoseItems: DiagnoseView[]
}

Page<HistoryData, Record<string, any>>({
  data: {
    type: 'identify',
    title: '识别历史',
    subtitle: '最近的植物识别结果保存在本机',
    identifyItems: [],
    diagnoseItems: []
  },

  onLoad(options: any) {
    const type = options?.type === 'diagnose' ? 'diagnose' : 'identify'
    wx.setNavigationBarTitle({ title: type === 'identify' ? '识别历史' : '诊断历史' })
    this.setData({
      type,
      title: type === 'identify' ? '识别历史' : '诊断历史',
      subtitle: type === 'identify' ? '最近的植物识别结果保存在本机' : '最近的图文诊断结果保存在本机'
    })
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    this.setData({
      identifyItems: getIdentifyHistory().map((item) => ({
        ...item,
        timeLabel: formatDateTime(item.createdAt),
        confidenceText: `${Math.round(item.result.confidence * 100)}%`
      })),
      diagnoseItems: getDiagnosisHistory().map((item) => ({
        ...item,
        timeLabel: formatDateTime(item.createdAt),
        inputSummary: item.description || (item.imagePath ? '仅提交了植物图片' : '未记录输入内容')
      }))
    })
  },

  removeItem(event: any) {
    const id = event.currentTarget.dataset.id as string
    wx.showModal({
      title: '删除这条记录？',
      content: '删除后无法恢复。',
      confirmColor: '#A33D34',
      success: (response: any) => {
        if (!response.confirm) return
        if (this.data.type === 'identify') deleteIdentifyHistory(id)
        else deleteDiagnosisHistory(id)
        this.refresh()
      }
    })
  }
})
