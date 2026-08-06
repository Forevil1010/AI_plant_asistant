/**
 * 火山方舟 (Volcengine Ark) API 调用工具
 * 使用 Doubao-Seed-2.0-Mini 视觉多模态模型
 */

const ARK_API_KEY = process.env.ARK_API_KEY || ''
const ARK_MODEL = process.env.ARK_MODEL || 'doubao-seed-2-0-mini-260428'
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'

function isConfigured() {
  return Boolean(ARK_API_KEY)
}

/**
 * 调用火山方舟 Chat API，支持文本 + 图片输入
 * @param {Object} params
 * @param {string} params.prompt - 文本提示词
 * @param {string} [params.imageBase64] - 图片 base64 数据（不含 data: 前缀）
 * @param {string} [params.mimeType] - 图片 MIME 类型，如 image/jpeg
 * @param {number} [params.maxTokens] - 最大输出 token 数
 * @param {number} [params.temperature] - 采样温度 0~2
 * @returns {Promise<string>} 模型返回的文本内容
 */
async function chat({ prompt, imageBase64, mimeType = 'image/jpeg', maxTokens = 4096, temperature = 0.7 }) {
  if (!isConfigured()) {
    throw new Error('未配置 ARK_API_KEY')
  }

  const content = []

  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${imageBase64}`
      }
    })
  }

  content.push({
    type: 'text',
    text: prompt
  })

  const body = {
    model: ARK_MODEL,
    messages: [
      {
        role: 'user',
        content
      }
    ],
    max_tokens: maxTokens,
    temperature
  }

  const response = await fetch(`${ARK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ARK_API_KEY}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ark API ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content || ''

  if (!text) {
    throw new Error('Ark API 返回空内容')
  }

  return text
}

module.exports = { isConfigured, chat }
