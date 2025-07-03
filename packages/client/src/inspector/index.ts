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

// 加载样式常量（避免硬编码）
const LOADING_CLASS = 'oe-loading';

/**
 * 初始化检测器核心功能
 */
export function setupInspector() {
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
 */
function initPointerEvents() {
  const emitActive = () => inspectorActiveBridge.emit([CURRENT_INSPECT_ID]);

  on('pointerdown', emitActive, { capture: true });
  on('pointermove', emitActive, { capture: true });
}

/**
 * 初始化键盘事件监听
 */
function initKeyboardEvents() {
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
 */
function shouldToggleInspector(e: KeyboardEvent) {
  return !inspectorState.isTreeOpen && e.altKey && e.metaKey && e.code === 'KeyO';
}

/**
 * 切换检测器工作模式
 */
function toggleInspectorMode() {
  if (inspectorState.isEnable) {
    inspectorExitBridge.emit();
  } else {
    inspectorEnableBridge.emit();
  }
}

/**
 * 初始化桥接器监听
 */
function initBridgeListeners() {
  inspectorActiveBridge.on(handleActiveChange);
  inspectorEnableBridge.on(inspectorEnable);
  inspectorExitBridge.on(inspectorExit);
  treeOpenBridge.on(handleTreeOpen);
  treeCloseBridge.on(handleTreeClose);
}

/**
 * 处理激活状态变更
 */
function handleActiveChange(activeId: string) {
  inspectorState.isActive = activeId === CURRENT_INSPECT_ID;

  if (!inspectorState.isActive && inspectorState.isRendering) {
    inspectorState.isRendering = false;
    inspectorState.activeEl = null;
  }
}

/**
 * 处理树视图展开
 */
function handleTreeOpen() {
  inspectorState.isTreeOpen = true;
  if (!inspectorState.isEnable) {
    overrideStyle.mount();
  }
}

/**
 * 处理树视图关闭
 */
function handleTreeClose() {
  inspectorState.isTreeOpen = false;
  if (!inspectorState.isEnable) {
    overrideStyle.unmount();
  }
}

/**
 * 初始化编辑器相关监听
 */
function initEditorListeners() {
  openEditorBridge.on(openEditor);
  openEditorStartBridge.on(() => addClass(document.body, LOADING_CLASS));
  openEditorEndBridge.on(() => removeClass(document.body, LOADING_CLASS));
}
