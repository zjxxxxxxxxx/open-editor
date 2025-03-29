import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import { ENABLE_INSPECTOR_EVENT, INSPECTOR_ENABLE_CROSS_IFRAME } from '../constants';

/**
 * 跨iframe检查器启用桥接器
 */
export const inspectorEnableBridge = crossIframeBridge({
  /**
   * 初始化桥接器
   * 主要流程：
   * 1. 监听启用指令消息
   * 2. 根据窗口层级处理事件派发
   * 3. 协调跨窗口消息同步
   */
  setup() {
    onMessage(INSPECTOR_ENABLE_CROSS_IFRAME, handleInspectorEnable);

    /**
     * 处理检查器启用指令
     * @param {Object} args - 消息参数对象
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
     * @param {Object} args - 消息参数对象
     */
    function broadcastEnableMessage(args) {
      // 全量广播到所有iframe
      postMessageAll(INSPECTOR_ENABLE_CROSS_IFRAME, args);
      // 通过桥接器触发本地监听
      inspectorEnableBridge.emit(args, true);
    }
  },

  /**
   * 消息发送中间件配置
   * 执行顺序：消息发送前依次执行中间件
   */
  emitMiddlewares: [
    /**
     * 顶层窗口消息转发中间件
     * @param {Object} args - 消息参数对象
     */
    (args) => {
      // 确保消息发送到顶层窗口
      postMessage(INSPECTOR_ENABLE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
