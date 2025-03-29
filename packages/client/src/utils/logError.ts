/**
 * 统一错误消息生成器
 * @param msg - 原始错误描述信息
 * @param errorCode - 自定义错误分类码（默认：CLIENT_ERROR）
 * @returns 格式化后的错误消息字符串
 *
 * @示例
 * errMsg("组件初始化失败")
 * // 返回 "[@open-editor/client][CLIENT_ERROR] 组件初始化失败 (2025-03-28T08:30:00)"
 */
export function errMsg(msg: string, errorCode: string = 'CLIENT_ERROR'): string {
  // 防御性检查：确保输入有效性
  if (!msg?.trim()) {
    msg = '未知错误发生，请检查输入参数';
  }

  // 生成标准化错误信息要素
  const timestamp = new Date().toISOString();
  const moduleTag = '[@open-editor/client]';

  return `${moduleTag}[${errorCode}] ${msg} (${timestamp})`;
}

/**
 * 增强型错误记录器
 * @param msg - 错误描述信息
 * @param config - 高级配置项
 * @param config.logLevel - 处理方式：'log'记录到控制台，'throw'抛出异常
 * @param config.errorType - 自定义错误类型（默认使用Error类）
 * @param config.code - 自定义错误分类码
 *
 * @使用示例
 * logError('网络请求超时', { logLevel: 'throw', code: 'NETWORK_ERROR' })
 */
export function logError(
  msg: string,
  config: {
    logLevel?: 'log' | 'throw';
    errorType?: new (message: string) => Error;
    code?: string;
  } = {},
): void {
  const { logLevel = 'log', errorType = Error, code } = config;

  // 生成带上下文的错误消息
  const errorMessage = errMsg(msg, code);

  // 根据配置选择处理方式
  if (logLevel === 'throw') {
    throw new errorType(errorMessage);
  }

  // 结构化错误日志输出
  console.error({
    severity: 'ERROR',
    message: errorMessage,
    timestamp: Date.now(),
    component: 'client',
    stackTrace: new Error().stack?.split('\n').slice(2), // 跳过当前调用栈
  });
}
