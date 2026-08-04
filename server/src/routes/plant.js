const express = require('express')
const { identifyPlant } = require('../services/qianfan')
const { plantKnowledge } = require('../data/plants')
const { dataUrlToBase64 } = require('../utils/image')

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

function enhanceWithLocalKnowledge(result) {
  if (!result || !result.name) return result

  const local = plantKnowledge.find((p) =>
    p.name === result.name ||
    p.aliases.includes(result.name) ||
    result.name.includes(p.name) ||
    p.name.includes(result.name)
  )

  if (local) {
    return {
      ...result,
      id: local.id,
      latinName: result.latinName || local.latinName,
      aliases: result.aliases?.length ? result.aliases : local.aliases,
      summary: result.summary || local.summary,
      imageUrl: local.imageUrl,
      tags: result.tags?.length ? [...new Set([...result.tags, ...local.tags])] : local.tags,
      care: {
        light: result.care?.light || local.care.light,
        water: result.care?.water || local.care.water,
        temperature: result.care?.temperature || local.care.temperature,
        soil: result.care?.soil || local.care.soil,
        fertilizer: result.care?.fertilizer || local.care.fertilizer
      },
      safety: result.safety || local.safety
    }
  }

  return result
}

router.post('/identify', async (req, res) => {
  try {
    const { image } = req.body

    if (!image) {
      return res.status(400).json({
        code: 400,
        message: '缺少图片数据',
        data: null
      })
    }

    if (!process.env.QIANFAN_API_KEY || process.env.QIANFAN_API_KEY.startsWith('bce-v3') === false) {
      const mockData = getMockIdentify()
      return res.json({
        code: 0,
        message: 'success',
        data: {
          isMock: true,
          ...mockData
        }
      })
    }

    const imageBase64 = dataUrlToBase64(image)
    const results = await identifyPlant(imageBase64)

    if (!results || results.length === 0) {
      return res.json({
        code: 0,
        message: '未识别到植物',
        data: {
          result: null,
          candidates: []
        }
      })
    }

    const enhancedResults = results.map(enhanceWithLocalKnowledge)
    const mainResult = enhancedResults[0]
    const candidates = enhancedResults.slice(1, 3)

    res.json({
      code: 0,
      message: 'success',
      data: {
        result: mainResult,
        candidates
      }
    })
  } catch (error) {
    console.error('植物识别失败:', error)

    const mockData = getMockIdentify()
    res.json({
      code: 0,
      message: 'AI 服务暂时不可用，已返回模拟结果',
      data: {
        isFallback: true,
        ...mockData
      }
    })
  }
})

module.exports = router
