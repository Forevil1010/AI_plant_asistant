export interface AiBuildConfig {
  apiBaseUrl: string
  useMock: boolean
}

type EnvValues = Record<string, string | undefined>

export function parseEnvContent(content: string): Record<string, string> {
  const values: Record<string, string> = {}

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator < 0) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }

  return values
}

export function resolveAiBuildConfig(fileEnv: EnvValues = {}, runtimeEnv: EnvValues = process.env): AiBuildConfig {
  const apiBaseUrl = (runtimeEnv.TARO_APP_API_BASE_URL ?? fileEnv.TARO_APP_API_BASE_URL ?? '').trim().replace(/\/$/, '')
  const mockValue = (runtimeEnv.TARO_APP_USE_MOCK ?? fileEnv.TARO_APP_USE_MOCK ?? '').trim().toLowerCase()

  if (mockValue && mockValue !== 'true' && mockValue !== 'false') {
    throw new Error('TARO_APP_USE_MOCK 只能设置为 true 或 false')
  }

  const useMock = mockValue ? mockValue === 'true' : !apiBaseUrl
  if (!useMock && !apiBaseUrl) {
    throw new Error('启用真实 AI 时必须配置 TARO_APP_API_BASE_URL')
  }

  return { apiBaseUrl, useMock }
}
