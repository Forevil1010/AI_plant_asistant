const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

process.env.RATE_LIMIT_MAX = '100'

const { createApp } = require('../src/app')

const jpegDataUrl = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString('base64')}`
let server
let baseUrl

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('reports backend health without exposing a credential', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.data.aiMode, 'mock')
  assert.equal(body.data.hasAiProvider, false)
})

test('returns a clearly marked mock identification when AI is not configured', async () => {
  const response = await fetch(`${baseUrl}/api/plant/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: jpegDataUrl })
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.data.isMock, true)
  assert.ok(body.data.result.name)
})

test('rejects invalid image payloads before returning mock data', async () => {
  const response = await fetch(`${baseUrl}/api/plant/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: 'not-an-image' })
  })
  const body = await response.json()

  assert.equal(response.status, 400)
  assert.equal(body.code, 400)
})

test('returns a clearly marked mock diagnosis when AI is not configured', async () => {
  const response = await fetch(`${baseUrl}/api/diagnose/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: '叶片发黄' })
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.data.isMock, true)
  assert.ok(body.data.result.title)
})

test('rejects browser origins outside the configured allowlist', async () => {
  const previousNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  const isolatedServer = createApp().listen(0, '127.0.0.1')
  await new Promise((resolve) => isolatedServer.once('listening', resolve))
  const isolatedUrl = `http://127.0.0.1:${isolatedServer.address().port}`

  try {
    const response = await fetch(`${isolatedUrl}/api/health`, {
      headers: { Origin: 'https://untrusted.example' }
    })
    assert.equal(response.status, 403)
  } finally {
    await new Promise((resolve) => isolatedServer.close(resolve))
    process.env.NODE_ENV = previousNodeEnv
  }
})
