import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface CardProps {
  className?: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <View className={`card ${className || ''}`}>
      {children}
    </View>
  )
}

export default Card