import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_ACTIVE_CROSS_IFRAME } from '../constants';

export type InspectorActiveBridgeArgs = [string];

// 创建跨 iframe 桥接器实例
export const inspectorActiveBridge = crossIframeBridge<InspectorActiveBridgeArgs>({
  setup() {
    // 注册全局消息监听
    onMessage<InspectorActiveBridgeArgs>(INSPECTOR_ACTIVE_CROSS_IFRAME, (args) => {
      // 向所有关联窗口广播消息
      postMessageAll(INSPECTOR_ACTIVE_CROSS_IFRAME, args);

      // 触发桥接器事件（第二个参数表示跳过中间件）
      inspectorActiveBridge.emit(args, true);
    });
  },

  /**
   * 消息发送中间件配置，用于处理消息发送前的逻辑
   */
  emitMiddlewares: [
    (args) => {
      // 中间件：向顶层窗口发送消息
      postMessage(INSPECTOR_ACTIVE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
