require('dotenv').config()

const express = require('express')
const cors = require('cors')

const plantRoutes = require('./routes/plant')
const diagnoseRoutes = require('./routes/diagnose')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      status: 'running',
      hasQianfanKey: Boolean(process.env.QIANFAN_API_KEY && process.env.QIANFAN_API_KEY.startsWith('bce-v3'))
    }
  })
})

app.use('/api/plant', plantRoutes)
app.use('/api/diagnose', diagnoseRoutes)

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null
  })
})

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  AI园林助手后端服务启动成功               ║
║  端口: ${PORT}                              ║
║  健康检查: http://localhost:${PORT}/api/health ║
╚══════════════════════════════════════════╝
  `)

  if (!process.env.QIANFAN_API_KEY || !process.env.QIANFAN_API_KEY.startsWith('bce-v3')) {
    console.log('⚠️  未配置千帆 API Key，当前使用模拟数据')
    console.log('   配置方法：复制 .env.example 为 .env，填入 QIANFAN_API_KEY\n')
  } else {
    console.log('✅ 千帆 API Key 已配置，将使用真实 AI 服务')
    console.log(`   模型: ${process.env.QIANFAN_MODEL || 'ernie-4.5-turbo-vl'}\n`)
  }
})
