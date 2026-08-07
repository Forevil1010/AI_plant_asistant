const assert = require('node:assert/strict')
const test = require('node:test')

const {
  AiResponseValidationError,
  normalizeDiagnosisResponse,
  normalizePlantResponse,
  parseModelJson
} = require('../src/utils/aiResponse')

test('extracts JSON from a fenced model response', () => {
  assert.deepEqual(parseModelJson('说明\n```json\n{"name":"绿萝"}\n```'), { name: '绿萝' })
})

test('normalizes a plant result and candidate field types', () => {
  const normalized = normalizePlantResponse({
    result: { name: '绿萝', confidence: '82%', tags: '耐阴', care: { water: '见干见湿' } },
    candidates: [{ name: '黄金葛', confidence: 0.4 }]
  }, 123)

  assert.equal(normalized.result.id, 'ai-123')
  assert.equal(normalized.result.confidence, 0.82)
  assert.deepEqual(normalized.result.tags, ['耐阴'])
  assert.equal(normalized.result.care.light, '暂无可靠信息')
  assert.equal(normalized.candidates[0].name, '黄金葛')
})

test('rejects a plant response without a valid name', () => {
  assert.throws(
    () => normalizePlantResponse({ summary: 'missing name' }),
    AiResponseValidationError
  )
})

test('normalizes diagnosis strings into arrays and constrains severity', () => {
  const normalized = normalizeDiagnosisResponse({
    title: '疑似缺水',
    severity: '未知',
    evidence: '盆土干燥',
    causes: ['浇水间隔过长'],
    actions: '缓慢浇透'
  })

  assert.equal(normalized.severity, '中等')
  assert.deepEqual(normalized.evidence, ['盆土干燥'])
  assert.deepEqual(normalized.actions, ['缓慢浇透'])
  assert.ok(normalized.safety)
})

test('rejects a diagnosis without actionable advice', () => {
  assert.throws(
    () => normalizeDiagnosisResponse({ title: '信息不足' }),
    AiResponseValidationError
  )
})
