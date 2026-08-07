const express = require('express')
const { parseImageDataUrl, RequestValidationError } = require('../utils/image')
const { isConfigured, chat } = require('../utils/ark')
const { normalizeDiagnosisResponse, parseModelJson } = require('../utils/aiResponse')
const { asyncHandler } = require('../utils/asyncHandler')

const router = express.Router()

function getMockDiagnosis(description, hasImage) {
  const text = description.trim()
  if (/黄|发黄|黄叶/.test(text)) {
    return {
      title: '疑似浇水或根系状态异常',
      confidenceLabel: hasImage ? '中等可信' : '初步判断',
      severity: '中等',
      evidence: ['叶片发黄常与水分管理有关', hasImage ? '已结合上传图片进行模拟判断' : '当前仅依据文字描述'],
      causes: ['浇水过于频繁导致根部缺氧', '盆土排水较慢', '光照不足造成老叶代谢'],
      actions: ['暂停浇水并检查盆土深层湿度', '确认花盆排水孔通畅，倒掉托盘积水', '移至通风且有明亮散射光的位置'],
      followUp: '3 至 5 天后观察新叶和茎基部状态；若持续软腐或有异味，建议检查根系。',
      safety: '若需要剪除腐烂根系，请先给工具消毒，并避免未经确认直接使用农药。'
    }
  }
  if (/虫|斑|点|网|黏/.test(text)) {
    return {
      title: '疑似刺吸式害虫或叶斑问题',
      confidenceLabel: hasImage ? '中等可信' : '初步判断',
      severity: '中等',
      evidence: ['叶面斑点、黏液或细网可能与害虫活动有关', hasImage ? '已结合上传图片进行模拟判断' : '缺少清晰近照'],
      causes: ['红蜘蛛、蚜虫或介壳虫活动', '叶片长期潮湿且通风不足', '受损部位发生继发感染'],
      actions: ['先将植株与其他植物隔离', '检查叶背、叶柄和新芽处是否有虫体', '用清水轻柔冲洗并擦净叶片，保持通风'],
      followUp: '连续一周每 2 天检查一次。若虫量增加，请拍摄叶背清晰近照后进一步确认。',
      safety: '使用任何药剂前阅读产品标签，佩戴防护用品，并远离儿童和宠物。'
    }
  }
  return {
    title: '暂未定位到单一问题',
    confidenceLabel: hasImage && text ? '信息有限' : '需要补充信息',
    severity: '轻微',
    evidence: [hasImage ? '已收到图片' : '未提供图片', text ? '已收到症状描述' : '症状描述较少'],
    causes: ['环境变化引起的短期应激', '水分、光照或温度条件不匹配'],
    actions: ['检查盆土湿度、叶背和茎基部', '记录最近一次浇水和环境变化', '补拍自然光下的植株全貌与异常部位近照'],
    followUp: '补充症状持续时间、最近浇水频率和光照环境后再进行判断。',
    safety: '在问题没有确认前，不建议混合使用肥料或药剂。'
  }
}

/**
 * 调用火山方舟视觉模型诊断病虫害
 */
async function diagnoseWithAI(description, imageBase64, mimeType, hasImage) {
  const prompt = `你是一位专业的植物病理学家和昆虫学家。请诊断植物的病虫害问题，并以 JSON 格式返回结果。

${hasImage ? '请仔细观察图片中植物的叶片、茎干、根部状态。' : '当前仅有文字描述，请基于描述进行初步判断。'}

用户描述：${description || '（用户未提供文字描述）'}

请返回 JSON 格式（不要包含 markdown 代码块标记），包含以下字段：
{
  "title": "诊断结论标题",
  "confidenceLabel": "可信度描述（高可信/中等可信/初步判断）",
  "severity": "严重程度（轻微/中等/严重）",
  "evidence": ["判断依据1", "判断依据2"],
  "causes": ["可能原因1", "可能原因2"],
  "actions": ["处理建议1", "处理建议2", "处理建议3"],
  "followUp": "后续观察建议",
  "safety": "安全注意事项"
}

注意：
- 如果图片不清晰或信息不足，请如实说明
- 处理建议要具体可操作
- 安全注意事项很重要，请务必提醒用户`

  const text = await chat({
    prompt,
    imageBase64,
    mimeType,
    maxTokens: 2048,
    temperature: 0.3
  })

  return normalizeDiagnosisResponse(parseModelJson(text))
}

router.post('/detect', asyncHandler(async (req, res) => {
  const { image, description = '' } = req.body
  const hasImage = Boolean(image)

  if (typeof description !== 'string') {
    throw new RequestValidationError('症状描述格式不正确')
  }
  if (description.length > 500) {
    throw new RequestValidationError('症状描述不能超过 500 个字符')
  }

  if (!image && !description.trim()) {
    return res.status(400).json({
      code: 400,
      message: '请至少提供图片或症状描述',
      data: null
    })
  }

  let imageBase64 = null
  let mimeType = 'image/jpeg'
  if (image) {
    const parsed = parseImageDataUrl(image)
    imageBase64 = parsed.base64
    mimeType = parsed.mimeType
  }

  // 未配置 AI 时返回 mock 数据
  if (!isConfigured()) {
    const mockResult = getMockDiagnosis(description, hasImage)
    return res.json({
      code: 0,
      message: '当前未配置真实 AI 服务，已返回模拟结果',
      data: {
        isMock: true,
        result: mockResult
      }
    })
  }

  try {
    const aiResult = await diagnoseWithAI(description, imageBase64, mimeType, hasImage)
    return res.json({
      code: 0,
      message: '诊断成功',
      data: {
        isMock: false,
        result: aiResult
      }
    })
  } catch (error) {
    console.error('病虫害诊断失败:', error.message)
    // AI 失败时回退到 mock
    const mockResult = getMockDiagnosis(description, hasImage)
    return res.json({
      code: 0,
      message: 'AI 服务暂时不可用，已返回模拟结果',
      data: {
        isMock: true,
        isFallback: true,
        result: mockResult
      }
    })
  }
}))

module.exports = router
