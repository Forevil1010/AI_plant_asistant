import fs from 'node:fs'
import path from 'node:path'

const mediaPattern = /\.(?:gif|jpe?g|mp3|mp4|png|wav)$/i

function collectMediaFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectMediaFiles(fullPath)
    return entry.isFile() && mediaPattern.test(entry.name) ? [fullPath] : []
  })
}

describe('WeChat package quality', () => {
  it('enables required-component lazy loading', () => {
    const appConfig = fs.readFileSync(path.join(process.cwd(), 'src/app.config.ts'), 'utf8')
    expect(appConfig).toContain("lazyCodeLoading: 'requiredComponents'")
  })

  it('keeps packaged media at or below 200 KB', () => {
    const roots = ['src/assets', 'src/images', 'miniprogram/assets']
    const oversized = roots.flatMap((root) => collectMediaFiles(path.join(process.cwd(), root)))
      .filter((file) => fs.statSync(file).size > 200 * 1024)
      .map((file) => path.relative(process.cwd(), file))

    expect(oversized).toEqual([])
  })
})
