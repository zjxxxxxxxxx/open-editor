import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage, postMessageAll } from '../utils/message';
import { eventBlocker } from '../utils/eventBlocker';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';

export type TreeOpenBridgeArgs = [CodeSource, boolean?];

/**
 * 树形结构打开事件桥接器，处理跨 iframe 的树形结构打开事件通信
 */
export const treeOpenBridge = crossIframeBridge<TreeOpenBridgeArgs>({
  /**
   * 初始化配置
   */
  setup() {
    // 注册全局事件监听
    onMessage<TreeOpenBridgeArgs>(TREE_OPEN_CROSS_IFRAME, (args) => {
      // 判断事件来源层级
      const isFromTopWindow = (args[1] ||= isTopWindow);

      // 顶层窗口处理逻辑
      if (isFromTopWindow) {
        // 向所有 iframe 广播打开事件
        postMessageAll(TREE_OPEN_CROSS_IFRAME, args);
        // 挂载事件遮罩层
        eventBlocker.activate();
      }

      // 触发桥接器事件传播
      treeOpenBridge.emit(args, isFromTopWindow);
    });
  },

  /**
   * 消息发送中间件配置，包含组件解析和消息路由逻辑
   */
  emitMiddlewares: [
    /**
     * 解析 iframe 组件
     * @param source 代码组件对象
     * @param next 后续处理回调
     */
    ([source], next) => {
      // 在 iframe 环境解析宿主元素
      if (window.frameElement) {
        // 解析当前 iframe 的组件树
        const { tree } = resolveSource(window.frameElement as HTMLElement, true);
        // 更新组件树结构
        source.tree.push(...tree);
      }

      // 执行后续中间件
      next();
    },

    /**
     * 智能路由消息发送
     * @param args 事件参数数组
     */
    (args) => {
      // 根据窗口层级选择消息接收方
      whenTopWindow(
        // 顶层窗口直接发送
        () => postMessage(TREE_OPEN_CROSS_IFRAME, args, topWindow),
        // 子窗口发送给父级窗口
        () => postMessage(TREE_OPEN_CROSS_IFRAME, args, window.parent),
      );
    },
  ],
});
