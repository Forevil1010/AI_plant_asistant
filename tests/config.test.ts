import { parseEnvContent, resolveAiBuildConfig } from '../config/env'

describe('AI build configuration', () => {
  it('uses safe mock defaults when no backend is configured', () => {
    expect(resolveAiBuildConfig({}, {})).toEqual({ apiBaseUrl: '', useMock: true })
  })

  it('enables the real backend only when an API URL is configured', () => {
    expect(resolveAiBuildConfig({ TARO_APP_API_BASE_URL: 'https://api.example.com/api/' }, {}))
      .toEqual({ apiBaseUrl: 'https://api.example.com/api', useMock: false })
  })

  it('rejects real mode without a backend URL', () => {
    expect(() => resolveAiBuildConfig({ TARO_APP_USE_MOCK: 'false' }, {}))
      .toThrow('TARO_APP_API_BASE_URL')
  })

  it('lets runtime variables override the local env file', () => {
    expect(resolveAiBuildConfig(
      { TARO_APP_API_BASE_URL: 'http://localhost:3000/api', TARO_APP_USE_MOCK: 'false' },
      { TARO_APP_USE_MOCK: 'true' }
    )).toEqual({ apiBaseUrl: 'http://localhost:3000/api', useMock: true })
  })

  it('parses comments and quoted values from env files', () => {
    expect(parseEnvContent('# comment\nA="one"\nB=two\r\n')).toEqual({ A: 'one', B: 'two' })
  })
})
