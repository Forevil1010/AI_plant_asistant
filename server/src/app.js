require('dotenv').config()

const express = require('express')
const cors = require('cors')

const plantRoutes = require('./routes/plant')
const diagnoseRoutes = require('./routes/diagnose')
const ark = require('./utils/ark')
const { createCorsOptions, createRateLimiter, getRateLimitOptions } = require('./middleware/security')

function createApp() {
  const app = express()
  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(cors(createCorsOptions()))
  app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '6mb', strict: true }))

  app.get('/api/health', (_req, res) => {
    res.json({
      code: 0,
      message: 'ok',
      data: {
        status: 'running',
        aiMode: ark.isConfigured() ? 'ark' : 'mock',
        hasAiProvider: ark.isConfigured()
      }
    })
  })

  const aiRateLimiter = createRateLimiter(getRateLimitOptions())
  app.use('/api/plant', aiRateLimiter, plantRoutes)
  app.use('/api/diagnose', aiRateLimiter, diagnoseRoutes)

  app.use((_req, res) => {
    res.status(404).json({ code: 404, message: '接口不存在', data: null })
  })

  app.use((err, _req, res, _next) => {
    const status = err.status || (err.type === 'entity.too.large' ? 413 : 500)
    if (status >= 500) console.error('Server error:', err)
    res.status(status).json({
      code: status,
      message: status >= 500 ? '服务器内部错误' : err.message,
      data: null
    })
  })

  return app
}

function startServer(port = Number(process.env.PORT) || 3000) {
  const server = createApp().listen(port, () => {
    console.log(`AI 园林助手后端已启动: http://localhost:${port}/api/health`)

    console.log(`AI 模式: ${ark.isConfigured() ? '火山方舟 (Ark)' : '模拟数据 (Mock)'}`)
  })
  return server
}

if (require.main === module) startServer()

module.exports = { createApp, startServer }
