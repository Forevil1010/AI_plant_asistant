import React, { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { useApp } from '../../store'
import { AiResultSource } from '../../types'
import { formatDateTime } from '../../utils/date'
import './index.scss'

const sourceLabels: Record<AiResultSource, string> = {
  ai: '真实 AI',
  mock: '本地模拟',
  fallback: '异常降级'
}

const History: React.FC = () => {
  const { state, removeIdentifyHistory, removeDiagnosisHistory } = useApp()
  const [type, setType] = useState<'identify' | 'diagnose'>('identify')

  useLoad((options) => {
    const selected = options.type === 'diagnose' ? 'diagnose' : 'identify'
    setType(selected)
    Taro.setNavigationBarTitle({ title: selected === 'identify' ? '识别历史' : '诊断历史' })
  })

  const remove = async (id: string) => {
    const response = await Taro.showModal({ title: '删除这条记录？', content: '删除后无法恢复。', confirmColor: '#A33D34' })
    if (!response.confirm) return
    if (type === 'identify') removeIdentifyHistory(id)
    else removeDiagnosisHistory(id)
  }

  return (
    <View className='page-shell history-page'>
      <View className='page-heading'><Text className='page-title'>{type === 'identify' ? '识别历史' : '诊断历史'}</Text><Text className='page-copy'>最近的结果仅保存在当前设备中。</Text></View>
      {type === 'identify' ? (
        state.identifyHistory.length ? <View>{state.identifyHistory.map((item) => (
          <View key={item.id} className='identify-history card'>
            <Image src={item.imageUrl || item.result.imageUrl} mode='aspectFill' />
            <View className='history-body'>
              <View className='history-head'><View><Text className='history-title'>{item.result.name}</Text><Text className='history-meta'>可信度 {Math.round(item.result.confidence * 100)}%</Text></View><Text className='history-delete' onClick={() => remove(item.id)}>删除</Text></View>
              {item.source && <Text className={`history-source history-source--${item.source}`}>{sourceLabels[item.source]}</Text>}
              <Text className='history-summary'>{item.result.summary}</Text><Text className='history-time'>{formatDateTime(item.createdAt)}</Text>
            </View>
          </View>
        ))}</View> : <View className='empty-panel card'><Text className='empty-title'>还没有识别记录</Text><Text className='empty-copy'>完成一次植物识别后，结果会出现在这里。</Text></View>
      ) : (
        state.diagnosisHistory.length ? <View>{state.diagnosisHistory.map((item) => (
          <View key={item.id} className='diagnosis-history card'>
            <View className='history-head'><View><Text className='history-title'>{item.result.title}</Text><Text className='history-meta'>{item.result.confidenceLabel} · {item.result.severity}</Text></View><Text className='history-delete' onClick={() => remove(item.id)}>删除</Text></View>
            {item.source && <Text className={`history-source history-source--${item.source}`}>{sourceLabels[item.source]}</Text>}
            {item.imageUrl && <Image className='diagnosis-history__image' src={item.imageUrl} mode='aspectFill' />}
            <Text className='diagnosis-history__input'>{item.description || (item.imageUrl ? '仅提交了植物图片' : '未记录输入内容')}</Text>
            <View className='diagnosis-history__advice'><Text>首要建议</Text><Text>{item.result.actions[0]}</Text></View>
            <Text className='history-time'>{formatDateTime(item.createdAt)}</Text>
          </View>
        ))}</View> : <View className='empty-panel card'><Text className='empty-title'>还没有诊断记录</Text><Text className='empty-copy'>提交图片或症状描述后，诊断结果会出现在这里。</Text></View>
      )}
    </View>
  )
}

export default History
