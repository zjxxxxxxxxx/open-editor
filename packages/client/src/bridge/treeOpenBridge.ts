import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage, postMessageAll } from '../utils/message';
import { preventEventOverlay } from '../utils/preventEventOverlay';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';

export type TreeOpenBridgeArgs = [CodeSource, boolean?];

/**
 * 树形结构打开事件桥接器
 * 处理跨iframe的树形结构打开事件通信
 */
export const treeOpenBridge = crossIframeBridge<TreeOpenBridgeArgs>({
  /**
   * 初始化配置
   * 监听打开事件并初始化资源
   */
  setup() {
    // 注册全局事件监听
    onMessage<TreeOpenBridgeArgs>(TREE_OPEN_CROSS_IFRAME, (args) => {
      // 参数处理：判断事件来源层级
      const isFromTopWindow = (args[1] ||= isTopWindow);

      // 顶层窗口处理逻辑
      if (isFromTopWindow) {
        // 向所有iframe广播打开事件
        postMessageAll(TREE_OPEN_CROSS_IFRAME, args);
        // 挂载事件遮罩层
        preventEventOverlay.mount();
      }

      // 触发桥接器事件传播
      treeOpenBridge.emit(args, isFromTopWindow);
    });
  },

  /**
   * 消息发送中间件配置
   * 包含资源解析和消息路由逻辑
   */
  emitMiddlewares: [
    /**
     * 中间件逻辑：解析iframe资源
     * @param source 代码资源对象
     * @param next 后续处理回调
     */
    ([source], next) => {
      // 在iframe环境解析宿主元素
      if (window.frameElement) {
        // 解析当前iframe的资源树
        const { tree } = resolveSource(window.frameElement as HTMLElement, true);
        // 更新资源树结构
        source.tree.push(...tree);
      }

      // 执行后续中间件
      next();
    },

    /**
     * 中间件逻辑：智能路由消息发送
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
