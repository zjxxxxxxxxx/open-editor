import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import { ENABLE_INSPECTOR_EVENT, INSPECTOR_ENABLE_CROSS_IFRAME } from '../constants';

/**
 * 跨 iframe 检查器启用桥接器
 */
export const inspectorEnableBridge = crossIframeBridge({
  /**
   * 初始化桥接器
   */
  setup() {
    onMessage(INSPECTOR_ENABLE_CROSS_IFRAME, handleInspectorEnable);

    /**
     * 处理检查器启用指令
     *
     * @param args - 消息参数对象
     */
    function handleInspectorEnable(args) {
      // 顶层窗口处理逻辑
      const topWindowHandler = () => {
        if (dispatchEvent(ENABLE_INSPECTOR_EVENT)) {
          broadcastEnableMessage(args);
        }
      };

      // 非顶层窗口处理逻辑
      const normalWindowHandler = () => broadcastEnableMessage(args);

      // 根据窗口层级执行对应处理
      whenTopWindow(topWindowHandler, normalWindowHandler);
    }

    /**
     * 广播启用指令消息
     *
     * @param args - 消息参数对象
     */
    function broadcastEnableMessage(args) {
      // 全量广播到所有 iframe
      postMessageAll(INSPECTOR_ENABLE_CROSS_IFRAME, args);
      // 通过桥接器触发本地监听
      inspectorEnableBridge.emit(args, true);
    }
  },

  /**
   * 消息发送中间件配置
   */
  emitMiddlewares: [
    (args) => {
      // 确保消息发送到顶层窗口
      postMessage(INSPECTOR_ENABLE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
