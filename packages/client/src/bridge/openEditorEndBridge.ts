import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_END_CROSS_IFRAME } from '../constants';

/**
 * 编辑器关闭桥接器实例
 * 负责跨iframe的编辑器关闭事件通信
 */
export const openEditorEndBridge = crossIframeBridge({
  /**
   * 初始化配置
   * 监听关闭事件并广播到所有iframe
   */
  setup() {
    // 注册消息监听器
    onMessage(OPEN_EDITOR_END_CROSS_IFRAME, (args) => {
      // 向所有iframe广播关闭事件
      postMessageAll(OPEN_EDITOR_END_CROSS_IFRAME, args, true);
      // 触发本地事件监听
      openEditorEndBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件集合
   * 处理消息发送前的逻辑处理
   */
  emitMiddlewares: [
    /**
     * 中间件逻辑：向顶层窗口发送关闭事件
     * @param args 事件参数对象
     */
    (args) => {
      // 使用安全方式向顶层窗口发送消息
      postMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, topWindow);
    },
  ],
});
