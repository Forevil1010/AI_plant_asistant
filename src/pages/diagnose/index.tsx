import React, { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

const Diagnose: React.FC = () => {
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
        handleDiagnose(tempFilePath)
      }
    })
  }

  const handleDiagnose = async (imgPath: string) => {
    setIsLoading(true)
    setResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setResult({
      disease: '叶斑病',
      confidence: 92,
      description: '叶斑病是由真菌引起的常见植物病害，主要影响叶片，形成褐色或黑色斑点，严重时会导致叶片脱落。',
      symptoms: ['叶片出现褐色斑点', '斑点逐渐扩大', '叶片变黄脱落', '影响植物光合作用'],
      causes: ['高湿度环境', '通风不良', '浇水不当', '土壤积水'],
      solutions: [
        { step: 1, text: '及时摘除病叶并销毁，防止病菌扩散' },
        { step: 2, text: '改善通风条件，避免叶片积水' },
        { step: 3, text: '使用多菌灵或甲基托布津喷洒，每周一次，连续2-3次' },
        { step: 4, text: '控制浇水频率，避免土壤过湿' }
      ],
      prevention: '保持良好的通风环境，定期检查叶片，发现问题及时处理。避免在傍晚浇水，减少叶片结露时间。'
    })
    
    setIsLoading(false)
  }

  return (
    <View className="diagnose-container">
      <View className="diagnose-header">
        <Text className="page-title">病虫害诊断</Text>
        <Text className="page-subtitle">拍摄病株照片，AI帮您诊断问题</Text>
      </View>

      <View className="diagnose-guide">
        <Text className="guide-title">📸 拍摄提示</Text>
        <View className="guide-list">
          <Text className="guide-item">• 拍摄叶片正反面，清晰展示病斑</Text>
          <Text className="guide-item">• 确保光线充足，避免阴影</Text>
          <Text className="guide-item">• 靠近拍摄，聚焦病变部位</Text>
        </View>
      </View>

      <View className="image-upload-area">
        {!imageUrl ? (
          <View className="upload-placeholder" onClick={handleChooseImage}>
            <View className="microscope-icon">🔬</View>
            <Text className="upload-text">点击拍摄病株照片</Text>
            <Text className="upload-hint">支持拍摄叶片、茎秆等部位</Text>
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
          <Text className="loading-text">AI正在诊断中...</Text>
          <Text className="loading-hint">正在分析病变特征、比对病害数据库...</Text>
        </View>
      )}

      {result && !isLoading && (
        <View className="result-section">
          <View className="result-header">
            <View className="result-info">
              <Text className="result-disease">{result.disease}</Text>
              <View className="confidence-bar">
                <Text className="confidence-label">置信度</Text>
                <View className="bar-container">
                  <View className="bar-fill" style={{ width: `${result.confidence}%` }} />
                </View>
                <Text className="confidence-value">{result.confidence}%</Text>
              </View>
            </View>
          </View>

          <View className="result-description">
            <Text className="desc-title">病害描述</Text>
            <Text className="desc-text">{result.description}</Text>
          </View>

          <View className="symptoms-section">
            <Text className="section-title">症状表现</Text>
            <View className="symptom-list">
              {result.symptoms.map((symptom: string, index: number) => (
                <View key={index} className="symptom-item">
                  <View className="symptom-dot" />
                  <Text className="symptom-text">{symptom}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="causes-section">
            <Text className="section-title">发病原因</Text>
            <View className="cause-tags">
              {result.causes.map((cause: string, index: number) => (
                <View key={index} className="cause-tag">
                  <Text className="cause-text">{cause}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="solutions-section">
            <Text className="section-title">处理方案</Text>
            <View className="solution-list">
              {result.solutions.map((solution: any, index: number) => (
                <View key={index} className="solution-item">
                  <View className="solution-step">{solution.step}</View>
                  <Text className="solution-text">{solution.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="prevention-section">
            <Text className="section-title">预防措施</Text>
            <Text className="prevention-text">{result.prevention}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default Diagnose
