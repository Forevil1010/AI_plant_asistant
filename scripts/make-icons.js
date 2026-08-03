const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '../src/images/tab')
const names = ['home', 'identify', 'garden', 'diagnose', 'profile']
const files = names.flatMap((name) => [`${name}.png`, `${name}-active.png`])
const missing = files.filter((file) => !fs.existsSync(path.join(iconsDir, file)))

if (missing.length) {
  throw new Error(`Missing committed tab icons: ${missing.join(', ')}`)
}

console.log(`Verified ${files.length} committed Lucide tab icons.`)
