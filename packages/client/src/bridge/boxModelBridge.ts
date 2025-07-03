import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type BoxModel, computedBoxModel } from '../inspector/computedBoxModel';
import { inspectorState } from '../inspector/inspectorState';
import { BOX_MODEL_CROSS_IFRAME } from '../constants';

/**
 * 跨 iframe 的盒模型计算桥接器
 */
export const boxModelBridge = crossIframeBridge<BoxModel>({
  /**
   * 初始化消息监听
   *
   * 当接收到盒模型计算请求时，仅在检查器启用状态下触发事件
   */
  setup() {
    onMessage<BoxModel>(BOX_MODEL_CROSS_IFRAME, (args) => {
      if (inspectorState.isEnable) {
        boxModelBridge.emit(args, isTopWindow);
      }
    });
  },

  /**
   * 消息发送中间件处理管道
   */
  emitMiddlewares: [
    /**
     * 修正 iframe 嵌套时的坐标偏移
     *
     * @param args 包含矩形坐标和辅助线的参数数组
     * @param next 执行下一个中间件的回调
     */
    ([rect], next) => {
      // 仅在存在父 iframe 时执行计算
      if (window.frameElement) {
        // 获取当前 iframe 容器的盒模型数据
        const [position, metrics] = computedBoxModel(window.frameElement as HTMLElement);
        // 计算所有影响定位的差值
        const offsetDifference = [position, ...Object.values(metrics)];

        offsetDifference.forEach(({ top, left }) => {
          rect.top += top;
          rect.right += left;
          rect.bottom += top;
          rect.left += left;
        });
      }

      next();
    },

    /**
     * 顶层窗口消息转发
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
