import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type CodeSourceMeta } from '../resolve';
import { OPEN_EDITOR_CROSS_IFRAME } from '../constants';

export type OpenEditorBridgeArgs = [CodeSourceMeta?];

/**
 * 创建跨 iframe 编辑器桥接实例，使用泛型约束参数类型为包含可选 CodeSourceMeta 的元组
 */
export const openEditorBridge = crossIframeBridge<OpenEditorBridgeArgs>({
  /**
   * 初始化桥接配置，监听来自其他 iframe 的编辑器打开请求
   */
  setup() {
    onMessage<OpenEditorBridgeArgs>(OPEN_EDITOR_CROSS_IFRAME, (args) => {
      openEditorBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件配置，确保消息发送时目标窗口已准备就绪
   */
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(OPEN_EDITOR_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
