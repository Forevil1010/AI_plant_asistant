import React from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

const Home: React.FC = () => {
  const handleIdentify = () => {
    Taro.switchTab({
      url: '/pages/identify/index'
    })
  }

  const handleGarden = () => {
    Taro.switchTab({
      url: '/pages/garden/index'
    })
  }

  return (
    <View className="home-container">
      <View className="header">
        <View className="header-content">
          <Text className="title">AI园林助手</Text>
          <Text className="subtitle">您的智能园艺管家</Text>
        </View>
        <Image 
          className="header-bg" 
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20green%20garden%20with%20various%20plants%20and%20flowers%20sunlight%20nature&image_size=landscape_16_9" 
          mode="aspectFill"
        />
      </View>

      <View className="quick-actions">
        <Button className="action-btn primary" onClick={handleIdentify}>
          <View className="action-icon">🌿</View>
          <Text className="action-text">拍照识别</Text>
        </Button>
        <Button className="action-btn secondary" onClick={handleGarden}>
          <View className="action-icon">🏡</View>
          <Text className="action-text">我的花园</Text>
        </Button>
      </View>

      <View className="features">
        <Text className="section-title">核心功能</Text>
        <View className="feature-list">
          <View className="feature-card">
            <Image 
              className="feature-icon" 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20plant%20identification%20technology%20scan%20leaf%20digital%20interface&image_size=square" 
              mode="aspectFill"
            />
            <Text className="feature-name">植物识别</Text>
            <Text className="feature-desc">拍照识别上万种植物</Text>
          </View>
          <View className="feature-card">
            <Image 
              className="feature-icon" 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20disease%20diagnosis%20health%20check%20medical%20botany&image_size=square" 
              mode="aspectFill"
            />
            <Text className="feature-name">病虫害诊断</Text>
            <Text className="feature-desc">智能检测植物病害</Text>
          </View>
          <View className="feature-card">
            <Image 
              className="feature-icon" 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20garden%20planning%20design%20layout%20AR%20visualization&image_size=square" 
              mode="aspectFill"
            />
            <Text className="feature-name">花园规划</Text>
            <Text className="feature-desc">AR实景花园设计</Text>
          </View>
          <View className="feature-card">
            <Image 
              className="feature-icon" 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plant%20care%20reminder%20notification%20calendar%20smartphone&image_size=square" 
              mode="aspectFill"
            />
            <Text className="feature-name">养护提醒</Text>
            <Text className="feature-desc">个性化养护指导</Text>
          </View>
        </View>
      </View>

      <View className="tips-section">
        <Text className="section-title">今日园艺小贴士</Text>
        <View className="tip-card">
          <Image 
            className="tip-image" 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=watering%20plants%20morning%20sunlight%20garden%20care&image_size=landscape_4_3" 
            mode="aspectFill"
          />
          <View className="tip-content">
            <Text className="tip-title">夏季浇水小贴士</Text>
            <Text className="tip-text">夏季高温天气，建议在早晨或傍晚浇水，避免正午阳光直射时浇水，以免损伤植物根系。</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Home
