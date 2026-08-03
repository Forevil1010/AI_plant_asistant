import React, { useState } from 'react'
import { View, Image } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

interface ImageUploaderProps {
  onUpload: (imagePath: string, base64: string) => void
  placeholder?: string
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, placeholder = '点击上传图片' }) => {
  const [imagePath, setImagePath] = useState('')
  const [uploading, setUploading] = useState(false)

  const chooseImage = () => {
    Taro.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
        Taro.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType,
          success: async (result) => {
            const tempFilePath = result.tempFilePaths[0]
            setImagePath(tempFilePath)
            setUploading(true)

            try {
              const base64 = await Taro.getFileSystemManager().readFile({
                filePath: tempFilePath,
                encoding: 'base64'
              })
              onUpload(tempFilePath, `data:image/jpeg;base64,${base64.data}`)
            } catch (error) {
              console.error('Read image error:', error)
              Taro.showToast({ title: '图片读取失败', icon: 'error' })
            } finally {
              setUploading(false)
            }
          },
          fail: () => {
            Taro.showToast({ title: '选择图片失败', icon: 'error' })
          }
        })
      }
    })
  }

  return (
    <View className={`image-uploader ${uploading ? 'image-uploader--uploading' : ''}`} onClick={chooseImage}>
      {imagePath ? (
        <Image src={imagePath} mode="aspectFill" className="image-uploader__image" />
      ) : (
        <View className="image-uploader__placeholder">
          <View className="image-uploader__icon" />
          <Text className="image-uploader__text">{placeholder}</Text>
        </View>
      )}
      {uploading && (
        <View className="image-uploader__loading">
          <View className="image-uploader__spinner" />
          <Text className="image-uploader__loading-text">上传中...</Text>
        </View>
      )}
    </View>
  )
}

export default ImageUploader