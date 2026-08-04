const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const DEFAULT_MAX_IMAGE_BYTES = 4 * 1024 * 1024

class RequestValidationError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'RequestValidationError'
    this.status = status
  }
}

function hasMatchingSignature(buffer, mimeType) {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }
  if (mimeType === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
  }
  return false
}

function parseImageDataUrl(dataUrl, maxBytes = DEFAULT_MAX_IMAGE_BYTES) {
  if (typeof dataUrl !== 'string' || !dataUrl) {
    throw new RequestValidationError('缺少图片数据')
  }

  const match = dataUrl.match(/^data:([^;,]+);base64,([a-zA-Z0-9+/=\s]+)$/)
  if (!match || !ALLOWED_MIME_TYPES.has(match[1].toLowerCase())) {
    throw new RequestValidationError('仅支持 JPEG、PNG 或 WebP 图片')
  }

  const mimeType = match[1].toLowerCase()
  const base64 = match[2].replace(/\s/g, '')
  const buffer = Buffer.from(base64, 'base64')
  const normalizedInput = base64.replace(/=+$/, '')
  const normalizedOutput = buffer.toString('base64').replace(/=+$/, '')

  if (!base64 || normalizedInput !== normalizedOutput || !hasMatchingSignature(buffer, mimeType)) {
    throw new RequestValidationError('图片数据无效或文件类型不匹配')
  }
  if (buffer.length > maxBytes) {
    throw new RequestValidationError(`图片不能超过 ${Math.floor(maxBytes / 1024 / 1024)} MB`, 413)
  }

  return { base64, mimeType, byteLength: buffer.length }
}

module.exports = {
  DEFAULT_MAX_IMAGE_BYTES,
  RequestValidationError,
  parseImageDataUrl
}
