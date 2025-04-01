import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, topWindow } from '../utils/topWindow';
import { onMessage, postMessage, postMessageAll } from '../utils/message';
import { eventBlocker } from '../utils/eventBlocker';
import { TREE_CLOSE_CROSS_IFRAME } from '../constants';

export type TreeCloseBridgeArgs = [boolean?];

/**
 * 树形结构关闭事件桥接器
 * 处理跨iframe的树形结构关闭事件通信
 */
export const treeCloseBridge = crossIframeBridge<TreeCloseBridgeArgs>({
  /**
   * 初始化配置
   * 监听关闭事件并执行清理操作
   */
  setup() {
    // 注册全局事件监听
    onMessage<TreeCloseBridgeArgs>(TREE_CLOSE_CROSS_IFRAME, (args) => {
      // 参数处理：判断事件来源层级
      const isFromTopWindow = (args[0] ||= isTopWindow);

      // 顶层窗口处理逻辑
      if (isFromTopWindow) {
        // 向所有iframe广播关闭事件
        postMessageAll(TREE_CLOSE_CROSS_IFRAME, args);
        // 移除事件遮罩层
        eventBlocker.deactivate();
      }

      // 触发桥接器事件传播
      treeCloseBridge.emit(args, isFromTopWindow);
    });
  },

  /**
   * 消息发送中间件配置
   * 处理消息发送前的逻辑处理
   */
  emitMiddlewares: [
    /**
     * 中间件逻辑：向顶层窗口发送关闭事件
     * @param args 事件参数数组
     */
    (args) => {
      postMessage(TREE_CLOSE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
