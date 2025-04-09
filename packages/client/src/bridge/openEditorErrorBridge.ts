import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_ERROR_CROSS_IFRAME } from '../constants';

/**
 * 编辑器错误桥接器实例，处理跨 iframe 的编辑器错误事件通信
 */
export const openEditorErrorBridge = crossIframeBridge({
  /**
   * 初始化配置，监听错误事件并触发桥接事件
   */
  setup() {
    // 注册错误事件监听
    onMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, (args) => {
      // 触发桥接实例的事件传播
      openEditorErrorBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件配置，处理消息发送前的逻辑校验
   */
  emitMiddlewares: [
    /**
     * 中间件处理逻辑：窗口状态校验
     *
     * @param args 事件参数对象
     * @param next 后续处理回调
     */
    (args, next) => {
      // 校验窗口层级后执行消息发送
      whenTopWindow(next, () => {
        // 向顶层窗口派发错误事件
        postMessage(OPEN_EDITOR_ERROR_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
