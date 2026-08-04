import React, { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { createId, useApp } from '../../store'
import { formatDateTime, isOverdue } from '../../utils/date'
import { careTypeLabels } from '../../utils/labels'
import './index.scss'

const Garden: React.FC = () => {
  const { state, addCareRecord, finishCareTask, snoozeCareTask } = useApp()
  const [activeTab, setActiveTab] = useState<'plants' | 'tasks'>('plants')
  const pendingTasks = useMemo(() => state.careTasks.filter((task) => task.status === 'pending').sort((a, b) => a.dueAt.localeCompare(b.dueAt)), [state.careTasks])

  const addPlant = () => Taro.navigateTo({ url: '/pages/plant-form/index' })
  const addTask = () => {
    if (!state.gardenPlants.length) {
      Taro.showToast({ title: '请先添加一株植物', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/task-form/index' })
  }
  const quickWater = (plantId: string) => {
    addCareRecord({ id: createId('record'), plantId, type: 'water', note: '快捷记录', createdAt: new Date().toISOString() })
    Taro.showToast({ title: '已记录浇水', icon: 'success' })
  }

  const snoozeTask = (id: string) => {
    Taro.showActionSheet({
      itemList: ['延后 1 天', '延后 3 天', '延后 7 天'],
      success: (res) => {
        if (res.tapIndex === undefined || res.tapIndex < 0) return
        const days = [1, 3, 7][res.tapIndex]
        if (!days) return
        snoozeCareTask(id, days)
        Taro.showToast({ title: `已延后 ${days} 天`, icon: 'success' })
      },
      fail: () => {}
    })
  }

  return (
    <View className='garden-page'>
      <View className='garden-hero'>
        <View><Text className='garden-hero__kicker'>MY GARDEN</Text><Text className='garden-hero__title'>我的花园</Text><Text className='garden-hero__copy'>{state.gardenPlants.length} 株植物 · {pendingTasks.length} 项待办</Text></View>
        <Button className='garden-hero__button' onClick={addPlant}>+ 添加植物</Button>
      </View>

      <View className='garden-content'>
        <View className='segment-control'>
          <View className={activeTab === 'plants' ? 'segment-item segment-item--active' : 'segment-item'} onClick={() => setActiveTab('plants')}>植物</View>
          <View className={activeTab === 'tasks' ? 'segment-item segment-item--active' : 'segment-item'} onClick={() => setActiveTab('tasks')}>待办任务</View>
        </View>

        {activeTab === 'plants' ? (
          state.gardenPlants.length ? (
            <View className='plant-list'>{state.gardenPlants.map((plant) => {
              const records = state.careRecords.filter((record) => record.plantId === plant.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              const plantTasks = pendingTasks.filter((task) => task.plantId === plant.id)
              return (
                <View key={plant.id} className='plant-card card'>
                  <Image className='plant-card__image' src={plant.imageUrl} mode='aspectFill' onClick={() => Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plant.id}` })} />
                  <View className='plant-card__body'>
                    <View className='plant-card__head' onClick={() => Taro.navigateTo({ url: `/pages/plant-detail/index?id=${plant.id}` })}>
                      <View><Text className='plant-card__name'>{plant.nickname}</Text><Text className='plant-card__species'>{plant.name} · {plant.location}</Text></View><Text className='plant-card__arrow'>›</Text>
                    </View>
                    <Text className='plant-card__care'>{records[0] ? `${careTypeLabels[records[0].type]}于 ${formatDateTime(records[0].createdAt)}` : '还没有养护记录'}</Text>
                    <View className='plant-card__footer'><Text className={`pill ${plantTasks.length ? 'pill-warning' : ''}`}>{plantTasks.length ? `${plantTasks.length} 项待办` : '暂无待办'}</Text><Button className='water-button' onClick={() => quickWater(plant.id)}>记录浇水</Button></View>
                  </View>
                </View>
              )
            })}</View>
          ) : (
            <View className='empty-panel card garden-empty'><Text className='empty-title'>花园还是空的</Text><Text className='empty-copy'>手动添加植物，或者先去拍照识别并加入花园。</Text><Button className='primary-button' onClick={addPlant}>添加第一株植物</Button></View>
          )
        ) : (
          <View>
            <View className='task-toolbar'><Text className='muted-text'>按计划时间排序</Text><Button className='task-add-button' onClick={addTask}>+ 新建任务</Button></View>
            {pendingTasks.length ? (
              <View className='garden-task-list'>{pendingTasks.map((task) => {
                const plant = state.gardenPlants.find((item) => item.id === task.plantId)
                return (
                  <View key={task.id} className='garden-task card'>
                    <View className='garden-task__head'><View><Text className='garden-task__title'>{careTypeLabels[task.type]} · {plant?.nickname || plant?.name || '已删除植物'}</Text><Text className='garden-task__time'>{formatDateTime(task.dueAt)}</Text></View><Text className={`pill ${isOverdue(task.dueAt) ? 'pill-warning' : ''}`}>{isOverdue(task.dueAt) ? '已逾期' : '待完成'}</Text></View>
                    {task.note && <Text className='garden-task__note'>{task.note}</Text>}
                    <View className='garden-task__actions'><Button onClick={() => finishCareTask(task.id, 'skipped')}>跳过</Button><Button className='btn-secondary' onClick={() => snoozeTask(task.id)}>延后</Button><Button onClick={() => { finishCareTask(task.id, 'done'); Taro.showToast({ title: '任务已完成', icon: 'success' }) }}>完成任务</Button></View>
                  </View>
                )
              })}</View>
            ) : (
              <View className='empty-panel card garden-empty'><Text className='empty-title'>没有待办任务</Text><Text className='empty-copy'>为植物创建浇水、施肥或观察计划。</Text><Button className='primary-button' onClick={addTask}>新建养护任务</Button></View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

export default Garden
