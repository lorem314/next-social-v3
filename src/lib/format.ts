/**
 * 将字节数或 File 对象格式化为可读的文件大小字符串（如 1.2 MB, 850 KB）
 * @param bytesOrFile 字节数 (number) 或 File 对象
 * @param decimals 保留小数位数，默认为 1
 */
export function formatFileSize(
  bytesOrFile: number | File,
  decimals: number = 1,
): string {
  if (!bytesOrFile) return "0 B"

  const bytes = typeof bytesOrFile === "number" ? bytesOrFile : bytesOrFile.size

  if (bytes === 0) return "0 B"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB"]

  // 计算数量级索引
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // 处理超出范围的极大文件
  if (i >= sizes.length) {
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`
  }

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
