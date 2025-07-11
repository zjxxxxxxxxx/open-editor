import { inspectorExitBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { setupListeners } from './setupListeners';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { getActiveElement } from './getActiveElement';
import { overrideStyle } from './globalStyles';
import { inspectorState } from './inspectorState';
import { renderUI } from './renderUI';

/**
 * 事件监听器清理函数
 */
let cleanListeners: (() => void) | null = null;

/**
 * 启用检查器功能
 */
export async function inspectorEnable() {
  // 配置获取与状态初始化
  const { disableHoverCSS: isDisableHoverCSS } = getOptions();
  inspectorState.isEnable = true;
  inspectorState.activeEl = getActiveElement();

  // 首次渲染需要采用异步的方式
  requestAnimationFrame(renderUI);

  // 事件监听设置
  cleanListeners = setupListeners({
    onActiveElement: () => renderUI(),
    onOpenTree: (el) => treeOpenBridge.emit([resolveSource(el, true)]),
    onOpenEditor: (el) => openEditorBridge.emit([resolveSource(el).meta]),
    onExitInspect: () => inspectorExitBridge.emit(),
  });

  // 样式处理
  if (isDisableHoverCSS) await disableHoverCSS();
  overrideStyle.mount();

  // @ts-ignore 主动解除焦点兼容处理
  document.activeElement?.blur();
}

/**
 * 关闭检查器功能
 */
export async function inspectorExit() {
  // 配置获取与状态重置
  const { disableHoverCSS: isDisableHoverCSS } = getOptions();
  Object.assign(inspectorState, {
    isEnable: false,
    isRendering: false,
    activeEl: null,
  });

  // 事件监听清理
  if (cleanListeners) {
    cleanListeners();
    cleanListeners = null;
  }

  // 样式恢复
  if (isDisableHoverCSS) await enableHoverCSS();
  overrideStyle.unmount();
}
