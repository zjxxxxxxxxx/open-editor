/**
 * 路径标准化配置选项
 */
export interface NormalizeOptions {
  /**
   * 是否保留末尾斜杠
   * 设置为 true 时保留路径末尾的斜杠
   * 默认值: false
   */
  keepTrailingSlash?: boolean;

  /**
   * 是否合并连续斜杠
   * 设置为 true 时会将多个连续斜杠合并为单个
   * 默认值: true
   */
  mergeSlashes?: boolean;
}

/**
 * 标准化处理文件路径
 * @param path 原始路径字符串
 * @param options 标准化配置选项
 * @returns 返回统一格式的标准化路径
 *
 * 功能说明：
 * 1. 转换Windows反斜杠路径为POSIX斜杠路径
 * 2. 自动去除首尾空白字符
 * 3. 可选合并连续斜杠（默认启用）
 * 4. 可选保留末尾斜杠（默认不保留）
 */
export function normalizePath(path: string, options: NormalizeOptions = {}): string {
  // 配置参数解构与默认值设置
  const { keepTrailingSlash = false, mergeSlashes = true } = options;

  // 预处理流程
  return (
    path
      // 去除首尾空白字符
      .trim()
      // 转换所有反斜杠为斜杠
      .replace(/\\+/g, '/')
      // 可选合并连续斜杠
      .replace(mergeSlashes ? /\/{2,}/g : /(?!)/, '/')
      // 可选移除末尾斜杠
      .replace(keepTrailingSlash ? /\/?$/ : /\/$/, '')
  );
}
