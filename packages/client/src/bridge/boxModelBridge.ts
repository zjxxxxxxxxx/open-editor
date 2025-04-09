import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type BoxMetrics, type BoxRect, getBoxModel } from '../inspector/getBoxModel';
import { inspectorState } from '../inspector/inspectorState';
import { BOX_MODEL_CROSS_IFRAME } from '../constants';

export type BoxModelBridgeArgs = [BoxRect, BoxMetrics];

/**
 * 跨 iframe 的盒模型计算桥接器
 */
export const boxModelBridge = crossIframeBridge<BoxModelBridgeArgs>({
  /**
   * 初始化消息监听
   *
   * 当接收到盒模型计算请求时，仅在检查器启用状态下触发事件
   */
  setup() {
    onMessage<BoxModelBridgeArgs>(BOX_MODEL_CROSS_IFRAME, (args) => {
      if (inspectorState.isEnable) {
        boxModelBridge.emit(args, isTopWindow);
      }
    });
  },

  /**
   * 消息发送中间件处理管道
   *
   * 包含两个处理步骤：
   * 1. 修正 iframe 嵌套时的坐标偏移
   * 2. 在顶层窗口时向父窗口转发消息
   */
  emitMiddlewares: [
    /**
     * 中间件：修正 iframe 嵌套时的坐标偏移
     *
     * @param args 包含矩形坐标和辅助线的参数数组
     * @param next 执行下一个中间件的回调
     */
    ([rect], next) => {
      // 仅在存在父 iframe 时执行计算
      if (window.frameElement) {
        // 获取当前 iframe 容器的盒模型数据
        const [position, { margin, border, padding }] = getBoxModel(
          window.frameElement as HTMLElement,
        )!;

        const height = rect.bottom - rect.top;
        const width = rect.right - rect.left;

        // 计算所有影响定位的差值
        const frameDifference = [position, margin, border, padding];
        frameDifference.forEach(({ top, left }) => {
          rect.top += top;
          rect.left += left;
        });

        // 更新底部和右侧坐标
        rect.bottom = rect.top + height;
        rect.right = rect.left + width;
      }

      next();
    },

    /**
     * 中间件：顶层窗口消息转发
     *
     * @param args 需要转发的参数
     * @param next 执行后续处理的回调
     */
    (args, next) => {
      // 确保沿着父窗口向顶层窗口执行消息发送
      whenTopWindow(next, () => {
        postMessage(BOX_MODEL_CROSS_IFRAME, args, window.parent);
      });
    },
  ],
});
