import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_ACTIVE_CROSS_IFRAME } from '../constants';

// 创建跨iframe桥接器实例
export const inspectorActiveBridge = crossIframeBridge<[string]>({
  setup() {
    // 注册全局消息监听
    onMessage<[string]>(INSPECTOR_ACTIVE_CROSS_IFRAME, (args) => {
      // 向所有关联窗口广播消息
      postMessageAll(INSPECTOR_ACTIVE_CROSS_IFRAME, args);

      // 触发桥接器事件（第二个参数表示跳过中间件）
      inspectorActiveBridge.emit(args, true);
    });
  },

  emitMiddlewares: [
    // 中间件：向顶层窗口发送消息
    (args) => {
      postMessage(
        INSPECTOR_ACTIVE_CROSS_IFRAME,
        args,
        topWindow, // 指定消息发送目标为顶层窗口
      );
    },
  ],
});
