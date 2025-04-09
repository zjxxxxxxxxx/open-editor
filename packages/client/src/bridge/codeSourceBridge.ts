import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { inspectorState } from '../inspector/inspectorState';
import { type CodeSource } from '../resolve';
import { CODE_SOURCE_CROSS_IFRAME } from '../constants';

export type CodeSourceBridgeArgs = [CodeSource?];

/**
 * 创建跨 iframe 的代码源通信桥接器，使用中间件模式处理消息收发逻辑
 */
export const codeSourceBridge = crossIframeBridge<CodeSourceBridgeArgs>({
  /**
   * 初始化桥接器配置，设置消息监听和处理逻辑
   */
  setup() {
    // 注册跨 iframe 消息监听器
    onMessage<CodeSourceBridgeArgs>(
      CODE_SOURCE_CROSS_IFRAME,
      /**
       * 处理接收到的消息
       *
       * @param args 包含代码源信息的参数数组
       */
      (args) => {
        // 当检查器启用时才转发消息
        if (inspectorState.isEnable) {
          codeSourceBridge.emit(args, true);
        }
      },
    );
  },

  /**
   * 消息发送中间件配置，用于处理消息发送前的逻辑
   */
  emitMiddlewares: [
    (args, next) => {
      // 确保在顶层窗口执行消息发送
      whenTopWindow(next, () => {
        postMessage(CODE_SOURCE_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
