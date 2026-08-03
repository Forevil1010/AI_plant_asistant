import fs from 'node:fs'
import path from 'node:path'

function collectScssFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectScssFiles(fullPath)
    return entry.isFile() && entry.name.endsWith('.scss') ? [fullPath] : []
  })
}

describe('WeChat WXSS compatibility', () => {
  it('uses ASCII-only selectors', () => {
    const violations = collectScssFiles(path.join(process.cwd(), 'src')).flatMap((file) => {
      return fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line, index) => {
        const openingBrace = line.indexOf('{')
        if (openingBrace < 0) return []
        const selector = line.slice(0, openingBrace)
        return /[^\x00-\x7F]/.test(selector) ? [`${path.relative(process.cwd(), file)}:${index + 1} ${selector.trim()}`] : []
      })
    })

    expect(violations).toEqual([])
  })
})
