import React from 'react'
import Taro from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { compressImage } from '../../utils/image'
import './index.scss'

interface ImageUploaderProps {
  value?: string
  title?: string
  hint?: string
  compact?: boolean
  compress?: boolean
  onSelect: (imagePath: string) => void
  onRemove?: () => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  title = '拍照或从相册选择',
  hint = '尽量保持主体完整、光线自然、画面清晰',
  compact = false,
  compress = true,
  onSelect,
  onRemove
}) => {
  const chooseImage = async () => {
    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      if (result.tempFilePaths[0]) {
        let path = result.tempFilePaths[0]
        if (compress) {
          path = await compressImage(path, { maxWidth: 1280, quality: 0.8 })
        }
        onSelect(path)
      }
    } catch (error) {
      if (!String(error).includes('cancel')) {
        Taro.showToast({ title: '无法读取图片，请检查权限', icon: 'none' })
      }
    }
  }

  if (value) {
    return (
      <View className={`image-uploader image-uploader--preview ${compact ? 'image-uploader--compact' : ''}`}>
        <Image className='image-uploader__image' src={value} mode='aspectFill' />
        <View className='image-uploader__actions'>
          <Text onClick={chooseImage}>更换图片</Text>
          {onRemove && <Text className='image-uploader__remove' onClick={onRemove}>移除</Text>}
        </View>
      </View>
    )
  }

  return (
    <View className={`image-uploader ${compact ? 'image-uploader--compact' : ''}`} onClick={chooseImage}>
      <Text className='image-uploader__mark'>+</Text>
      <View>
        <Text className='image-uploader__title'>{title}</Text>
        <Text className='image-uploader__hint'>{hint}</Text>
      </View>
    </View>
  )
}

export default ImageUploader
