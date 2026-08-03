import React, { useMemo, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { findPlantKnowledge } from '../../data/plants'
import { createId, useApp } from '../../store'
import { CareType } from '../../types'
import { formatDate, formatDateTime } from '../../utils/date'
import { careTypeLabels, repeatRuleLabels, taskStatusLabels } from '../../utils/labels'
import './index.scss'

const careActions: CareType[] = ['water', 'fertilize', 'prune', 'repot', 'medicine', 'observe']

const PlantDetail: React.FC = () => {
  const {
    state,
    removePlant,
    addCareRecord,
    removeCareRecord,
    finishCareTask,
    removeCareTask
  } = useApp()
  const [plantId, setPlantId] = useState('')
  useLoad((options) => setPlantId(options.id || ''))
  const plant = state.gardenPlants.find((item) => item.id === plantId)
  const knowledge = findPlantKnowledge(plant?.knowledgeId)
  const records = useMemo(() => state.careRecords.filter((record) => record.plantId === plantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [state.careRecords, plantId])
  const tasks = useMemo(() => state.careTasks.filter((task) => task.plantId === plantId).sort((a, b) => b.dueAt.localeCompare(a.dueAt)).slice(0, 12), [state.careTasks, plantId])

  if (!plant) {
    return <View className='page-shell'><View className='empty-panel card'><Text className='empty-title'>没有找到这株植物</Text><Text className='empty-copy'>它可能已经被删除。</Text></View></View>
  }

  const addRecord = (type: CareType) => {
    addCareRecord({ id: createId('record'), plantId, type, note: '快捷记录', createdAt: new Date().toISOString() })
    Taro.showToast({ title: `已记录${careTypeLabels[type]}`, icon: 'success' })
  }
  const confirmRemovePlant = async () => {
    const response = await Taro.showModal({ title: `删除${plant.nickname || plant.name}？`, content: '关联的养护记录和任务也会一并删除，且无法恢复。', confirmColor: '#A33D34' })
    if (response.confirm) {
      removePlant(plant.id)
      Taro.navigateBack()
    }
  }
  const confirmRemoveRecord = async (id: string) => {
    const response = await Taro.showModal({ title: '删除养护记录？', content: '删除后无法恢复。', confirmColor: '#A33D34' })
    if (response.confirm) removeCareRecord(id)
  }

  return (
    <View className='plant-detail-page'>
      <Image className='detail-cover' src={plant.imageUrl} mode='aspectFill' />
      <View className='detail-identity'><Text>{plant.name}</Text><Text>{plant.nickname}</Text><Text>{plant.location} · 自 {formatDate(plant.acquiredAt)} 起养护</Text></View>

      <View className='detail-content'>
        <View className='detail-toolbar'><Button onClick={() => Taro.navigateTo({ url: `/pages/plant-form/index?id=${plant.id}` })}>编辑档案</Button><Button onClick={() => Taro.navigateTo({ url: `/pages/task-form/index?plantId=${plant.id}` })}>新建任务</Button></View>

        <View className='section'>
          <View className='section-header'><Text className='section-title'>快速记录</Text><Text className='muted-text'>点击即保存当前时间</Text></View>
          <View className='care-actions'>{careActions.map((type) => <Button key={type} onClick={() => addRecord(type)}>{careTypeLabels[type]}</Button>)}</View>
        </View>

        {plant.note && <View className='plant-note'><Text>档案备注</Text><Text>{plant.note}</Text></View>}

        <View className='section'>
          <View className='section-header'><Text className='section-title'>养护时间线</Text><Text className='muted-text'>{records.length} 条记录</Text></View>
          {records.length ? <View className='timeline'>{records.map((record) => (
            <View key={record.id} className='timeline-row'>
              <View className='timeline-axis'><Text /></View>
              <View className='timeline-body'><View><Text>{careTypeLabels[record.type]}</Text><Text onClick={() => confirmRemoveRecord(record.id)}>删除</Text></View><Text>{formatDateTime(record.createdAt)}</Text>{record.note && <Text>{record.note}</Text>}</View>
            </View>
          ))}</View> : <View className='empty-panel card'><Text className='empty-title'>还没有养护记录</Text><Text className='empty-copy'>使用上方按钮记录第一次浇水或观察。</Text></View>}
        </View>

        <View className='section'>
          <View className='section-header'><Text className='section-title'>养护任务</Text><Text className='section-link' onClick={() => Taro.navigateTo({ url: `/pages/task-form/index?plantId=${plant.id}` })}>添加</Text></View>
          {tasks.length ? tasks.map((task) => (
            <View key={task.id} className='detail-task card'>
              <View className='detail-task__head'><View><Text>{careTypeLabels[task.type]}</Text><Text>{formatDateTime(task.dueAt)} · {repeatRuleLabels[task.repeat]}</Text></View><Text className='pill'>{taskStatusLabels[task.status]}</Text></View>
              {task.note && <Text className='detail-task__note'>{task.note}</Text>}
              {task.status === 'pending' && <View className='detail-task__actions'><Text onClick={() => removeCareTask(task.id)}>删除</Text><Text onClick={() => finishCareTask(task.id, 'skipped')}>跳过</Text><Button onClick={() => finishCareTask(task.id, 'done')}>完成</Button></View>}
            </View>
          )) : <View className='empty-panel card'><Text className='empty-title'>还没有养护任务</Text><Text className='empty-copy'>建立一个浇水或观察计划。</Text></View>}
        </View>

        {knowledge && <View className='section care-reference'><Text className='section-title'>品种养护参考</Text><View><Text>光照</Text><Text>{knowledge.care.light}</Text></View><View><Text>浇水</Text><Text>{knowledge.care.water}</Text></View><View><Text>温度</Text><Text>{knowledge.care.temperature}</Text></View></View>}
        <Button className='danger-button delete-plant' onClick={confirmRemovePlant}>删除这株植物</Button>
      </View>
    </View>
  )
}

export default PlantDetail
