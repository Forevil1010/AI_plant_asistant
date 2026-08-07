class AiResponseValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AiResponseValidationError'
  }
}

function text(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function stringList(value, fallback = [], maxItems = 8) {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
  const normalized = values
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .slice(0, maxItems)
  return normalized.length ? normalized : fallback
}

function confidence(value, fallback) {
  const parsed = typeof value === 'string' && value.trim().endsWith('%')
    ? Number.parseFloat(value) / 100
    : Number(value)
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : fallback
}

function parseModelJson(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new AiResponseValidationError('模型未返回可解析内容')
  }

  const trimmed = rawText.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) {
    throw new AiResponseValidationError('模型返回内容不包含 JSON 对象')
  }

  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    return parsed
  } catch {
    throw new AiResponseValidationError('模型返回 JSON 格式无效')
  }
}

function normalizeCare(value) {
  const care = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return {
    light: text(care.light, '暂无可靠信息'),
    water: text(care.water, '暂无可靠信息'),
    temperature: text(care.temperature, '暂无可靠信息'),
    soil: text(care.soil, '暂无可靠信息'),
    fertilizer: text(care.fertilizer, '暂无可靠信息'),
    humidity: text(care.humidity, '暂无可靠信息')
  }
}

function normalizePlant(value, id, fallbackConfidence) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const name = text(value.name)
  if (!name) return null

  return {
    id,
    name,
    latinName: text(value.latinName),
    aliases: stringList(value.aliases),
    summary: text(value.summary, '模型未返回植物简介。'),
    imageUrl: '',
    tags: stringList(value.tags),
    care: normalizeCare(value.care),
    safety: text(value.safety, '暂无可靠安全信息，请避免儿童或宠物误食。'),
    confidence: confidence(value.confidence, fallbackConfidence)
  }
}

function normalizePlantResponse(payload, now = Date.now()) {
  const resultSource = payload?.result && typeof payload.result === 'object' ? payload.result : payload
  const result = normalizePlant(resultSource, `ai-${now}`, 0.65)
  if (!result) throw new AiResponseValidationError('模型未返回有效植物名称')

  const rawCandidates = Array.isArray(payload?.candidates)
    ? payload.candidates
    : Array.isArray(resultSource?.candidates) ? resultSource.candidates : []
  const candidates = rawCandidates
    .map((candidate, index) => normalizePlant(candidate, `ai-${now}-candidate-${index + 1}`, 0.45))
    .filter(Boolean)
    .slice(0, 3)

  return { result, candidates }
}

function normalizeDiagnosisResponse(payload) {
  const source = payload?.result && typeof payload.result === 'object' ? payload.result : payload
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new AiResponseValidationError('模型未返回有效诊断对象')
  }

  const title = text(source.title)
  const actions = stringList(source.actions)
  if (!title || !actions.length) {
    throw new AiResponseValidationError('模型诊断缺少结论或处理建议')
  }

  const severity = ['轻微', '中等', '严重'].includes(source.severity) ? source.severity : '中等'
  return {
    title,
    confidenceLabel: text(source.confidenceLabel, '初步判断'),
    severity,
    evidence: stringList(source.evidence, ['模型未提供足够的判断依据']),
    causes: stringList(source.causes, ['信息不足，需要继续观察']),
    actions,
    followUp: text(source.followUp, '请持续观察，并在症状加重时补充清晰图片。'),
    safety: text(source.safety, '使用肥料或药剂前请阅读产品说明，并远离儿童和宠物。')
  }
}

module.exports = {
  AiResponseValidationError,
  normalizeDiagnosisResponse,
  normalizePlantResponse,
  parseModelJson
}
