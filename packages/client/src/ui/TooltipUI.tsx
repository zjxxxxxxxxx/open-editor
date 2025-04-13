import { clamp } from '@open-editor/shared';
import { mitt } from '../utils/mitt';
import { CssUtils, applyStyle, addClass, removeClass } from '../utils/dom';
import { getDOMRect } from '../utils/getDOMRect';
import { safeArea } from '../utils/safeArea';
import { type BoxPosition } from '../inspector/computedBoxModel';
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
  /** 根容器 DOM 元素 */
  root: HTMLElement;
  /** 显示元素标签的 DOM 节点 */
  tag: HTMLElement;
  /** 显示组件名称的 DOM 节点 */
  comp: HTMLElement;
  /** 显示文件路径的 DOM 节点 */
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
 * 工具提示组件 UI
 *
 * 该组件主要用于显示代码来源和组件信息，并根据盒子模型数据进行位置调整，
 * 同时通过桥接器监听 Inspector 和代码源的变化，实时更新提示内容及位置。
 */
export function TooltipUI() {
  // 样式常量（避免硬编码）：显示提示时添加的类名
  const TOOLTIP_SHOW_CLASS = 'oe-tooltip-show';
  // 渲染保留边距，防止提示元素紧贴窗口边缘
  const RENDER_RESERVE_SIZE = 4;

  const elements = {} as TooltipUIElements;
  const state: TooltipUIState = {
    isPending: false,
  };
  // mitt 用于存放 pending 状态下挂起的任务
  const pending = mitt();

  // 初始化各桥接器事件监听器
  initBridgeListeners();

  /**
   * 初始化所有桥接器事件监听器
   *
   * 包括检查器启用、退出、代码源更新和盒子模型数据更新等
   */
  function initBridgeListeners() {
    inspectorEnableBridge.on(handleInspectorEnable);
    inspectorExitBridge.on(handleInspectorExit);
    codeSourceBridge.on(updateSource);
    boxModelBridge.on(handlePositionUpdate);
  }

  /**
   * 处理检查器激活事件
   *
   * 为提示组件添加显示样式
   */
  function handleInspectorEnable() {
    addClass(elements.root, TOOLTIP_SHOW_CLASS);
  }

  /**
   * 处理检查器退出事件
   *
   * 移除提示显示样式，同时重新更新代码源信息（通常用以清空展示）
   */
  function handleInspectorExit() {
    removeClass(elements.root, TOOLTIP_SHOW_CLASS);
    updateSource();
  }

  /**
   * 处理盒子模型更新事件
   *
   * 当盒子模型数据更新时，检测当前是否处于 pending 状态，
   * 如果是，则挂起此次更新，否则直接更新提示位置
   *
   * @param position 目标元素的边界信息
   */
  function handlePositionUpdate(position: BoxPosition) {
    const executor = () => updatePosition(position);
    if (state.isPending) {
      // pending.once 确保 pending 中的任务只会执行一次
      pending.once(executor);
    } else {
      executor();
    }
  }

  /**
   * 更新代码源信息
   *
   * 根据传入的数据更新提示内部显示的文本内容，同时临时隐藏提示（保留边距）。
   * 无论是否传入有效数据，都在更新完成后解除挂起状态并执行挂起任务。
   *
   * @param source 代码源数据，包含元素和元数据信息
   */
  function updateSource(source?: CodeSource) {
    state.isPending = true;
    // 隐藏提示，暂时将位置设置在预留边距处，防止内容更新过程中产生抖动
    applyStyle(elements.root, {
      visibility: 'hidden',
      transform: CssUtils.translate(RENDER_RESERVE_SIZE, RENDER_RESERVE_SIZE),
    });

    if (source?.meta) {
      // 更新 DOM 内显示的文本内容
      elements.tag.textContent = `${source.el} in `;
      elements.comp.textContent = `<${source.meta.name}>`;
      elements.file.textContent = `${source.meta.file}:${source.meta.line}:${source.meta.column}`;

      // 解除挂起状态并执行 pending 中的任务
      state.isPending = false;
      pending.emit();
    }
  }

  /**
   * 更新工具提示位置
   *
   * 根据目标元素的边界数据、提示元素尺寸以及窗口与安全区域限制，
   * 计算出提示应显示的位置，并将提示设置为可见。
   *
   * @param position 目标元素的边界信息
   */
  function updatePosition(position: BoxPosition) {
    // 获取窗口可视区域尺寸
    const { clientWidth: winW, clientHeight: winH } = document.documentElement;
    // 获取提示 DOM 元素实际尺寸
    const { width: rootW, height: rootH } = getDOMRect(elements.root);

    // 计算 X 轴显示位置
    const renderX = calculateRenderX(winW, rootW, position);
    // 计算 Y 轴显示位置
    const renderY = calculateRenderY(winH, rootH, position);

    // 应用最终样式，使提示显示在指定位置
    applyStyle(elements.root, {
      visibility: 'visible',
      transform: CssUtils.translate(renderX, renderY),
    });
  }

  /**
   * 计算 X 轴渲染坐标
   *
   * 根据目标元素左侧位置、提示宽度、窗口尺寸以及安全区域边距，
   * 使用 clamp 限制显示位置不超出范围。
   *
   * @param winWidth 窗口宽度
   * @param rootWidth 提示元素宽度
   * @param position 目标元素的边界信息
   * @returns 限制后的 X 坐标
   */
  function calculateRenderX(winWidth: number, rootWidth: number, position: BoxPosition) {
    const minX = safeArea.left + RENDER_RESERVE_SIZE;
    const maxX = winWidth - rootWidth - safeArea.right - RENDER_RESERVE_SIZE;
    return clamp(position.left, minX, maxX);
  }

  /**
   * 计算 Y 轴渲染坐标
   *
   * 根据目标元素的位置及尺寸、提示高度、窗口尺寸以及安全区域边距，
   * 判断是向上显示还是向下显示，并使用 clamp 限制显示区域。
   *
   * @param winHeight 窗口高度
   * @param rootHeight 提示元素高度
   * @param position 目标元素的边界信息
   * @returns 限制后的 Y 坐标
   */
  function calculateRenderY(winHeight: number, rootHeight: number, position: BoxPosition) {
    // 判断当提示显示在目标上方时，是否能够正常展示
    const minAvailableY = rootHeight + safeArea.top + RENDER_RESERVE_SIZE * 2;
    const isTopPosition = position.top > minAvailableY;
    // 若满足条件则计算上方显示的坐标，否则显示在下方
    const targetY = isTopPosition
      ? position.top - rootHeight - RENDER_RESERVE_SIZE
      : position.bottom + RENDER_RESERVE_SIZE;

    const minY = safeArea.top + RENDER_RESERVE_SIZE;
    const maxY = winHeight - rootHeight - safeArea.bottom - RENDER_RESERVE_SIZE;
    return clamp(targetY, minY, maxY);
  }

  // 返回工具提示的自定义 JSX 结构，通过 ref 回调保存 DOM 元素引用
  return (
    <div className="oe-tooltip" ref={(el) => (elements.root = el)}>
      <div className="oe-tooltip-content">
        <span className="oe-tooltip-tag" ref={(el) => (elements.tag = el)} />
        <span className="oe-tooltip-comp" ref={(el) => (elements.comp = el)} />
        <span className="oe-tooltip-file" ref={(el) => (elements.file = el)} />
      </div>
    </div>
  );
}
