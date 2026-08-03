import { CareType, RepeatRule, TaskStatus } from '../types'

export const careTypeLabels: Record<CareType, string> = {
  water: '浇水',
  fertilize: '施肥',
  prune: '修剪',
  repot: '换盆',
  medicine: '用药',
  observe: '观察'
}
export const repeatRuleLabels: Record<RepeatRule, string> = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月'
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: '待完成',
  done: '已完成',
  skipped: '已跳过'
}
