import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type CodeSourceMeta } from '../resolve';
import { OPEN_EDITOR_CROSS_IFRAME } from '../constants';

/**
 * 创建跨iframe编辑器桥接实例
 * 使用泛型约束参数类型为包含可选CodeSourceMeta的元组
 */
export const openEditorBridge = crossIframeBridge<[CodeSourceMeta?]>({
  /**
   * 初始化桥接配置
   * 监听来自其他iframe的编辑器打开请求
   */
  setup() {
    onMessage<[CodeSourceMeta?]>(OPEN_EDITOR_CROSS_IFRAME, (args) => {
      openEditorBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件配置
   * 确保消息发送时目标窗口已准备就绪
   */
  emitMiddlewares: [
    /**
     * 中间件处理逻辑：当处于顶层窗口时通过postMessage发送消息
     * @param args 消息参数
     * @param next 下一步处理函数
     */
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(OPEN_EDITOR_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
