const assert = require('node:assert/strict')
const test = require('node:test')

const { parseImageDataUrl, RequestValidationError } = require('../src/utils/image')

function toDataUrl(mimeType, bytes) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`
}

test('accepts supported image data URLs and preserves MIME type', () => {
  const result = parseImageDataUrl(toDataUrl('image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

  assert.equal(result.mimeType, 'image/png')
  assert.equal(result.byteLength, 8)
})

test('rejects a file whose declared MIME type does not match its bytes', () => {
  assert.throws(
    () => parseImageDataUrl(toDataUrl('image/png', [0xff, 0xd8, 0xff, 0xd9])),
    RequestValidationError
  )
})

test('rejects images over the configured size', () => {
  assert.throws(
    () => parseImageDataUrl(toDataUrl('image/jpeg', [0xff, 0xd8, 0xff, 0xd9]), 3),
    (error) => error instanceof RequestValidationError && error.status === 413
  )
})
