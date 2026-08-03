import { plantKnowledge, searchPlantKnowledge } from '../../data/plants'
import { CareTask, PlantKnowledge } from '../../types'
import { formatDateTime, isOverdue, isToday } from '../../utils/date'
import { careTypeLabels } from '../../utils/labels'
import { getPlants, getStats, getTasks } from '../../utils/storage'
import { finishTask } from '../../utils/tasks'

interface TaskView extends CareTask {
  plantName: string
  typeLabel: string
  dueLabel: string
  overdue: boolean
}

interface HomeData {
  greeting: string
  query: string
  featured: PlantKnowledge[]
  searchResults: PlantKnowledge[]
  searched: boolean
  todayTasks: TaskView[]
  plantCount: number
  pendingCount: number
  dailyTip: string
}

const dailyTips = [
  '浇水前先摸一摸盆土，表面干燥不代表深层已经缺水。',
  '大多数室内植物更喜欢稳定环境，频繁挪动可能造成应激。',
  '叶片积灰会影响光合作用，可以定期用湿布轻轻擦拭。',
  '发现虫害时先隔离植株，再检查相邻植物的叶背和新芽。'
]

Page<HomeData, Record<string, any>>({
  data: {
    greeting: '上午好',
    query: '',
    featured: plantKnowledge.slice(0, 3),
    searchResults: [],
    searched: false,
    todayTasks: [],
    plantCount: 0,
    pendingCount: 0,
    dailyTip: dailyTips[new Date().getDate() % dailyTips.length]
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const hour = new Date().getHours()
    const plants = getPlants()
    const plantMap = new Map(plants.map((plant) => [plant.id, plant.nickname || plant.name]))
    const pendingTasks = getTasks().filter((task) => task.status === 'pending')
    const todayTasks = pendingTasks
      .filter((task) => isToday(task.dueAt) || isOverdue(task.dueAt))
      .slice(0, 4)
      .map<TaskView>((task) => ({
        ...task,
        plantName: plantMap.get(task.plantId) || '已删除植物',
        typeLabel: careTypeLabels[task.type],
        dueLabel: formatDateTime(task.dueAt),
        overdue: isOverdue(task.dueAt) && !isToday(task.dueAt)
      }))
    const stats = getStats()

    this.setData({
      greeting: hour < 11 ? '上午好' : hour < 18 ? '下午好' : '晚上好',
      todayTasks,
      plantCount: stats.plants,
      pendingCount: stats.tasksPending
    })
  },

  onQueryInput(event: any) {
    this.setData({ query: event.detail.value, searched: false })
  },

  search() {
    const keyword = this.data.query.trim()
    if (!keyword) {
      wx.showToast({ title: '请输入植物名称', icon: 'none' })
      return
    }
    this.setData({ searchResults: searchPlantKnowledge(keyword), searched: true })
  },

  clearSearch() {
    this.setData({ query: '', searchResults: [], searched: false })
  },

  goIdentify() {
    wx.switchTab({ url: '/pages/identify/index' })
  },

  goDiagnose() {
    wx.switchTab({ url: '/pages/diagnose/index' })
  },

  goGarden() {
    wx.switchTab({ url: '/pages/garden/index' })
  },

  completeTask(event: any) {
    const taskId = event.currentTarget.dataset.id as string
    if (!finishTask(taskId, 'done')) return
    wx.showToast({ title: '任务已完成', icon: 'success' })
    this.refresh()
  }
})
