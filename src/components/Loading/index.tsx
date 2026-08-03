import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  text?: string
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...' }) => {
  return (
    <View className="loading">
      <View className="loading__spinner" />
      <Text className="loading__text">{text}</Text>
    </View>
  )
}

export default Loading