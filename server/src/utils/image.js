const fs = require('fs')
const path = require('path')

function fileToBase64(filePath) {
  const data = fs.readFileSync(filePath)
  return Buffer.from(data).toString('base64')
}

function dataUrlToBase64(dataUrl) {
  if (dataUrl.startsWith('data:')) {
    const base64Part = dataUrl.split(',')[1]
    return base64Part
  }
  return dataUrl
}

module.exports = {
  fileToBase64,
  dataUrlToBase64
}
