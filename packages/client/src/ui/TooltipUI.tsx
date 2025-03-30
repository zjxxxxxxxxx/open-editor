import { clamp } from '@open-editor/shared';
import { mitt } from '../utils/mitt';
import { CssUtils, applyStyle, addClass, removeClass } from '../utils/dom';
import { getDOMRect } from '../utils/getDOMRect';
import { safeArea } from '../utils/safeArea';
import { type BoxRect } from '../inspector/getBoxModel';
import { type CodeSource } from '../resolve';
import {
  inspectorEnableBridge,
  inspectorExitBridge,
  boxModelBridge,
  codeSourceBridge,
} from '../bridge';

/**
 * 工具提示组件元素引用集合
 */
interface TooltipUIElements {
  /** 根容器DOM元素 */
  root: HTMLElement;
  /** 显示元素标签的DOM节点 */
  tag: HTMLElement;
  /** 显示组件名称的DOM节点 */
  comp: HTMLElement;
  /** 显示文件路径的DOM节点 */
  file: HTMLElement;
}

/**
 * 工具提示组件状态定义
 */
interface TooltipUIState {
  /** 标识是否处于更新挂起状态 */
  isPending: boolean;
}

/**
 * 工具提示组件UI
 */
export function TooltipUI() {
  // 渲染保留边距，防止元素紧贴窗口边缘
  const RENDER_RESERVE_SIZE = 4;

  const elements = {} as TooltipUIElements;
  const state = {} as TooltipUIState;
  const pending = mitt();

  // 初始化事件监听
  initEventHandlers();

  /**
   * 初始化所有事件监听器
   */
  function initEventHandlers() {
    inspectorEnableBridge.on(handleInspectorEnable);
    inspectorExitBridge.on(handleInspectorExit);
    codeSourceBridge.on(updateSource);
    boxModelBridge.on(handleBoxModelUpdate);
  }

  /**
   * 处理检查器激活事件
   */
  function handleInspectorEnable() {
    addClass(elements.root, 'oe-tooltip-show');
  }

  /**
   * 处理检查器退出事件
   */
  function handleInspectorExit() {
    removeClass(elements.root, 'oe-tooltip-show');
    updateSource();
  }

  /**
   * 处理盒子模型更新事件
   */
  function handleBoxModelUpdate(rect: BoxRect) {
    const executor = () => updateRect(rect);
    if (state.isPending) {
      pending.once(executor);
    } else {
      executor();
    }
  }

  /**
   * 更新代码源信息
   * @param source 代码源数据，包含元素和元数据信息
   */
  function updateSource(source?: CodeSource) {
    state.isPending = true;

    // 隐藏元素并保留渲染空间
    applyStyle(elements.root, {
      visibility: 'hidden',
      transform: CssUtils.translate(RENDER_RESERVE_SIZE, RENDER_RESERVE_SIZE),
    });

    if (source?.meta) {
      // 更新DOM元素内容
      elements.tag.textContent = `${source.el} in `;
      elements.comp.textContent = `<${source.meta.name}>`;
      elements.file.textContent = `${source.meta.file}:${source.meta.line}:${source.meta.column}`;

      // 解除挂起状态并执行待处理任务
      state.isPending = false;
      pending.emit();
    }
  }

  /**
   * 更新工具提示位置
   * @param rect 目标元素的边界矩形信息
   */
  function updateRect(rect: BoxRect) {
    const { clientWidth: winW, clientHeight: winH } = document.documentElement;
    const { width: rootW, height: rootH } = getDOMRect(elements.root);

    // 计算X轴渲染位置
    const renderX = calculateRenderX(winW, rootW, rect.left);

    // 计算Y轴渲染位置
    const renderY = calculateRenderY(winH, rootH, rect);

    // 应用最终样式
    applyStyle(elements.root, {
      visibility: 'visible',
      transform: CssUtils.translate(renderX, renderY),
    });
  }

  /**
   * 计算X轴渲染坐标
   */
  function calculateRenderX(winWidth: number, rootWidth: number, targetLeft: number) {
    const minX = safeArea.left + RENDER_RESERVE_SIZE;
    const maxX = winWidth - rootWidth - safeArea.right - RENDER_RESERVE_SIZE;
    return clamp(targetLeft, minX, maxX);
  }

  /**
   * 计算Y轴渲染坐标
   */
  function calculateRenderY(winHeight: number, rootHeight: number, rect: BoxRect) {
    const minAvailableY = rootHeight + safeArea.top + RENDER_RESERVE_SIZE * 2;
    const isTopPosition = rect.top > minAvailableY;
    const targetY = isTopPosition
      ? rect.top - rootHeight - RENDER_RESERVE_SIZE
      : rect.bottom + RENDER_RESERVE_SIZE;

    const minY = safeArea.top + RENDER_RESERVE_SIZE;
    const maxY = winHeight - rootHeight - safeArea.bottom - RENDER_RESERVE_SIZE;
    return clamp(targetY, minY, maxY);
  }

  return (
    <div className="oe-tooltip" ref={(el) => (elements.root = el!)}>
      <div className="oe-tooltip-content">
        <span className="oe-tooltip-tag" ref={(el) => (elements.tag = el!)} />
        <span className="oe-tooltip-comp" ref={(el) => (elements.comp = el!)} />
        <span className="oe-tooltip-file" ref={(el) => (elements.file = el!)} />
      </div>
    </div>
  );
}
