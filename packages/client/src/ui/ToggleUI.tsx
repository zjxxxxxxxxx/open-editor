import { clamp } from '@open-editor/shared';
import { CssUtils, applyStyle, addClass, removeClass } from '../utils/dom';
import { safeArea, safeAreaObserver } from '../utils/safeArea';
import { inspectorState } from '../inspector/inspectorState';
import { off, on } from '../event';
import { inspectorEnableBridge, inspectorExitBridge } from '../bridge';

/**
 * 组件元素引用集合接口，用于存放组件内操作所需的 DOM 元素引用，
 * 以便后续操作时直接访问
 */
interface ToggleUIElements {
  /** 根容器元素，用于整体组件位置、样式设置 */
  root: HTMLElement;
  /** 操作按钮元素，触发状态切换和拖拽操作 */
  button: HTMLElement;
}

/**
 * 组件状态接口，包含组件操作状态，如是否处于拖拽状态和当前设备是否支持触摸事件
 */
interface ToggleUIState {
  /** 标识组件是否正在进行拖拽操作 */
  dragging: boolean;
  /** 标识当前设备是否支持触摸操作 */
  touchable: boolean;
}

/**
 * ToggleUI 组件
 *
 * 该组件通过自定义的 JSX 返回一个包含按钮的视图，
 * 实现了拖拽调整位置、切换状态（启用/退出检查器）以及适配触摸屏的功能
 */
export function ToggleUI() {
  // 定义拖拽过程中添加到组件上的 CSS 类名
  const DRAGGING_CLASS = 'oe-toggle-dnd';
  // 定义触摸设备时添加的 CSS 类名
  const TOUCH_DEVICE_CLASS = 'oe-toggle-touch';

  // 初始化元素引用和内部状态，初始状态均设定为 false
  const elements: ToggleUIElements = {} as ToggleUIElements;
  const state: ToggleUIState = {
    dragging: false,
    touchable: false,
  };

  // 初始化桥接器事件监听，如检查器开启或退出时更新按钮样式
  initBridgeListeners();
  // 初始化全局事件监听，如窗口尺寸变化、安全区域变化等
  initEventListeners();

  /**
   * 初始化桥接器事件监听
   */
  function initBridgeListeners() {
    inspectorEnableBridge.on(() => {
      applyStyle(elements.button, { color: 'var(--cyan)' });
    });
    inspectorExitBridge.on(() => {
      applyStyle(elements.button, { color: null });
    });
  }

  /**
   * 初始化全局事件监听
   */
  function initEventListeners() {
    safeAreaObserver.on(updatePosition);
    on('resize', updatePosition);
    on('resize', updateSize);
  }

  /**
   * 切换检查器状态
   */
  function toggleEnable() {
    if (!state.dragging) {
      if (inspectorState.isEnable) {
        inspectorExitBridge.emit();
      } else {
        inspectorEnableBridge.emit();
      }
    }
  }

  /**
   * 开始拖拽操作
   */
  function startDragging() {
    state.dragging = true;
    addClass(elements.root, DRAGGING_CLASS);
    on('pointermove', changePosition);
    on('pointerup', stopDragging);
  }

  /**
   * 结束拖拽操作
   */
  function stopDragging() {
    setTimeout(() => (state.dragging = false), 0);
    removeClass(elements.root, DRAGGING_CLASS);
    off('pointermove', changePosition);
    off('pointerup', stopDragging);
  }

  /**
   * 处理指针移动事件，更新按钮位置
   * @param e 指针事件对象，包含指针在窗口中的位置信息
   */
  function changePosition(e: PointerEvent) {
    localStorage['oe-pt'] = e.clientY.toString();
    updatePosition();
  }

  /**
   * 更新按钮尺寸（主要用于适配触摸设备）
   */
  function updateSize() {
    const isTouchable =
      'maxTouchPoints' in navigator ? navigator.maxTouchPoints > 0 : 'ontouchstart' in window;
    if (state.touchable !== isTouchable) {
      if (isTouchable) {
        addClass(elements.root, TOUCH_DEVICE_CLASS);
      } else {
        removeClass(elements.root, TOUCH_DEVICE_CLASS);
      }
      state.touchable = isTouchable;
    }
  }

  /**
   * 更新按钮定位
   */
  function updatePosition() {
    const { innerHeight: winH } = window;
    const { offsetHeight: toggleH } = elements.root;
    // 从 localStorage 获取上次拖拽存储的纵向位置，若无则默认 0
    const cacheY = +localStorage['oe-pt'] || 0;

    const minRenderY = safeArea.top;
    const maxRenderY = winH - toggleH - safeArea.bottom;
    const renderY = clamp(cacheY - toggleH / 2, minRenderY, maxRenderY);

    applyStyle(elements.root, {
      top: CssUtils.numberToPx(renderY),
      right: CssUtils.numberToPx(safeArea.right),
    });
  }

  return (
    <div
      className="oe-toggle"
      ref={(el) => {
        elements.root = el;
        // 初次渲染时立即更新按钮定位与尺寸
        updatePosition();
        updateSize();
      }}
      onTouchMove={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="oe-toggle-overlay" />
      <button
        className="oe-toggle-button"
        ref={(el) => (elements.button = el)}
        // 点击触发检查器状态切换
        onClick={toggleEnable}
        // 长按触发拖拽操作
        onLongPress={startDragging}
      >
        <svg viewBox="0 0 1024 1024" width="100%" height="100%" fill="currentColor">
          {/* 外部 SVG 图标路径 */}
          <path d="M512 134.07031223a26.3671875 26.3671875 0 0 1 26.2441409 23.8359375L538.3671875 160.43749973v70.31250054l-0.05273438 1.23046848c134.33203098 12.4453125 241.25976563 119.390625 253.72265598 253.72265598L793.24999973 485.6328125h70.31250054a26.3671875 26.3671875 0 0 1 2.53125 52.6113284L863.56250027 538.3671875h-70.31250054l-1.23046848-0.05273438c-12.4453125 134.33203098-119.37304715 241.25976563-253.70507812 253.72265598L538.3671875 793.24999973v70.31250054a26.3671875 26.3671875 0 0 1-52.6113284 2.53125L485.6328125 863.56250027v-70.31250054l0.07031223-1.21289063c-134.33203098-12.46289035-241.27734348-119.390625-253.74023383-253.72265597L230.75000027 538.3671875H160.43749973a26.3671875 26.3671875 0 0 1-2.53125-52.6113284L160.43749973 485.6328125h70.31250054l1.21289063 0.07031223c12.46289035-134.34960965 119.390625-241.27734348 253.74023383-253.74023383L485.6328125 230.75000027V160.43749973A26.3671875 26.3671875 0 0 1 512 134.07031223z m0 147.83203179c-127.08984375 0-230.09765598 103.00781223-230.09765598 230.09765598 0 127.08984375 103.00781223 230.09765598 230.09765598 230.09765598 127.08984375 0 230.09765598-103.00781223 230.09765598-230.09765598 0-127.08984375-103.00781223-230.09765598-230.09765598-230.09765598z" />
          <path d="M512 388.95312527a123.04687473 123.04687473 0 1 0 0 246.09374946 123.04687473 123.04687473 0 0 0 0-246.09374946z m0 49.21874973a73.828125 73.828125 0 1 1 0 147.65625 73.828125 73.828125 0 0 1 0-147.65625z" />
        </svg>
      </button>
    </div>
  );
}
