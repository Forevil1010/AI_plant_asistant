const assert = require('node:assert/strict')
const test = require('node:test')

const { createRateLimiter } = require('../src/middleware/security')

function invoke(middleware) {
  const response = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this }
  }
  let continued = false
  middleware({ ip: '127.0.0.1' }, response, () => { continued = true })
  return { continued, response }
}

test('limits repeated AI requests and resets after the time window', () => {
  let currentTime = 0
  const limiter = createRateLimiter({ max: 2, windowMs: 1000, now: () => currentTime })

  assert.equal(invoke(limiter).continued, true)
  assert.equal(invoke(limiter).continued, true)
  assert.equal(invoke(limiter).response.statusCode, 429)

  currentTime = 1001
  assert.equal(invoke(limiter).continued, true)
})
