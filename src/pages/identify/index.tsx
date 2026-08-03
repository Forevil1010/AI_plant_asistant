import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import { identifyPlant } from '../../services/mock-ai'
import { useApp, createId } from '../../store'
import { PlantKnowledge } from '../../types'
import './index.scss'

const Identify: React.FC = () => {
  const { savePlant, addIdentifyHistory } = useApp()
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PlantKnowledge | null>(null)
  const [added, setAdded] = useState(false)

  const analyze = async () => {
    if (!imageUrl) {
      Taro.showToast({ title: '请先选择植物图片', icon: 'none' })
      return
    }
    setLoading(true)
    setResult(null)
    setAdded(false)
    try {
      const identified = await identifyPlant(imageUrl)
      setResult(identified)
      addIdentifyHistory({ id: createId('identify'), imageUrl, result: identified, createdAt: new Date().toISOString() })
    } catch {
      Taro.showToast({ title: '识别失败，请稍后重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const addToGarden = () => {
    if (!result || added) return
    const now = new Date().toISOString()
    savePlant({
      id: createId('plant'),
      knowledgeId: result.id,
      name: result.name,
      nickname: result.name,
      imageUrl: result.imageUrl,
      location: '室内',
      acquiredAt: now.slice(0, 10),
      note: '由植物识别添加',
      createdAt: now
    })
    setAdded(true)
    Taro.showToast({ title: '已加入花园', icon: 'success' })
  }

  return (
    <View className='page-shell identify-page'>
      <View className='identify-heading'>
        <View>
          <Text className='page-title'>拍一张植物照片</Text>
          <Text className='page-copy'>尽量包含完整叶片或花朵，使用自然光并保持画面清晰。</Text>
        </View>
        <Text className='section-link' onClick={() => Taro.navigateTo({ url: '/pages/history/index?type=identify' })}>识别历史</Text>
      </View>

      <ImageUploader
        value={imageUrl}
        onSelect={(path) => { setImageUrl(path); setResult(null); setAdded(false) }}
        onRemove={() => { setImageUrl(''); setResult(null); setAdded(false) }}
      />
      <Button className='primary-button identify-submit' disabled={!imageUrl || loading} loading={loading} onClick={analyze}>
        {loading ? '正在分析图片' : '开始识别'}
      </Button>

      {loading && <Loading text='正在比对植物特征' />}

      {result && (
        <View className='identify-result'>
          <View className='result-heading'>
            <View><Text className='result-kicker'>最可能的结果</Text><Text className='result-name'>{result.name}</Text><Text className='result-latin'>{result.latinName}</Text></View>
            <View className='confidence-box'><Text>{Math.round(result.confidence * 100)}%</Text><Text>可信度</Text></View>
          </View>
          <View className='tag-row'>{result.tags.map((tag) => <Text key={tag} className='pill'>{tag}</Text>)}</View>
          <Text className='result-summary'>{result.summary}</Text>

          <View className='section'>
            <Text className='section-title'>养护建议</Text>
            <View className='care-list card'>
              {[
                ['光照', result.care.light], ['浇水', result.care.water], ['温度', result.care.temperature],
                ['土壤', result.care.soil], ['施肥', result.care.fertilizer]
              ].map(([label, value]) => <View key={label} className='care-row'><Text>{label}</Text><Text>{value}</Text></View>)}
            </View>
          </View>

          <View className='safety-note'><Text>人宠安全</Text><Text>{result.safety}</Text></View>
          {added ? (
            <Button className='secondary-button result-button' onClick={() => Taro.switchTab({ url: '/pages/garden/index' })}>已加入，查看花园</Button>
          ) : (
            <Button className='primary-button result-button' onClick={addToGarden}>加入我的花园</Button>
          )}
        </View>
      )}

      <Text className='privacy-note'>当前为本地模拟识别，图片不会上传到网络。接入真实 AI 服务前会另行说明数据用途。</Text>
    </View>
  )
}

export default Identify
