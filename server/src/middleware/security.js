function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60_000
  const max = options.max || 20
  const now = options.now || Date.now
  const clients = new Map()

  return function rateLimit(req, res, next) {
    const currentTime = now()
    const key = req.ip || req.socket?.remoteAddress || 'unknown'
    let entry = clients.get(key)

    if (!entry || currentTime - entry.startedAt >= windowMs) {
      entry = { count: 0, startedAt: currentTime }
      clients.set(key, entry)
    }

    entry.count += 1
    const remaining = Math.max(max - entry.count, 0)
    const resetAt = entry.startedAt + windowMs
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.max(Math.ceil((resetAt - currentTime) / 1000), 1)))
      return res.status(429).json({
        code: 429,
        message: '请求过于频繁，请稍后再试',
        data: null
      })
    }

    if (clients.size > 1000) {
      for (const [clientKey, clientEntry] of clients) {
        if (currentTime - clientEntry.startedAt >= windowMs) clients.delete(clientKey)
      }
    }

    return next()
  }
}

function createCorsOptions(value = process.env.CORS_ORIGINS || '') {
  const allowedOrigins = new Set(value.split(',').map((origin) => origin.trim()).filter(Boolean))
  const localOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/

  return {
    origin(origin, callback) {
      const allowLocalDevelopment = process.env.NODE_ENV !== 'production' && localOrigin.test(origin || '')
      if (!origin || allowedOrigins.has(origin) || allowLocalDevelopment) {
        callback(null, true)
        return
      }

      const error = new Error('不允许的请求来源')
      error.status = 403
      callback(error)
    }
  }
}

function getRateLimitOptions() {
  return {
    windowMs: parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
    max: parsePositiveInteger(process.env.RATE_LIMIT_MAX, 20)
  }
}

module.exports = {
  createCorsOptions,
  createRateLimiter,
  getRateLimitOptions
}
