const QIANFAN_URL = process.env.QIANFAN_URL || 'https://qianfan.baidubce.com/v2/chat/completions'
const API_KEY = process.env.QIANFAN_API_KEY || ''
const DEFAULT_MODEL = process.env.QIANFAN_MODEL || 'ernie-4.5-turbo-vl'

async function callQianfan(messages, options = {}) {
  if (!API_KEY) {
    throw new Error('千帆 API Key 未配置')
  }

  const response = await fetch(QIANFAN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      top_p: options.top_p ?? 0.8,
      stream: false
    })
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(`千帆 API 错误: ${data.error.message || data.error}`)
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error('千帆 API 返回为空')
  }

  return data.choices[0].message.content
}

const IDENTIFY_PROMPT = `你是一位专业的植物学家。请根据用户提供的植物图片，识别最可能的 3 种植物，并严格按照以下 JSON 格式返回结果（不要输出任何额外的解释文字，只输出 JSON）：

{
  "results": [
    {
      "name": "最可能的植物中文名",
      "latinName": "拉丁学名",
      "aliases": ["别名1", "别名2"],
      "summary": "植物简介，50-100字",
      "confidence": 0.9,
      "tags": ["标签1", "标签2", "标签3"],
      "care": {
        "light": "光照建议",
        "water": "浇水建议",
        "temperature": "温度要求",
        "soil": "土壤要求",
        "fertilizer": "施肥建议"
      },
      "safety": "人宠安全提示，毒性说明"
    },
    {
      "name": "第二可能",
      "confidence": 0.7,
      "summary": "简要说明为什么可能是这个",
      "tags": []
    },
    {
      "name": "第三可能",
      "confidence": 0.5,
      "summary": "简要说明为什么可能是这个",
      "tags": []
    }
  ]
}

要求：
1. 按置信度从高到低排序，返回 2-3 个最可能的结果
2. 第一个结果必须包含完整信息（latinName、aliases、care、safety 都要有）
3. 第二、第三个结果可以简略，但至少要有 name、confidence、summary
4. confidence 是你对识别结果的置信度，0 到 1 之间的小数
5. tags 3-5 个，比如"观叶植物"、"多肉植物"、"室内植物"等
6. care 里的每项建议要具体、可执行，20-50字
7. safety 要说明是否有毒，对儿童和宠物是否安全
8. 所有内容使用中文
9. 如果图片不清晰或无法确定，confidence 设低一些，并在 summary 里说明`

async function identifyPlant(imageBase64) {
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: IDENTIFY_PROMPT },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }
  ]

  const resultText = await callQianfan(messages, { temperature: 0.2 })

  try {
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const results = parsed.results || [parsed]

      return results.map((item, index) => {
        const id = index === 0 ? `ai-${Date.now()}` : `ai-${Date.now()}-${index}`
        return {
          ...item,
          id,
          imageUrl: item.imageUrl || '',
          aliases: item.aliases || [],
          latinName: item.latinName || '',
          summary: item.summary || '',
          tags: item.tags || [],
          care: item.care || {
            light: '暂无具体信息',
            water: '建议见干见湿，避免积水',
            temperature: '暂无具体信息',
            soil: '建议使用疏松透气的土壤',
            fertilizer: '暂无具体信息'
          },
          safety: item.safety || '暂无明确安全信息，请避免儿童和宠物误食。'
        }
      })
    }
  } catch (e) {
    console.warn('解析植物识别 JSON 失败:', e)
  }

  throw new Error('无法解析识别结果')
}

const DIAGNOSIS_PROMPT = `你是一位专业的植物医生和园艺顾问。请根据用户提供的植物图片和文字描述，进行病虫害诊断，并严格按照以下 JSON 格式返回结果（不要输出任何额外的解释文字，只输出 JSON）：

{
  "title": "疑似xxx问题",
  "confidenceLabel": "较高可信/中等可信/初步判断/信息不足",
  "severity": "轻微/中等/严重",
  "evidence": ["判断依据1", "判断依据2"],
  "causes": ["可能原因1", "可能原因2"],
  "actions": ["处理步骤1", "处理步骤2", "处理步骤3"],
  "followUp": "后续观察建议",
  "safety": "安全提醒，特别是关于儿童、宠物和用药安全"
}

要求：
1. title 要简洁，不超过 15 个字，用"疑似"开头
2. confidenceLabel 根据图片清晰度和症状明显程度判断
3. severity 评估问题的严重程度
4. evidence 说明你是根据哪些特征判断的
5. causes 分析可能的原因（2-3条）
6. actions 给出具体可执行的处理步骤（3-5条，按优先级排序）
7. followUp 说明后续应该观察什么、多久观察一次
8. safety 必须包含人宠安全和用药安全提醒
9. 所有内容使用中文，语气专业但通俗易懂
10. 如果图片不清晰或信息不足，要明确说明并建议补充信息
11. 诊断结果必须用"疑似"、"可能"等措辞，不能用绝对化的表述`

async function diagnosePlant(imageBase64, description) {
  const userText = description
    ? `${DIAGNOSIS_PROMPT}\n\n用户描述：${description}`
    : DIAGNOSIS_PROMPT

  const content = [{ type: 'text', text: userText }]
  if (imageBase64) {
    content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } })
  }

  const messages = [{ role: 'user', content }]
  const resultText = await callQianfan(messages, { temperature: 0.3 })

  try {
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.warn('解析诊断 JSON 失败:', e)
  }

  throw new Error('无法解析诊断结果')
}

module.exports = {
  identifyPlant,
  diagnosePlant,
  callQianfan
}
