// 导入工具模块
import { addClass, removeClass } from '../utils/dom';
import { on } from '../event';
import { CURRENT_INSPECT_ID } from '../constants';
import {
  inspectorActiveBridge,
  inspectorEnableBridge,
  inspectorExitBridge,
  treeOpenBridge,
  treeCloseBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
} from '../bridge';
import { effectStyle, overrideStyle } from './globalStyles';
import { openEditor } from './openEditor';
import { inspectorEnable, inspectorExit } from './inspectorEnable';
import { inspectorState } from './inspectorState';

/**
 * 初始化检测器核心功能
 *
 * 功能模块：
 * 1. 挂载基础效果样式
 * 2. 绑定全局事件监听
 * 3. 初始化桥接器通信
 * 4. 管理编辑器加载状态
 */
export function setupInspector(): void {
  // 挂载基础高亮样式
  effectStyle.mount();

  // 初始化事件监听
  initPointerEvents();
  initKeyboardEvents();

  // 初始化桥接监听
  initBridgeListeners();

  // 初始化编辑器相关监听
  initEditorListeners();
}

/**
 * 初始化指针事件监听
 *
 * 处理元素激活状态检测：
 * - pointerdown: 点击激活
 * - pointermove: 悬停激活
 */
function initPointerEvents(): void {
  const emitActive = () => inspectorActiveBridge.emit([CURRENT_INSPECT_ID]);

  on('pointerdown', emitActive, { capture: true });
  on('pointermove', emitActive, { capture: true });
}

/**
 * 初始化键盘事件监听
 *
 * 处理检测器模式切换：
 * - Alt + Cmd + O: 切换检测器模式
 */
function initKeyboardEvents(): void {
  on(
    'keydown',
    (e: KeyboardEvent) => {
      if (shouldToggleInspector(e)) {
        toggleInspectorMode();
      }
    },
    { capture: true },
  );
}

/**
 * 判断是否触发模式切换
 *
 * @条件验证：
 * 1. 元素树未展开
 * 2. 组合键 Alt + Cmd + O
 * 3. 键码为KeyO
 */
function shouldToggleInspector(e: KeyboardEvent): boolean {
  return !inspectorState.isTreeOpen && e.altKey && e.metaKey && e.code === 'KeyO';
}

/**
 * 切换检测器工作模式
 *
 * 根据当前状态切换：
 * - 禁用 → 启用检测器
 * - 启用 → 退出检测器
 */
function toggleInspectorMode(): void {
  if (inspectorState.isEnable) {
    inspectorExitBridge.emit();
  } else {
    inspectorEnableBridge.emit();
  }
}

/**
 * 初始化桥接器监听
 *
 * 管理状态变更和视图控制：
 * 1. 激活状态同步
 * 2. 树视图展开控制
 * 3. 检测器模式切换
 */
function initBridgeListeners(): void {
  inspectorActiveBridge.on(handleActiveChange);
  inspectorEnableBridge.on(inspectorEnable);
  inspectorExitBridge.on(inspectorExit);
  treeOpenBridge.on(handleTreeOpen);
  treeCloseBridge.on(handleTreeClose);
}

/**
 * 处理激活状态变更
 *
 * 当检测器失活时：
 * - 重置渲染状态
 * - 清空激活元素引用
 */
function handleActiveChange(activeId: string): void {
  inspectorState.isActive = activeId === CURRENT_INSPECT_ID;

  if (!inspectorState.isActive && inspectorState.isRendering) {
    inspectorState.isRendering = false;
    inspectorState.activeEl = null;
  }
}

/**
 * 处理树视图展开
 *
 * 当树视图展开且检测器禁用时：
 * 挂载覆盖样式
 */
function handleTreeOpen(): void {
  inspectorState.isTreeOpen = true;
  if (!inspectorState.isEnable) {
    overrideStyle.mount();
  }
}

/**
 * 处理树视图关闭
 *
 * 当树视图关闭且检测器禁用时：
 * 移除覆盖样式
 */
function handleTreeClose(): void {
  inspectorState.isTreeOpen = false;
  if (!inspectorState.isEnable) {
    overrideStyle.unmount();
  }
}

/**
 * 初始化编辑器相关监听
 *
 * 管理编辑器加载状态：
 * - 开始加载时添加加载样式
 * - 结束加载时移除加载样式
 */
function initEditorListeners(): void {
  openEditorBridge.on(openEditor);
  openEditorStartBridge.on(() => addClass(document.body, 'oe-loading'));
  openEditorEndBridge.on(() => removeClass(document.body, 'oe-loading'));
}
