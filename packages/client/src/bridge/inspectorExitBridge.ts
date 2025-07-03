import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import { EXIT_INSPECTOR_EVENT, INSPECTOR_EXIT_CROSS_IFRAME } from '../constants';

export type InspectorExitBridgeArgs = [];

/**
 * 检查器退出桥接模块
 *
 * 实现跨 iframe 的事件广播机制，确保在任意 iframe 中触发的退出事件能同步到所有上下文
 */
export const inspectorExitBridge = crossIframeBridge({
  /**
   * 桥接初始化配置
   */
  setup() {
    // 注册跨 iframe 消息监听
    onMessage(INSPECTOR_EXIT_CROSS_IFRAME, handleExitEvent);
  },

  /**
   * 消息发送中间件配置，用于处理消息发送前的逻辑
   */
  emitMiddlewares: [
    (args) => {
      // 确保消息发送到顶层窗口
      postMessage(INSPECTOR_EXIT_CROSS_IFRAME, args, topWindow);
    },
  ],
});

/**
 * 处理退出事件的核心逻辑
 *
 * @param args 事件参数对象
 */
function handleExitEvent(args: InspectorExitBridgeArgs) {
  // 验证顶层窗口上下文有效性
  whenTopWindow(
    // 顶层窗口上下文中的处理
    () => executeInTopWindow(args),
    // 非顶层窗口的降级处理
    () => executeInSubWindow(args),
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
 *
 * @param args 需要广播的事件参数
 */
function broadcastExitEvent(args: InspectorExitBridgeArgs) {
  // 跨 iframe 全量广播
  postMessageAll(INSPECTOR_EXIT_CROSS_IFRAME, args);
  // 触发桥接模块的本地事件
  inspectorExitBridge.emit(args, true);
}
