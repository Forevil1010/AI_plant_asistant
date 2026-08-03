import React, { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

const Identify: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setImageUrl(tempFilePath)
        handleIdentify(tempFilePath)
      }
    })
  }

  const handleIdentify = async (imgPath: string) => {
    setIsLoading(true)
    setResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setResult({
      name: '绿萝',
      scientificName: 'Epipremnum aureum',
      family: '天南星科',
      careLevel: '简单',
      description: '绿萝是一种非常受欢迎的室内观叶植物，具有很强的空气净化能力。它可以在低光照条件下生长，非常适合办公室和家庭环境。',
      careTips: [
        { icon: '💧', text: '浇水：每周浇水1-2次，保持土壤湿润但不要积水' },
        { icon: '☀️', text: '光照：喜阴，避免阳光直射，适合放在明亮的散射光处' },
        { icon: '🌡️', text: '温度：适宜温度15-30℃，冬季注意保暖' },
        { icon: '🌿', text: '施肥：每月施一次稀释的液体肥料' }
      ],
      toxicity: '对宠物有毒性，误食可能引起呕吐',
      images: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20green%20leaves%20indoors%20beautiful&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20care%20watering%20garden&image_size=square'
      ]
    })
    
    setIsLoading(false)
  }

  const handleAddToGarden = () => {
    Taro.showToast({
      title: '已添加到花园',
      icon: 'success'
    })
  }

  return (
    <View className="identify-container">
      <View className="identify-header">
        <Text className="page-title">植物识别</Text>
        <Text className="page-subtitle">拍照或上传图片，AI帮您识别植物</Text>
      </View>

      <View className="image-upload-area">
        {!imageUrl ? (
          <View className="upload-placeholder" onClick={handleChooseImage}>
            <View className="camera-icon">📷</View>
            <Text className="upload-text">点击拍照或上传图片</Text>
            <Text className="upload-hint">支持拍摄叶片、花朵、果实等部位</Text>
          </View>
        ) : (
          <View className="image-preview">
            <Image src={imageUrl} mode="aspectFill" className="preview-image" />
            <Button className="reupload-btn" onClick={handleChooseImage}>重新拍摄</Button>
          </View>
        )}
      </View>

      {isLoading && (
        <View className="loading-overlay">
          <Loading className="loading-icon" />
          <Text className="loading-text">AI正在识别中...</Text>
          <Text className="loading-hint">正在分析叶片特征、比对植物数据库...</Text>
        </View>
      )}

      {result && !isLoading && (
        <View className="result-section">
          <View className="result-header">
            <Text className="result-name">{result.name}</Text>
            <Text className="result-scientific">{result.scientificName}</Text>
          </View>

          <View className="result-stats">
            <View className="stat-item">
              <Text className="stat-label">科属</Text>
              <Text className="stat-value">{result.family}</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-label">养护难度</Text>
              <Text className="stat-value care-level">{result.careLevel}</Text>
            </View>
          </View>

          <View className="result-description">
            <Text className="desc-text">{result.description}</Text>
          </View>

          <View className="care-tips">
            <Text className="tips-title">养护要点</Text>
            {result.careTips.map((tip: any, index: number) => (
              <View key={index} className="tip-item">
                <Text className="tip-icon">{tip.icon}</Text>
                <Text className="tip-text">{tip.text}</Text>
              </View>
            ))}
          </View>

          {result.toxicity && (
            <View className="toxicity-warning">
              <Text className="warning-icon">⚠️</Text>
              <Text className="warning-text">{result.toxicity}</Text>
            </View>
          )}

          <Button className="add-btn" onClick={handleAddToGarden}>
            添加到我的花园
          </Button>
        </View>
      )}
    </View>
  )
}

export default Identify
