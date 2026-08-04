const express = require('express')
const { plantKnowledge } = require('../data/plants')
const { parseImageDataUrl } = require('../utils/image')

const router = express.Router()

function getMockIdentify() {
  const mockIndex = Math.floor(Math.random() * plantKnowledge.length)
  const mainResult = {
    ...plantKnowledge[mockIndex],
    confidence: 0.85 + Math.random() * 0.1
  }

  const others = plantKnowledge
    .filter((_, i) => i !== mockIndex)
    .map((p) => ({
      id: p.id,
      name: p.name,
      confidence: 0.3 + Math.random() * 0.3,
      summary: p.summary.slice(0, 50) + '...',
      imageUrl: p.imageUrl,
      tags: p.tags.slice(0, 3)
    }))
    .slice(0, 2)

  return {
    result: mainResult,
    candidates: others
  }
}

router.post('/identify', (req, res) => {
  const { image } = req.body

  if (!image) {
    return res.status(400).json({
      code: 400,
      message: '缺少图片数据',
      data: null
    })
  }

  parseImageDataUrl(image)
  const mockData = getMockIdentify()
  return res.json({
    code: 0,
    message: '当前未配置真实 AI 服务，已返回模拟结果',
    data: {
      isMock: true,
      ...mockData
    }
  })
})

module.exports = router
