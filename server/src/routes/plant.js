const express = require('express')
const { plantKnowledge } = require('../data/plants')
const { parseImageDataUrl } = require('../utils/image')
const { isConfigured, chat } = require('../utils/ark')
const { asyncHandler } = require('../utils/asyncHandler')

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

/**
 * 调用火山方舟视觉模型识别植物
 */
async function identifyWithAI(imageBase64, mimeType) {
  const prompt = `你是一位专业的植物学家。请识别图片中的植物，并以 JSON 格式返回结果。

要求：
1. 仔细观察植物的叶片形状、颜色、纹理、茎干、花朵等特征
2. 返回 JSON 格式（不要包含 markdown 代码块标记），包含以下字段：
{
  "name": "植物中文名",
  "latinName": "拉丁学名",
  "aliases": ["别名1", "别名2"],
  "summary": "植物简介（50-100字）",
  "tags": ["标签1", "标签2", "标签3"],
  "care": {
    "light": "光照需求",
    "water": "浇水建议",
    "temperature": "适宜温度",
    "soil": "土壤建议",
    "fertilizer": "施肥建议",
    "humidity": "湿度需求"
  },
  "safety": "毒性或安全注意事项"
}

如果无法确定具体品种，请给出最可能的猜测并说明不确定性。`

  const text = await chat({
    prompt,
    imageBase64,
    mimeType,
    maxTokens: 2048,
    temperature: 0.3
  })

  // 提取 JSON 内容
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  // 补全默认字段
  const result = {
    id: 'ai-' + Date.now(),
    name: parsed.name || '未知植物',
    latinName: parsed.latinName || '',
    aliases: parsed.aliases || [],
    summary: parsed.summary || '',
    imageUrl: '',
    tags: parsed.tags || [],
    care: {
      light: parsed.care?.light || '',
      water: parsed.care?.water || '',
      temperature: parsed.care?.temperature || '',
      soil: parsed.care?.soil || '',
      fertilizer: parsed.care?.fertilizer || '',
      humidity: parsed.care?.humidity || ''
    },
    safety: parsed.safety || '',
    confidence: 0.9
  }

  return { result, candidates: [] }
}

router.post('/identify', asyncHandler(async (req, res) => {
  const { image } = req.body

  if (!image) {
    return res.status(400).json({
      code: 400,
      message: '缺少图片数据',
      data: null
    })
  }

  const { base64, mimeType } = parseImageDataUrl(image)

  // 未配置 AI 时返回 mock 数据
  if (!isConfigured()) {
    const mockData = getMockIdentify()
    return res.json({
      code: 0,
      message: '当前未配置真实 AI 服务，已返回模拟结果',
      data: {
        isMock: true,
        ...mockData
      }
    })
  }

  try {
    const aiResult = await identifyWithAI(base64, mimeType)
    return res.json({
      code: 0,
      message: '识别成功',
      data: {
        isMock: false,
        ...aiResult
      }
    })
  } catch (error) {
    console.error('植物识别失败:', error.message)
    console.error(error.stack)
    // AI 失败时回退到 mock
    const mockData = getMockIdentify()
    return res.json({
      code: 0,
      message: 'AI 服务暂时不可用，已返回模拟结果',
      data: {
        isMock: true,
        isFallback: true,
        ...mockData
      }
    })
  }
}))

module.exports = router
