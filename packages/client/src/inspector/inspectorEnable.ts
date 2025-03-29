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
 * - 用于卸载事件监听
 * - 置空表示未初始化状态
 */
let cleanListeners: (() => void) | null = null;

/**
 * 启用检查器功能
 * - 初始化状态
 * - 设置全局事件监听
 * - 应用样式覆盖
 */
export async function inspectorEnable() {
  try {
    // 配置获取与状态初始化
    const { disableHoverCSS: isDisableHoverCSS } = getOptions();
    inspectorState.isEnable = true;
    inspectorState.activeEl = getActiveElement();

    // 界面渲染
    renderUI();

    // 事件监听设置
    cleanListeners = setupListeners({
      onActive: () => renderUI(),
      onOpenTree: (el) => treeOpenBridge.emit([resolveSource(el, true)]),
      onOpenEditor: (el) => openEditorBridge.emit([resolveSource(el).meta]),
      onExitInspect: () => inspectorExitBridge.emit(),
    });

    // 样式处理
    if (isDisableHoverCSS) await disableHoverCSS();
    overrideStyle.mount();

    // 解除当前焦点状态
    // @ts-ignore 主动解除焦点兼容处理
    document.activeElement?.blur();
  } catch (e) {
    console.log(e);
    // 静默处理初始化异常
  }
}

/**
 * 关闭检查器功能
 * - 重置状态机
 * - 清理事件监听
 * - 恢复原始样式
 */
export async function inspectorExit() {
  try {
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

    // 解除当前焦点状态
    // @ts-ignore 主动解除焦点兼容处理
    document.activeElement?.blur();
  } catch {
    // 静默处理关闭异常
  }
}
