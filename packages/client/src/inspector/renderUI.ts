import { boxModelBridge, codeSourceBridge } from '../bridge';
import { resolveSource } from '../resolve';
import { computedBoxModel } from './computedBoxModel';
import { inspectorState } from './inspectorState';

/**
 * 触发 UI 更新并启动渲染循环
 */
export function renderUI() {
  if (!inspectorState.activeEl) return;

  // 发送源码定位和盒模型数据
  codeSourceBridge.emit([resolveSource(inspectorState.activeEl)]);
  boxModelBridge.emit(computedBoxModel(inspectorState.activeEl));

  // 启动渲染循环（幂等设计，避免重复启动）
  if (!inspectorState.isRendering) {
    inspectorState.isRendering = true;
    requestAnimationFrame(renderNextFrame);
  }
}

/**
 * 持续更新 UI 状态
 */
function renderNextFrame() {
  // 确保处于有效渲染周期
  if (!inspectorState.isRendering) return;

  // 缓存当前激活元素
  const prevElement = inspectorState.prevActiveEl;
  const currentElement = inspectorState.activeEl;

  // 处理元素变更或移除情况
  handleElementState(prevElement, currentElement);
  // 更新盒模型数据（空值处理）
  boxModelBridge.emit(computedBoxModel(currentElement));

  inspectorState.prevActiveEl = currentElement;

  // 继续下一帧渲染
  requestAnimationFrame(renderNextFrame);
}

/**
 * 校验元素有效性并同步状态
 */
function handleElementState(prev: HTMLElement | null, current: HTMLElement | null) {
  // 元素连接状态校验
  if (current?.isConnected === false) {
    inspectorState.activeEl = null;
    current = null;
  }

  // 状态变更检测
  if (prev !== current) {
    // 源码定位桥接，空值表示清除高亮
    codeSourceBridge.emit(current ? [resolveSource(current)] : []);
  }

  // 当前无激活元素且前一帧存在元素
  if (!current && prev) {
    inspectorState.isRendering = false;
  }
}
