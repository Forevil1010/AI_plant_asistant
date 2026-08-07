const DEFAULT_MODEL = 'doubao-seed-2-0-mini-260428'
const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'
const DEFAULT_TIMEOUT_MS = 25_000

class ArkServiceError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ArkServiceError'
    this.code = code
    this.status = status
  }
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getArkConfig(env = process.env) {
  return {
    apiKey: String(env.ARK_API_KEY || '').trim(),
    model: String(env.ARK_MODEL || DEFAULT_MODEL).trim(),
    baseUrl: String(env.ARK_BASE_URL || DEFAULT_BASE_URL).trim().replace(/\/$/, ''),
    timeoutMs: parsePositiveInteger(env.ARK_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)
  }
}

function isConfigured(env = process.env) {
  const { apiKey } = getArkConfig(env)
  if (!apiKey) return false
  return !/^ark-x+(?:-x+)*$/i.test(apiKey) && !/^(?:your|replace|example)[-_]/i.test(apiKey)
}

function readMessageText(content) {
  if (typeof content === 'string') return content.trim()
  if (!Array.isArray(content)) return ''
  return content
    .map((item) => typeof item?.text === 'string' ? item.text.trim() : '')
    .filter(Boolean)
    .join('\n')
}

async function chat(
  { prompt, imageBase64, mimeType = 'image/jpeg', maxTokens = 4096, temperature = 0.7 },
  { env = process.env, fetchImpl = global.fetch } = {}
) {
  const config = getArkConfig(env)
  if (!isConfigured(env)) {
    throw new ArkServiceError('未配置有效的 ARK_API_KEY', 'not_configured')
  }
  if (typeof fetchImpl !== 'function') {
    throw new ArkServiceError('当前 Node.js 运行时不支持 fetch', 'fetch_unavailable')
  }

  const content = []
  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${imageBase64}` }
    })
  }
  content.push({ type: 'text', text: prompt })

  let response
  try {
    response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content }],
        max_tokens: maxTokens,
        temperature
      }),
      signal: AbortSignal.timeout(config.timeoutMs)
    })
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new ArkServiceError('Ark API 请求超时', 'timeout')
    }
    throw new ArkServiceError('Ark API 网络请求失败', 'network_error')
  }

  if (!response.ok) {
    throw new ArkServiceError(`Ark API 请求失败 (${response.status})`, 'http_error', response.status)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new ArkServiceError('Ark API 返回了无效 JSON', 'invalid_json')
  }

  const text = readMessageText(data?.choices?.[0]?.message?.content)
  if (!text) {
    throw new ArkServiceError('Ark API 返回空内容', 'empty_content')
  }
  return text
}

module.exports = {
  ArkServiceError,
  chat,
  getArkConfig,
  isConfigured
}
