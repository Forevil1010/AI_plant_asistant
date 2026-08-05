import React, { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, ScrollView, Text, View } from '@tarojs/components'
import SearchBar from '../../components/SearchBar'
import { plantKnowledge, searchPlantKnowledge } from '../../data/plants'
import { useApp } from '../../store'
import { formatDateTime, isOverdue, isToday } from '../../utils/date'
import { careTypeLabels } from '../../utils/labels'
import './index.scss'

const dailyTips = [
  '浇水前先摸一摸盆土，表面干燥不代表深层已经缺水。',
  '大多数室内植物更喜欢稳定环境，频繁挪动可能造成应激。',
  '叶片积灰会影响光合作用，可以定期用湿布轻轻擦拭。',
  '发现虫害时先隔离植株，再检查相邻植物的叶背和新芽。'
]

const Home: React.FC = () => {
  const { state, finishCareTask, snoozeCareTask } = useApp()
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<typeof plantKnowledge>([])
  const plantMap = useMemo(() => new Map(state.gardenPlants.map((plant) => [plant.id, plant.nickname || plant.name])), [state.gardenPlants])
  const pendingTasks = useMemo(() => state.careTasks.filter((task) => task.status === 'pending'), [state.careTasks])
  const todayTasks = useMemo(() => pendingTasks
    .filter((task) => isToday(task.dueAt) || isOverdue(task.dueAt))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 4), [pendingTasks])

  const search = () => {
    if (!query.trim()) {
      Taro.showToast({ title: '请输入植物名称', icon: 'none' })
      return
    }
    setResults(searchPlantKnowledge(query))
    setSearched(true)
  }

  const completeTask = (id: string) => {
    finishCareTask(id, 'done')
    Taro.showToast({ title: '任务已完成', icon: 'success' })
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
    <View className='home-page'>
      <View className='home-hero'>
        <View className='home-hero__content'>
          <Text className='home-hero__kicker'>AI 园林助手</Text>
          <Text className='home-hero__title'>照料好每一株植物</Text>
          <Text className='home-hero__copy'>今天有 {pendingTasks.length} 项待办，花园里共有 {state.gardenPlants.length} 株植物</Text>
        </View>
        <Image className='home-hero__image' src={plantKnowledge[0].imageUrl} mode='aspectFill' />
      </View>

      <View className='home-content'>
        <SearchBar value={query} onChange={(value) => { setQuery(value); setSearched(false) }} onSearch={search} />

        {searched && (
          <View className='search-results card'>
            <View className='section-header'>
              <Text className='section-title'>搜索结果</Text>
              <Text className='section-link' onClick={() => setSearched(false)}>关闭</Text>
            </View>
            {results.length ? results.map((plant) => (
              <View key={plant.id} className='search-result'>
                <Image src={plant.imageUrl} mode='aspectFill' />
                <View>
                  <Text className='search-result__name'>{plant.name}</Text>
                  <Text className='search-result__latin'>{plant.latinName}</Text>
                  <Text className='search-result__summary'>{plant.summary}</Text>
                </View>
              </View>
            )) : (
              <View className='empty-panel'>
                <Text className='empty-title'>没有找到相关资料</Text>
                <Text className='empty-copy'>可以换一个名称，或者直接拍照识别。</Text>
              </View>
            )}
          </View>
        )}

        <View className='section'>
          <View className='section-header'><Text className='section-title'>常用工具</Text></View>
          <View className='tool-grid'>
            <View className='tool-item tool-item--green' onClick={() => Taro.switchTab({ url: '/pages/identify/index' })}>
              <Text className='tool-item__mark'>识</Text><Text className='tool-item__title'>植物识别</Text><Text className='tool-item__copy'>拍照认识植物</Text>
            </View>
            <View className='tool-item tool-item--yellow' onClick={() => Taro.switchTab({ url: '/pages/diagnose/index' })}>
              <Text className='tool-item__mark'>诊</Text><Text className='tool-item__title'>问题诊断</Text><Text className='tool-item__copy'>图文描述症状</Text>
            </View>
            <View className='tool-item tool-item--coral' onClick={() => Taro.switchTab({ url: '/pages/garden/index' })}>
              <Text className='tool-item__mark'>园</Text><Text className='tool-item__title'>我的花园</Text><Text className='tool-item__copy'>记录养护日常</Text>
            </View>
          </View>
        </View>

        {todayTasks.length > 0 && (
          <View className='section'>
            <View className='section-header'><Text className='section-title'>今日待办</Text><Text className='section-link' onClick={() => Taro.switchTab({ url: '/pages/garden/index' })}>查看全部</Text></View>
            <View className='task-list card'>
              {todayTasks.map((task) => (
                <View key={task.id} className='task-row'>
                  <View className={`task-row__bar ${isOverdue(task.dueAt) && !isToday(task.dueAt) ? 'task-row__bar--late' : ''}`} />
                  <View className='task-row__main'>
                    <Text className='task-row__title'>{careTypeLabels[task.type]} · {plantMap.get(task.plantId) || '已删除植物'}</Text>
                    <Text className='task-row__time'>{formatDateTime(task.dueAt)}</Text>
                  </View>
                  <View className='task-row__actions'>
                    <Text className='task-row__snooze' onClick={() => snoozeTask(task.id)}>延后</Text>
                    <Button className='task-row__button' onClick={() => completeTask(task.id)}>完成</Button>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className='section'>
          <View className='section-header'><Text className='section-title'>今日养护提示</Text></View>
          <View className='daily-tip'><Text className='daily-tip__label'>TIP</Text><Text>{dailyTips[new Date().getDate() % dailyTips.length]}</Text></View>
        </View>

        <View className='section'>
          <View className='section-header'><Text className='section-title'>常见室内植物</Text></View>
          <ScrollView className='featured-scroll' scrollX enhanced showScrollbar={false}>
            <View className='featured-row'>
              {plantKnowledge.map((plant) => (
                <View key={plant.id} className='featured-card card' onClick={() => Taro.navigateTo({ url: `/pages/plant-knowledge/index?id=${plant.id}` })}>
                  <Image src={plant.imageUrl} mode='aspectFill' lazyLoad />
                  <View className='featured-card__body'><Text>{plant.name}</Text><Text>{plant.tags.join(' · ')}</Text></View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

export default Home
