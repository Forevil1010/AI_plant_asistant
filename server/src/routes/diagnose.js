const express = require('express')
const { diagnosePlant } = require('../services/qianfan')
const { dataUrlToBase64 } = require('../utils/image')

const router = express.Router()

function getMockDiagnosis(description, hasImage) {
  const text = description.trim()
  if (/黄|发黄|黄叶/.test(text)) {
    return {
      title: '疑似浇水或根系状态异常',
      confidenceLabel: hasImage ? '中等可信' : '初步判断',
      severity: '中等',
      evidence: ['叶片发黄常与水分管理有关', hasImage ? '已结合上传图片进行判断' : '当前仅依据文字描述'],
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
      evidence: ['叶面斑点、黏液或细网可能与害虫活动有关', hasImage ? '已结合上传图片进行判断' : '缺少清晰近照'],
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

function validateResult(result) {
  const required = ['title', 'confidenceLabel', 'severity', 'evidence', 'causes', 'actions', 'followUp', 'safety']
  for (const key of required) {
    if (!result[key]) return false
  }
  if (!Array.isArray(result.evidence) || result.evidence.length === 0) return false
  if (!Array.isArray(result.causes) || result.causes.length === 0) return false
  if (!Array.isArray(result.actions) || result.actions.length === 0) return false
  return true
}

router.post('/detect', async (req, res) => {
  try {
    const { image, description = '' } = req.body
    const hasImage = Boolean(image)

    if (!image && !description?.trim()) {
      return res.status(400).json({
        code: 400,
        message: '请至少提供图片或症状描述',
        data: null
      })
    }

    if (!process.env.QIANFAN_API_KEY || process.env.QIANFAN_API_KEY.startsWith('bce-v3') === false) {
      const mockResult = getMockDiagnosis(description, hasImage)
      return res.json({
        code: 0,
        message: 'success',
        data: {
          isMock: true,
          result: mockResult
        }
      })
    }

    const imageBase64 = image ? dataUrlToBase64(image) : null
    let diagnosis = await diagnosePlant(imageBase64, description)

    if (!validateResult(diagnosis)) {
      console.warn('大模型返回结果格式不正确，使用兜底结果')
      diagnosis = getMockDiagnosis(description, hasImage)
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        result: diagnosis
      }
    })
  } catch (error) {
    console.error('病虫害诊断失败:', error)

    const { image, description = '' } = req.body
    const hasImage = Boolean(image)

    const fallbackResult = getMockDiagnosis(description, hasImage)
    res.json({
      code: 0,
      message: 'AI 服务暂时不可用，已返回模拟结果',
      data: {
        isFallback: true,
        result: fallbackResult
      }
    })
  }
})

module.exports = router
