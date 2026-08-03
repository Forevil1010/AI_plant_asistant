export function persistLocalImage(tempFilePath: string): Promise<string> {
  if (!tempFilePath || tempFilePath.startsWith('/assets/')) return Promise.resolve(tempFilePath)

  return new Promise((resolve) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      success: (result: any) => resolve(result.savedFilePath || tempFilePath),
      fail: () => resolve(tempFilePath)
    })
  })
}
