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
          try {
            path = await compressImage(path, { maxWidth: 1280, quality: 0.8 })
          } catch {
            // 压缩失败时回退到原图，避免阻断流程
          }
        }
        onSelect(path)
      }
    } catch (error) {
      const message = String(error)
      if (message.includes('cancel')) {
        return
      }
      // 权限拒绝：引导用户去设置开启相机/相册权限
      if (message.includes('auth') || message.includes('permission') || message.includes('deny')) {
        const modal = await Taro.showModal({
          title: '需要相机和相册权限',
          content: '为了选择或拍摄植物图片，请在设置中开启相机和相册权限。',
          confirmText: '去设置',
          cancelText: '取消'
        })
        if (modal.confirm) {
          try {
            await Taro.openSetting()
          } catch {
            Taro.showToast({ title: '打开设置失败', icon: 'none' })
          }
        }
        return
      }
      Taro.showToast({ title: '无法读取图片，请稍后重试', icon: 'none' })
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
