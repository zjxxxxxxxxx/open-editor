import { getOptions } from '../options';
import { mitt } from './mitt';

/**
 * 跨框架通信桥接器配置项
 * @template Args 事件参数类型扩展
 */
export interface CrossIframeBridgeOptions<Args extends unknown[] = []> {
  /** 初始化钩子函数 */
  setup?: () => void;
  /** 发送事件中间件队列 */
  emitMiddlewares?: CrossIframeBridgeMiddleware<Args>[];
}

/**
 * 中间件函数类型定义
 * @template Args 事件参数类型扩展
 * @param args 事件参数数组
 * @param next 执行下一个中间件的函数
 */
export type CrossIframeBridgeMiddleware<Args extends unknown[] = []> = (
  args: Args,
  next: () => void,
) => void;

/**
 * 创建跨框架通信桥接器
 * @param opts 配置选项
 * @returns 增强型事件总线实例
 */
export function crossIframeBridge<Args extends unknown[] = []>(
  opts: CrossIframeBridgeOptions<Args> = {},
) {
  // 解构配置项并设置默认值
  const { setup, emitMiddlewares = [] } = opts;

  // 创建基础事件总线
  const bridge = mitt<Args>();
  let initialized = false;

  // 构建增强型桥接器
  return {
    ...bridge,

    /** 判断监听队列是否为空 */
    get isEmpty() {
      return bridge.isEmpty;
    },

    /**
     * 初始化方法
     * 确保在支持跨框架通信时只执行一次初始化
     */
    setup() {
      const { crossIframe } = getOptions();
      if (crossIframe && !initialized) {
        initialized = true;
        setup?.(); // 安全调用可选初始化函数
      }
    },

    /**
     * 增强型事件发送方法
     * @param args 事件参数数组
     * @param immediate 是否跳过中间件直接触发
     */
    emit(args?: Args, immediate?: boolean) {
      // 参数标准化处理
      const normalizedArgs = Array.isArray(args) ? args : ([] as unknown as Args);

      // 获取运行时配置
      const { crossIframe } = getOptions();

      // 构建中间件执行栈
      const middlewareStack: CrossIframeBridgeMiddleware<Args>[] = [
        // 基础发送动作作为最终中间件
        () => bridge.emit(...normalizedArgs),
      ];

      // 根据条件插入前置中间件
      if (crossIframe && !immediate && emitMiddlewares.length) {
        middlewareStack.unshift(...emitMiddlewares);
      }

      // 中间件链式执行器
      (function executeMiddlewareChain() {
        const currentMiddleware = middlewareStack.shift();
        currentMiddleware?.(normalizedArgs, executeMiddlewareChain);
      })();
    },
  };
}
