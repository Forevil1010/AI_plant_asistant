const assert = require('node:assert/strict')
const test = require('node:test')

const { ArkServiceError, chat, getArkConfig, isConfigured } = require('../src/utils/ark')

const configuredEnv = {
  ARK_API_KEY: 'ark-test-key',
  ARK_MODEL: 'test-model',
  ARK_BASE_URL: 'https://ark.example/v3/',
  ARK_TIMEOUT_MS: '1000'
}

test('treats empty and placeholder Ark keys as unconfigured', () => {
  assert.equal(isConfigured({ ARK_API_KEY: '' }), false)
  assert.equal(isConfigured({ ARK_API_KEY: 'ark-xxxxxxxxx-xxxxx' }), false)
  assert.equal(isConfigured(configuredEnv), true)
})

test('normalizes Ark configuration values', () => {
  assert.deepEqual(getArkConfig(configuredEnv), {
    apiKey: 'ark-test-key',
    model: 'test-model',
    baseUrl: 'https://ark.example/v3',
    timeoutMs: 1000
  })
})

test('sends image and prompt to Ark and returns message text', async () => {
  let captured
  const fetchImpl = async (url, options) => {
    captured = { url, options }
    return {
      ok: true,
      status: 200,
      async json() {
        return { choices: [{ message: { content: [{ text: '{"name":"绿萝"}' }] } }] }
      }
    }
  }

  const result = await chat({
    prompt: 'identify',
    imageBase64: 'abc',
    mimeType: 'image/png'
  }, { env: configuredEnv, fetchImpl })

  assert.equal(result, '{"name":"绿萝"}')
  assert.equal(captured.url, 'https://ark.example/v3/chat/completions')
  assert.equal(captured.options.headers.Authorization, 'Bearer ark-test-key')
  const requestBody = JSON.parse(captured.options.body)
  assert.equal(requestBody.model, 'test-model')
  assert.equal(requestBody.messages[0].content[0].image_url.url, 'data:image/png;base64,abc')
})

test('does not expose the Ark error response body', async () => {
  const fetchImpl = async () => ({ ok: false, status: 401 })
  await assert.rejects(
    chat({ prompt: 'identify' }, { env: configuredEnv, fetchImpl }),
    (error) => error instanceof ArkServiceError && error.code === 'http_error' && !error.message.includes('ark-test-key')
  )
})

test('aborts an Ark request after the configured timeout', async () => {
  const env = { ...configuredEnv, ARK_TIMEOUT_MS: '10' }
  const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
    const guardTimer = setTimeout(() => reject(new Error('Abort signal was not triggered')), 100)
    options.signal.addEventListener('abort', () => {
      clearTimeout(guardTimer)
      reject(options.signal.reason)
    }, { once: true })
  })

  await assert.rejects(
    chat({ prompt: 'identify' }, { env, fetchImpl }),
    (error) => error instanceof ArkServiceError && error.code === 'timeout'
  )
})
