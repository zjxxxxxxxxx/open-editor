import { logError } from './utils/logError';

/**
 * 调试器全局配置项
 */
export interface Options {
  /**
   * 源码根目录路径
   * @示例
   * - '/src'
   * - '/projects/main-app'
   */
  rootDir: string;

  /**
   * 是否在浏览器中显示调试开关
   * @默认值 true
   */
  displayToggle?: boolean;

  /**
   * 启用调试器时是否禁用CSS悬停效果
   * @应用场景
   * - 避免调试时样式干扰
   * @默认值 true
   */
  disableHoverCSS?: boolean;

  /**
   * 需要忽略的组件路径匹配规则
   * @语法
   * - 使用 glob 模式匹配语法
   * @默认值 '\/**\/node_modules\/**\/*'
   * @示例
   * - ['**\/test-components\/**', '**\/temp\**']
   */
  ignoreComponents?: string | string[];

  /**
   * 是否在打开编辑器或组件树后退出检查模式
   * @适用场景
   * - 生产环境调试时建议开启
   * @默认值 true
   */
  once?: boolean;

  /**
   * 是否启用跨iframe调试
   * @限制条件
   * - 仅在同源iframe中生效
   * @安全提示
   * - 跨域场景会自动禁用
   * @默认值 true
   */
  crossIframe?: boolean;

  /**
   * 调试服务器端口号
   * @注意
   * - 为空时使用相对地址
   * @示例
   * - '8080'
   * - '3000'
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
 * @param userOpts 用户配置项
 * @要求
 * - 必须包含 rootDir 属性
 * @注意
 * - 合并策略：用户配置覆盖默认配置
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
 * @安全校验
 * - 未初始化时抛出错误
 * @returns 当前配置项实例
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
