/**
 * 判断当前是否处于开发环境
 * @returns  返回环境检测结果
 *
 * @example
 * // 当 process.env.NODE_ENV 未设置或设置为 development 时
 * isDev(); // => true
 */
export function isDev(): boolean {
  // 获取环境配置（使用非空断言确保类型安全）
  const env = process.env;

  // 1. 当未显式配置环境变量时，NODE_ENV 默认为 development
  // 2. 显式配置时根据实际值判断
  return env.NODE_ENV === 'development';
}
