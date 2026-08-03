import React, { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Picker, Text, Textarea, View } from '@tarojs/components'
import { createId, useApp } from '../../store'
import { CareType, RepeatRule } from '../../types'
import { addDays, toDateValue } from '../../utils/date'
import { careTypeLabels, repeatRuleLabels } from '../../utils/labels'
import './index.scss'

const careTypes: CareType[] = ['water', 'fertilize', 'prune', 'repot', 'medicine', 'observe']
const repeatRules: RepeatRule[] = ['none', 'daily', 'weekly', 'monthly']

const TaskForm: React.FC = () => {
  const { state, saveCareTask } = useApp()
  const [plantIndex, setPlantIndex] = useState(0)
  const [typeIndex, setTypeIndex] = useState(0)
  const [repeatIndex, setRepeatIndex] = useState(0)
  const [date, setDate] = useState(toDateValue(addDays(new Date(), 1)))
  const [time, setTime] = useState('09:00')
  const [note, setNote] = useState('')
  const plantNames = state.gardenPlants.map((plant) => plant.nickname || plant.name)
  const typeNames = careTypes.map((type) => careTypeLabels[type])
  const repeatNames = repeatRules.map((rule) => repeatRuleLabels[rule])

  useLoad((options) => {
    const index = state.gardenPlants.findIndex((plant) => plant.id === options.plantId)
    if (index >= 0) setPlantIndex(index)
  })

  const save = () => {
    const plant = state.gardenPlants[plantIndex]
    if (!plant) {
      Taro.showToast({ title: '请先添加植物', icon: 'none' })
      return
    }
    saveCareTask({
      id: createId('task'),
      plantId: plant.id,
      type: careTypes[typeIndex],
      dueAt: new Date(`${date}T${time}:00`).toISOString(),
      repeat: repeatRules[repeatIndex],
      note: note.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    Taro.showToast({ title: '任务已创建', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 450)
  }

  return (
    <View className='page-shell task-form-page'>
      <View className='page-heading'><Text className='page-title'>安排下一次养护</Text><Text className='page-copy'>任务会先保存在本机。微信订阅提醒需开通 AppID 和云服务后启用。</Text></View>
      <View className='local-notice'><Text>本地模式</Text><Text>当前可以在首页和花园查看待办，但暂时不会发送微信消息。</Text></View>
      <Text className='field-label'>植物</Text>
      <Picker mode='selector' range={plantNames} value={plantIndex} onChange={(event) => setPlantIndex(Number(event.detail.value))}><View className='picker-field'>{plantNames[plantIndex] || '请选择植物'}</View></Picker>
      <Text className='field-label'>任务类型</Text>
      <Picker mode='selector' range={typeNames} value={typeIndex} onChange={(event) => setTypeIndex(Number(event.detail.value))}><View className='picker-field'>{typeNames[typeIndex]}</View></Picker>
      <View className='date-grid'>
        <View><Text className='field-label'>日期</Text><Picker mode='date' value={date} onChange={(event) => setDate(String(event.detail.value))}><View className='picker-field'>{date}</View></Picker></View>
        <View><Text className='field-label'>时间</Text><Picker mode='time' value={time} onChange={(event) => setTime(String(event.detail.value))}><View className='picker-field'>{time}</View></Picker></View>
      </View>
      <Text className='field-label'>重复</Text>
      <Picker mode='selector' range={repeatNames} value={repeatIndex} onChange={(event) => setRepeatIndex(Number(event.detail.value))}><View className='picker-field'>{repeatNames[repeatIndex]}</View></Picker>
      <Text className='field-label'>备注</Text>
      <Textarea className='field-textarea task-note-input' value={note} maxlength={200} placeholder='例如：浇透后倒掉托盘积水' onInput={(event) => setNote(event.detail.value)} />
      <Button className='primary-button save-button' onClick={save}>保存任务</Button>
    </View>
  )
}

export default TaskForm
