import { clamp } from '@open-editor/shared';
import { CssUtils, applyStyle, addClass, removeClass } from '../utils/dom';
import { safeArea, safeAreaObserver } from '../utils/safeArea';
import { inspectorState } from '../inspector/inspectorState';
import { off, on } from '../event';
import { inspectorEnableBridge, inspectorExitBridge } from '../bridge';

/**
 * 组件元素引用集合
 */
interface ToggleUIElements {
  /**
   * 根容器元素
   */
  root: HTMLElement;
  /**
   * 操作按钮元素
   */
  button: HTMLElement;
}

/**
 * 组件状态接口
 */
interface ToggleUIState {
  /**
   * 是否正在拖拽中
   */
  dnding: boolean;
  /**
   * 是否支持触摸操作
   */
  touchable: boolean;
}

export function ToggleUI() {
  // 拖拽样式常量（避免硬编码）
  const TOGGLE_DND_CLASS = 'oe-toggle-dnd';
  // 触摸样式常量（避免硬编码）
  const TOGGLE_TOUCH_CLASS = 'oe-toggle-touch';

  const elements = {} as ToggleUIElements;
  const state = {} as ToggleUIState;

  // 监听检查器启用事件
  inspectorEnableBridge.on(() => {
    applyStyle(elements.button, { color: 'var(--cyan)' });
  });

  // 监听检查器退出事件
  inspectorExitBridge.on(() => {
    applyStyle(elements.button, { color: null });
  });

  /**
   * 开始拖拽操作
   */
  function startDnD() {
    state.dnding = true;
    addClass(elements.root, TOGGLE_DND_CLASS);
    on('pointermove', changePosition);
    on('pointerup', stopDnD);
  }

  /**
   * 结束拖拽操作
   */
  function stopDnD() {
    // 延迟状态更新确保点击事件完成
    setTimeout(() => (state.dnding = false));
    removeClass(elements.root, TOGGLE_DND_CLASS);
    off('pointermove', changePosition);
    off('pointerup', stopDnD);
  }

  /**
   * 更新按钮位置
   * @param e 指针事件对象
   */
  function changePosition(e: PointerEvent) {
    localStorage['oe-pt'] = e.clientY;
    updatePosition();
  }

  /**
   * 切换检查器状态
   */
  function toggleEnable() {
    // 防止拖拽结束后误触发点击
    if (!state.dnding) {
      if (inspectorState.isEnable) {
        inspectorExitBridge.emit();
      } else {
        inspectorEnableBridge.emit();
      }
    }
  }

  /**
   * 更新按钮尺寸（适配触摸屏）
   */
  function updateSize() {
    const touchable =
      'maxTouchPoints' in navigator ? navigator.maxTouchPoints > 0 : 'ontouchstart' in window;

    if (state.touchable !== touchable) {
      touchable
        ? addClass(elements.root, TOGGLE_TOUCH_CLASS)
        : removeClass(elements.root, TOGGLE_TOUCH_CLASS);
      state.touchable = touchable;
    }
  }

  /**
   * 更新按钮定位
   */
  function updatePosition() {
    const { innerHeight: winH } = window;
    const { offsetHeight: toggleH } = elements.root;
    const cacheY = +localStorage['oe-pt'] || 0;

    // 计算安全显示区域
    const minRenderY = safeArea.top;
    const maxRenderY = winH - toggleH - safeArea.bottom;
    const renderY = clamp(cacheY - toggleH / 2, minRenderY, maxRenderY);

    applyStyle(elements.root, {
      top: CssUtils.numberToPx(renderY),
      right: CssUtils.numberToPx(safeArea.right),
    });
  }

  try {
    return (
      <div
        className="oe-toggle"
        ref={(el) => (elements.root = el!)}
        // 阻止Firefox拖动时的默认滚动行为
        onTouchMove={(e) => e.preventDefault()}
        // 阻止移动端长按触发菜单
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="oe-toggle-overlay" />
        <button
          className="oe-toggle-button"
          ref={(el) => (elements.button = el!)}
          onClick={toggleEnable}
          onLongPress={startDnD}
        >
          <svg viewBox="0 0 1024 1024" width="100%" height="100%" fill="currentColor">
            <path d="M512 134.07031223a26.3671875 26.3671875 0 0 1 26.2441409 23.8359375L538.3671875 160.43749973v70.31250054l-0.05273438 1.23046848c134.33203098 12.4453125 241.25976563 119.390625 253.72265598 253.72265598L793.24999973 485.6328125h70.31250054a26.3671875 26.3671875 0 0 1 2.53125 52.6113284L863.56250027 538.3671875h-70.31250054l-1.23046848-0.05273438c-12.4453125 134.33203098-119.37304715 241.25976563-253.70507812 253.72265598L538.3671875 793.24999973v70.31250054a26.3671875 26.3671875 0 0 1-52.6113284 2.53125L485.6328125 863.56250027v-70.31250054l0.07031223-1.21289063c-134.33203098-12.46289035-241.27734348-119.390625-253.74023383-253.72265597L230.75000027 538.3671875H160.43749973a26.3671875 26.3671875 0 0 1-2.53125-52.6113284L160.43749973 485.6328125h70.31250054l1.21289063 0.07031223c12.46289035-134.34960965 119.390625-241.27734348 253.74023383-253.74023383L485.6328125 230.75000027V160.43749973A26.3671875 26.3671875 0 0 1 512 134.07031223z m0 147.83203179c-127.08984375 0-230.09765598 103.00781223-230.09765598 230.09765598 0 127.08984375 103.00781223 230.09765598 230.09765598 230.09765598 127.08984375 0 230.09765598-103.00781223 230.09765598-230.09765598 0-127.08984375-103.00781223-230.09765598-230.09765598-230.09765598z" />
            <path d="M512 388.95312527a123.04687473 123.04687473 0 1 0 0 246.09374946 123.04687473 123.04687473 0 0 0 0-246.09374946z m0 49.21874973a73.828125 73.828125 0 1 1 0 147.65625 73.828125 73.828125 0 0 1 0-147.65625z" />
          </svg>
        </button>
      </div>
    );
  } finally {
    // 组件挂载后的初始化操作
    updatePosition();
    safeAreaObserver.on(updatePosition);
    on('resize', updatePosition);

    updateSize();
    on('resize', updateSize);
  }
}
