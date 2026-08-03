import React, { useState } from 'react'
import { View, Text, Image, Button, Swiper } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

const mockPlants = [
  {
    id: 1,
    name: '绿萝',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20green%20leaves%20pot%20indoors&image_size=square',
    health: 'healthy',
    lastWatered: '2026-07-18',
    nextWater: '2026-07-21',
    careLevel: '简单'
  },
  {
    id: 2,
    name: '多肉植物',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=succulent%20plants%20colorful%20pot%20cute&image_size=square',
    health: 'healthy',
    lastWatered: '2026-07-15',
    nextWater: '2026-07-22',
    careLevel: '中等'
  },
  {
    id: 3,
    name: '月季',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rose%20flower%20beautiful%20garden%20red&image_size=square',
    health: 'warning',
    lastWatered: '2026-07-19',
    nextWater: '2026-07-20',
    careLevel: '困难'
  },
  {
    id: 4,
    name: '君子兰',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clivia%20plant%20orange%20flowers%20elegant&image_size=square',
    health: 'healthy',
    lastWatered: '2026-07-16',
    nextWater: '2026-07-23',
    careLevel: '中等'
  }
]

const Garden: React.FC = () => {
  const [plants, setPlants] = useState(mockPlants)
  const [activeTab, setActiveTab] = useState('plants')

  const handleWater = (id: number) => {
    setPlants(plants.map(plant => {
      if (plant.id === id) {
        return { ...plant, lastWatered: '2026-07-20', health: 'healthy' }
      }
      return plant
    }))
    Taro.showToast({
      title: '浇水成功',
      icon: 'success'
    })
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return '#52c41a'
      case 'warning': return '#faad14'
      case 'danger': return '#ff4d4f'
      default: return '#999'
    }
  }

  const getHealthText = (health: string) => {
    switch (health) {
      case 'healthy': return '健康'
      case 'warning': return '需要关注'
      case 'danger': return '状态不佳'
      default: return '未知'
    }
  }

  return (
    <View className="garden-container">
      <View className="garden-header">
        <Text className="page-title">我的花园</Text>
        <Text className="plant-count">共 {plants.length} 株植物</Text>
      </View>

      <View className="tabs">
        <View 
          className={`tab-item ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => setActiveTab('plants')}
        >
          <Text className="tab-text">植物列表</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Text className="tab-text">养护日历</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          <Text className="tab-text">花园设计</Text>
        </View>
      </View>

      {activeTab === 'plants' && (
        <View className="plant-list">
          {plants.map(plant => (
            <View key={plant.id} className="plant-card">
              <Image src={plant.image} mode="aspectFill" className="plant-image" />
              <View className="plant-info">
                <View className="plant-header">
                  <Text className="plant-name">{plant.name}</Text>
                  <View className="health-tag" style={{ backgroundColor: getHealthColor(plant.health) }}>
                    <Text className="health-text">{getHealthText(plant.health)}</Text>
                  </View>
                </View>
                <View className="plant-meta">
                  <Text className="meta-item">💧 上次浇水: {plant.lastWatered}</Text>
                  <Text className="meta-item">📅 下次浇水: {plant.nextWater}</Text>
                  <Text className="meta-item">🎯 养护难度: {plant.careLevel}</Text>
                </View>
                <Button className="water-btn" onClick={() => handleWater(plant.id)}>
                  浇水
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'calendar' && (
        <View className="calendar-section">
          <View className="calendar-header">
            <Text className="calendar-title">7月养护日历</Text>
          </View>
          <View className="calendar-grid">
            <View className="weekday-header">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <Text key={day} className="weekday">{day}</Text>
              ))}
            </View>
            <View className="dates">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(date => {
                const hasTask = [18, 20, 21, 22, 23].includes(date)
                const isToday = date === 20
                return (
                  <View key={date} className={`date-item ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}`}>
                    <Text className="date-num">{date}</Text>
                    {hasTask && <View className="task-dot" />}
                  </View>
                )
              })}
            </View>
          </View>
          <View className="today-tasks">
            <Text className="tasks-title">今日任务</Text>
            <View className="task-list">
              <View className="task-item">
                <View className="task-icon water">💧</View>
                <View className="task-content">
                  <Text className="task-name">给月季浇水</Text>
                  <Text className="task-time">建议上午10点前</Text>
                </View>
              </View>
              <View className="task-item">
                <View className="task-icon fertilize">🌿</View>
                <View className="task-content">
                  <Text className="task-name">给绿萝施肥</Text>
                  <Text className="task-time">每月一次</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'design' && (
        <View className="design-section">
          <View className="design-intro">
            <Text className="design-title">花园设计</Text>
            <Text className="design-desc">上传您的花园照片，AI帮您规划最佳植物布局</Text>
          </View>
          <View className="design-preview">
            <Image 
              className="garden-preview" 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20garden%20layout%20design%20plants%20arrangement%20top%20view&image_size=landscape_4_3" 
              mode="aspectFill"
            />
            <View className="overlay-info">
              <Text className="overlay-text">点击上传花园照片</Text>
            </View>
          </View>
          <View className="design-features">
            <View className="feature-item">
              <Text className="feature-icon">📐</Text>
              <Text className="feature-name">空间分析</Text>
              <Text className="feature-desc">自动计算面积和光照</Text>
            </View>
            <View className="feature-item">
              <Text className="feature-icon">🎨</Text>
              <Text className="feature-name">搭配推荐</Text>
              <Text className="feature-desc">科学植物组合建议</Text>
            </View>
            <View className="feature-item">
              <Text className="feature-icon">👁️</Text>
              <Text className="feature-name">AR预览</Text>
              <Text className="feature-desc">实景查看种植效果</Text>
            </View>
          </View>
        </View>
      )}

      <Button className="add-plant-btn" onClick={() => {
        Taro.switchTab({ url: '/pages/identify/index' })
      }}>
        <Text className="add-icon">➕</Text>
        <Text className="add-text">添加新植物</Text>
      </Button>
    </View>
  )
}

export default Garden
