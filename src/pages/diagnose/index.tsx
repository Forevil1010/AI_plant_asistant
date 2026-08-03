import React, { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Picker, Text, Textarea, View } from '@tarojs/components'
import ImageUploader from '../../components/ImageUploader'
import Loading from '../../components/Loading'
import { diagnosePlant } from '../../services/mock-ai'
import { createId, useApp } from '../../store'
import { DiagnosisResult } from '../../types'
import './index.scss'

const Diagnose: React.FC = () => {
  const { state, addDiagnosisHistory } = useApp()
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [plantIndex, setPlantIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const plantOptions = useMemo(() => ['不关联花园植物', ...state.gardenPlants.map((plant) => plant.nickname || plant.name)], [state.gardenPlants])

  const diagnose = async () => {
    if (!imageUrl && !description.trim()) {
      Taro.showToast({ title: '请添加图片或描述症状', icon: 'none' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const diagnosed = await diagnosePlant(description, Boolean(imageUrl))
      setResult(diagnosed)
      addDiagnosisHistory({
        id: createId('diagnosis'),
        imageUrl: imageUrl || undefined,
        description: description.trim(),
        result: diagnosed,
        plantId: plantIndex > 0 ? state.gardenPlants[plantIndex - 1]?.id : undefined,
        createdAt: new Date().toISOString()
      })
    } catch {
      Taro.showToast({ title: '诊断失败，请稍后重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='page-shell diagnose-page'>
      <View className='diagnose-heading'>
        <View><Text className='page-title'>植物哪里不舒服？</Text><Text className='page-copy'>可以只上传图片、只描述症状，也可以同时提供两者。</Text></View>
        <Text className='section-link' onClick={() => Taro.navigateTo({ url: '/pages/history/index?type=diagnose' })}>诊断历史</Text>
      </View>

      <Text className='field-label'>异常部位图片（选填）</Text>
      <ImageUploader compact value={imageUrl} title='添加一张清晰图片' hint='建议拍摄叶片正反面或茎基部' onSelect={(path) => { setImageUrl(path); setResult(null) }} onRemove={() => { setImageUrl(''); setResult(null) }} />

      <Text className='field-label'>症状描述（选填）</Text>
      <Textarea className='field-textarea' value={description} maxlength={500} placeholder='例如：底部叶片发黄，盆土一周都没有干，持续约 5 天……' onInput={(event) => { setDescription(event.detail.value); setResult(null) }} />
      <Text className='character-count'>{description.length} / 500</Text>

      <Text className='field-label'>关联到我的花园（选填）</Text>
      <Picker mode='selector' range={plantOptions} value={plantIndex} onChange={(event) => setPlantIndex(Number(event.detail.value))}>
        <View className='picker-field'>{plantOptions[plantIndex]}</View>
      </Picker>

      <Button className='primary-button diagnose-submit' disabled={(!imageUrl && !description) || loading} loading={loading} onClick={diagnose}>
        {loading ? '正在分析症状' : '开始诊断'}
      </Button>
      {loading && <Loading text='正在整理可能原因和处理步骤' />}

      {result && (
        <View className='diagnosis-result'>
          <Text className='diagnosis-kicker'>智能诊断结果</Text>
          <Text className='diagnosis-title'>{result.title}</Text>
          <View className='diagnosis-meta'><Text className='pill'>{result.confidenceLabel}</Text><Text className={`severity severity--${result.severity}`}>{result.severity}</Text></View>

          <View className='diagnosis-block'><Text className='diagnosis-block__title'>判断依据</Text>{result.evidence.map((item) => <View key={item} className='bullet-row'><Text className='bullet-dot' /><Text>{item}</Text></View>)}</View>
          <View className='diagnosis-block'><Text className='diagnosis-block__title'>可能原因</Text>{result.causes.map((item, index) => <View key={item} className='number-row'><Text>{index + 1}</Text><Text>{item}</Text></View>)}</View>
          <View className='action-plan'><Text className='diagnosis-block__title'>现在可以这样处理</Text>{result.actions.map((item, index) => <View key={item} className='action-step'><Text>{index + 1}</Text><Text>{item}</Text></View>)}</View>
          <View className='follow-up'><Text>后续观察</Text><Text>{result.followUp}</Text></View>
          <View className='safety-note'><Text>安全提醒</Text><Text>{result.safety}</Text></View>
        </View>
      )}

      <Text className='diagnosis-disclaimer'>当前结果由本地模拟规则生成，仅用于验证产品流程，不能替代专业植物病理检测。</Text>
    </View>
  )
}

export default Diagnose
