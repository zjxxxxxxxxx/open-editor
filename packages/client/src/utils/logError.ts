/**
 * 增强型错误记录器（支持跨环境栈追踪）
 *
 * @param msg - 错误描述信息
 * @param config - 高级配置项
 * @param config.logLevel - 处理方式：'log' 记录到控制台，'throw' 抛出异常
 * @param config.errorType - 自定义错误类型（默认使用Error类）
 * @param config.code - 自定义错误分类码
 *
 * @example
 * logError('网络请求超时', { logLevel: 'throw', code: 'NETWORK_ERROR' })
 */
export function logError(
  msg: string,
  config: {
    logLevel?: 'log' | 'throw';
    errorType?: new (message: string) => Error;
    code?: string;
  } = {},
) {
  const { logLevel = 'log', errorType = Error, code } = config;
  const errorMessage = errMsg(msg, code);

  if (logLevel === 'throw') {
    // 错误对象构造器
    const err = new errorType(errorMessage);

    // 跨环境栈追踪处理（核心改进点）
    if (typeof Error.captureStackTrace === 'function') {
      // V8 引擎优化方案：精确跳过当前函数栈
      Error.captureStackTrace(err, logError);
    } else if (err.stack) {
      // 通用兼容方案：正则过滤当前栈帧
      const stackLines = err.stack.split('\n');
      const cleanStack = stackLines
        .filter((line, index) => index === 0 || !line.includes('at logError'))
        .join('\n');
      err.stack = cleanStack;
    }

    throw err;
  }

  // 结构化日志输出（增强可观测性）
  const structuredLog = {
    severity: 'ERROR',
    message: errorMessage,
    timestamp: Date.now(),
    component: 'client',
    stackTrace: (new Error().stack || '')
      .split('\n')
      // 跳过当前调用栈
      .slice(2)
      .map((line) => line.trim()),
    context: {
      userAgent: typeof navigator === 'undefined' ? 'server-side' : navigator.userAgent,
      environment: process.env.NODE_ENV || 'development',
    },
  };

  console.error(structuredLog);
}

/**
 * 统一错误消息生成器（支持环境检测）
 *
 * @param msg - 原始错误描述信息
 * @param errorCode - 自定义错误分类码（默认：CLIENT_ERROR）
 *
 * @returns 格式化后的错误消息字符串
 *
 * @example
 * errMsg("组件初始化失败")
 * // 返回 "[@open-editor/client][CLIENT_ERROR] 组件初始化失败 (2025-03-28T08:30:00Z)"
 */
export function errMsg(msg: string, errorCode: string = 'CLIENT_ERROR') {
  // 防御性检查：确保输入有效性（增强空值检查）
  if (typeof msg !== 'string' || !msg.trim()) {
    msg = '未知错误发生，请检查输入参数';
    errorCode = 'INVALID_INPUT';
  }

  // 生成标准化错误信息要素（包含时区信息）
  const timestamp = new Date().toISOString();
  const moduleTag = '[@open-editor/client]';

  // 环境检测（浏览器/Node.js）
  const envInfo =
    typeof window === 'undefined'
      ? `Node/${process.version}`
      : `Browser/${navigator.userAgent.split(' ')[0]}`;

  return `${moduleTag}[${errorCode}] ${msg} (${timestamp}) [${envInfo}]`;
}
