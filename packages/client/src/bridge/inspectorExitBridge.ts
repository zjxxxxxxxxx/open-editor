import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import { EXIT_INSPECTOR_EVENT, INSPECTOR_EXIT_CROSS_IFRAME } from '../constants';

export type InspectorExitBridgeArgs = [];

/**
 * 检查器退出桥接模块
 *
 * 实现跨iframe的事件广播机制，确保在任意iframe中触发的退出事件能同步到所有上下文
 */
export const inspectorExitBridge = crossIframeBridge({
  /**
   * 桥接初始化配置
   *
   * 功能说明：
   * 1. 监听退出指令消息
   * 2. 验证顶层窗口上下文
   * 3. 分发事件并广播到所有iframe
   */
  setup() {
    // 注册跨iframe消息监听
    onMessage(INSPECTOR_EXIT_CROSS_IFRAME, handleExitEvent);
  },

  /**
   * 事件触发中间件队列
   *
   * 执行顺序说明：
   * 1. 中间件按数组顺序依次执行
   * 2. 每个中间件接收前序处理结果作为参数
   * 3. 最终事件会传递到所有注册的监听器
   */
  emitMiddlewares: [
    /**
     * 基础消息广播中间件
     *
     * 功能说明：
     * 向顶层窗口发送标准化协议格式的消息
     * 确保所有iframe都能接收到退出指令
     */
    (args) => {
      postMessage(INSPECTOR_EXIT_CROSS_IFRAME, args, topWindow);
    },
  ],
});

/**
 * 处理退出事件的核心逻辑
 * @param args 事件参数对象
 */
function handleExitEvent(args: InspectorExitBridgeArgs) {
  // 验证顶层窗口上下文有效性
  whenTopWindow(
    () => executeInTopWindow(args), // 顶层窗口上下文中的处理
    () => executeInSubWindow(args), // 非顶层窗口的降级处理
  );
}

/**
 * 在顶层窗口上下文中执行退出流程
 */
function executeInTopWindow(args: InspectorExitBridgeArgs) {
  // 前置事件派发校验
  if (dispatchEvent(EXIT_INSPECTOR_EVENT)) {
    broadcastExitEvent(args);
  }
}

/**
 * 在子窗口上下文中执行降级处理
 */
function executeInSubWindow(args: InspectorExitBridgeArgs) {
  broadcastExitEvent(args);
}

/**
 * 全局事件广播操作
 * @param args 需要广播的事件参数
 */
function broadcastExitEvent(args: InspectorExitBridgeArgs) {
  // 跨iframe全量广播
  postMessageAll(INSPECTOR_EXIT_CROSS_IFRAME, args);
  // 触发桥接模块的本地事件
  inspectorExitBridge.emit(args, true);
}
