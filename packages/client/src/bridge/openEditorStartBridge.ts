import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_START_CROSS_IFRAME } from '../constants';

/**
 * 编辑器启动事件桥接器，处理跨 iframe 的编辑器启动事件通信
 */
export const openEditorStartBridge = crossIframeBridge({
  /**
   * 初始化配置，监听启动事件并同步到所有 iframe
   */
  setup() {
    // 注册全局事件监听
    onMessage(OPEN_EDITOR_START_CROSS_IFRAME, (args) => {
      // 向所有 iframe 广播启动事件
      postMessageAll(OPEN_EDITOR_START_CROSS_IFRAME, args, true);
      // 触发本地事件监听
      openEditorStartBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件配置
   * 处理消息发送前的逻辑处理
   */
  emitMiddlewares: [
    /**
     * 中间件逻辑：向顶层窗口发送启动事件
     *
     * @param args 事件参数对象
     */
    (args) => {
      // 安全方式向顶层窗口发送消息
      postMessage(OPEN_EDITOR_START_CROSS_IFRAME, args, topWindow);
    },
  ],
});
