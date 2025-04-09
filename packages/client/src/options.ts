import { logError } from './utils/logError';

/**
 * 调试器全局配置项
 */
export interface Options {
  /**
   * 源码根目录路径
   */
  rootDir: string;

  /**
   * 是否在浏览器中显示调试开关
   */
  displayToggle?: boolean;

  /**
   * 启用调试器时是否禁用 CSS 悬停效果
   */
  disableHoverCSS?: boolean;

  /**
   * 需要忽略的组件路径匹配规则
   */
  ignoreComponents?: string | string[];

  /**
   * 是否在打开编辑器或组件树后退出检查模式
   */
  once?: boolean;

  /**
   * 是否启用跨 iframe 调试
   */
  crossIframe?: boolean;

  /**
   * 调试服务器端口号
   */
  port?: string;
}

/** 全局配置项默认值 */
const DEFAULT_OPTIONS: Required<Omit<Options, 'port' | 'rootDir'>> = {
  displayToggle: true,
  disableHoverCSS: true,
  ignoreComponents: '/**/node_modules/**/*',
  once: true,
  crossIframe: true,
};

/** 当前生效的配置项实例 */
let activeOptions: Options;

/**
 * 设置调试器全局配置
 *
 * @param userOpts 用户配置项
 */
export function setOptions(userOpts: Partial<Options> & Pick<Options, 'rootDir'>) {
  activeOptions = {
    ...DEFAULT_OPTIONS,
    ...userOpts,
    // 数组类型特殊处理：合并默认值和用户值
    ignoreComponents: userOpts.ignoreComponents ?? DEFAULT_OPTIONS.ignoreComponents,
  };
}

/**
 * 获取当前生效的配置项
 */
export function getOptions() {
  if (!activeOptions) {
    logError('配置项未初始化，请先调用 setOptions()', {
      logLevel: 'throw',
      code: 'CONFIG_NOT_INITIALIZED',
    });
  }
  return activeOptions;
}
