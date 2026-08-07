import React from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { findPlantKnowledge } from '../../data/plants'
import { createId, useApp } from '../../store'
import { PlantKnowledge as PlantKnowledgeType } from '../../types'
import { readPlantSearchResult } from '../../utils/plant-search-cache'
import './index.scss'

const PlantKnowledge: React.FC = () => {
  const { savePlant } = useApp()
  const [knowledgeId, setKnowledgeId] = React.useState('')
  const [aiKnowledge, setAiKnowledge] = React.useState<PlantKnowledgeType | undefined>()

  useLoad((options) => {
    const id = options.id || ''
    setKnowledgeId(id)
    setAiKnowledge(options.source === 'ai' ? readPlantSearchResult(id) : undefined)
  })

  const knowledge = aiKnowledge || findPlantKnowledge(knowledgeId)

  if (!knowledge) {
    return (
      <View className='page-shell'>
        <View className='empty-panel card'>
          <Text className='empty-title'>没有找到该植物资料</Text>
          <Text className='empty-copy'>它可能已不在内置知识库中。</Text>
        </View>
      </View>
    )
  }

  const addToGarden = () => {
    const now = new Date().toISOString()
    savePlant({
      id: createId('plant'),
      knowledgeId: knowledge.id,
      name: knowledge.name,
      nickname: '',
      imageUrl: knowledge.imageUrl,
      location: '',
      acquiredAt: now,
      note: '',
      createdAt: now
    })
    Taro.showToast({ title: '已加入花园', icon: 'success' })
  }

  const careItems: Array<[string, string]> = [
    ['光照', knowledge.care.light],
    ['浇水', knowledge.care.water],
    ['温度', knowledge.care.temperature],
    ['土壤', knowledge.care.soil],
    ['施肥', knowledge.care.fertilizer],
    ['湿度', knowledge.care.humidity]
  ]

  return (
    <View className='plant-knowledge-page'>
      {knowledge.imageUrl ? (
        <Image className='knowledge-cover' src={knowledge.imageUrl} mode='aspectFill' />
      ) : (
        <View className='knowledge-cover knowledge-cover--placeholder'><Text>AI 植物资料</Text></View>
      )}
      <View className='knowledge-content'>
        {aiKnowledge && <Text className='knowledge-source'>火山方舟 AI 搜索结果</Text>}
        <View className='knowledge-identity'>
          <Text className='knowledge-name'>{knowledge.name}</Text>
          <Text className='knowledge-latin'>{knowledge.latinName}</Text>
          {knowledge.aliases.length > 0 && <Text className='knowledge-alias'>别名：{knowledge.aliases.join('、')}</Text>}
        </View>

        {knowledge.tags.length > 0 && (
          <View className='tag-row'>
            {knowledge.tags.map((tag) => <Text key={tag} className='pill'>{tag}</Text>)}
          </View>
        )}

        <Text className='knowledge-summary'>{knowledge.summary}</Text>

        <View className='section'>
          <Text className='section-title'>养护建议</Text>
          <View className='care-list card'>
            {careItems.map(([label, value]) => (
              <View key={label} className='care-row'><Text>{label}</Text><Text>{value}</Text></View>
            ))}
          </View>
        </View>

        {knowledge.safety && (
          <View className='safety-note'>
            <Text>人宠安全</Text>
            <Text>{knowledge.safety}</Text>
          </View>
        )}

        <Button className='primary-button' onClick={addToGarden}>加入我的花园</Button>
      </View>
    </View>
  )
}

export default PlantKnowledge
