import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

type ButtonType = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children
}) => {
  return (
    <View
      className={`button button--${type} button--${size} ${disabled || loading ? 'button--disabled' : ''}`}
      onClick={() => !disabled && !loading && onClick()}
    >
      {loading ? (
        <View className='button__loading' />
      ) : (
        children
      )}
    </View>
  )
}

export default Button
