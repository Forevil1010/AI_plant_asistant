import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface EmptyProps {
  icon?: string
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
}

const Empty: React.FC<EmptyProps> = ({ icon = '🌱', title, description, actionText, onAction }) => {
  return (
    <View className='empty'>
      <Text className='empty__icon'>{icon}</Text>
      <Text className='empty__title'>{title}</Text>
      {description && <Text className='empty__description'>{description}</Text>}
      {actionText && onAction && (
        <View className='empty__action' onClick={onAction}>
          {actionText}
        </View>
      )}
    </View>
  )
}

export default Empty
