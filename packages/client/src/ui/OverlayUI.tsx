import { CssUtils, applyStyle, addClass, removeClass } from '../utils/dom';
import { type BoxLines, type BoxRect, getDefaultBoxModel } from '../inspector/getBoxModel';
import { inspectorEnableBridge, inspectorExitBridge, boxModelBridge } from '../bridge';

/**
 * 叠加层元素引用集合
 */
interface OverlayUIElements {
  /**
   * 定位层容器元素
   * 用于控制整体位置和尺寸
   */
  position: HTMLElement;
  /**
   * 外边距层元素
   * 展示目标元素的外边距区域
   */
  margin: HTMLElement;
  /**
   * 边框层元素
   * 展示目标元素的边框区域
   */
  border: HTMLElement;
  /**
   * 内边距层元素
   * 展示目标元素的内边距区域
   */
  padding: HTMLElement;
}

/**
 * 盒模型可视化叠加层组件
 * 用于高亮显示元素的盒模型结构（margin/border/padding）
 */
export function OverlayUI() {
  // 组件元素引用存储
  const elements: OverlayUIElements = {} as OverlayUIElements;

  // 初始化事件监听
  initBridgeListeners();

  // 初始化事件监听
  function initBridgeListeners() {
    // 启用检测模式时显示叠加层
    inspectorEnableBridge.on(() => {
      addClass(elements.position, 'oe-overlay-show');
    });

    // 退出检测模式时隐藏叠加层并重置模型
    inspectorExitBridge.on(() => {
      removeClass(elements.position, 'oe-overlay-show');
      updateBoxModel(...getDefaultBoxModel());
    });

    // 盒模型数据更新时同步样式
    boxModelBridge.on(updateBoxModel);
  }

  /**
   * 更新盒模型可视化样式
   * @param rect 目标元素的位置尺寸数据
   * @param lines 盒模型各区域的边界数据
   */
  function updateBoxModel(rect: BoxRect, lines: BoxLines) {
    // 更新定位层尺寸和位置
    applyStyle(elements.position, {
      width: CssUtils.numberToPx(rect.width),
      height: CssUtils.numberToPx(rect.height),
      transform: CssUtils.translate(rect.left, rect.top),
    });

    // 遍历更新各区域边框样式
    Object.keys(lines).forEach((key) => {
      const element = elements[key as keyof OverlayUIElements];
      const lineData = lines[key as keyof BoxLines];

      applyStyle(element, {
        borderTopWidth: CssUtils.numberToPx(lineData.top),
        borderRightWidth: CssUtils.numberToPx(lineData.right),
        borderBottomWidth: CssUtils.numberToPx(lineData.bottom),
        borderLeftWidth: CssUtils.numberToPx(lineData.left),
      });
    });
  }

  return (
    <div className="oe-overlay" ref={(el) => (elements.position = el!)}>
      <div className="oe-overlay-margin" ref={(el) => (elements.margin = el!)}>
        <div className="oe-overlay-border" ref={(el) => (elements.border = el!)}>
          <div className="oe-overlay-padding" ref={(el) => (elements.padding = el!)}>
            <div className="oe-overlay-content" />
          </div>
        </div>
      </div>
    </div>
  );
}
