import Taro from '@tarojs/taro'

function isH5(): boolean {
  if (typeof process !== 'undefined' && process.env && process.env.TARO_ENV) {
    return process.env.TARO_ENV === 'h5'
  }
  return typeof window !== 'undefined'
}

export async function compressImage(
  filePath: string,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 1280, quality = 0.8 } = options

  if (isH5()) {
    return compressImageH5(filePath, maxWidth, quality)
  }

  return compressImageMini(filePath, quality)
}

async function compressImageH5(filePath: string, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(filePath)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(filePath)
            return
          }
          const url = URL.createObjectURL(blob)
          resolve(url)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      resolve(filePath)
    }

    img.src = filePath
  })
}

async function compressImageMini(filePath: string, quality: number): Promise<string> {
  try {
    const result = await Taro.compressImage({
      src: filePath,
      quality: Math.round(quality * 100)
    })
    return result.tempFilePath
  } catch {
    return filePath
  }
}

export async function fileToBase64(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isH5()) {
      if (filePath.startsWith('data:')) {
        resolve(filePath)
        return
      }
      fetch(filePath)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.blob()
        })
        .then((blob) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        .catch(reject)
    } else {
      Taro.getFileSystemManager().readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          const base64 = String(res.data)
          resolve(`data:${detectImageMimeType(filePath, base64)};base64,${base64}`)
        },
        fail: reject
      })
    }
  })
}

function detectImageMimeType(filePath: string, base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('iVBOR')) return 'image/png'
  if (base64.startsWith('UklGR')) return 'image/webp'

  const cleanPath = filePath.split(/[?#]/)[0].toLowerCase()
  if (cleanPath.endsWith('.png')) return 'image/png'
  if (cleanPath.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}
