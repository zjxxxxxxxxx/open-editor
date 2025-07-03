import { IS_CLIENT } from '../constants';

/**
 * 虚拟同源顶级窗口对象，用于实现同源策略下的跨 iframe 通信
 */
export const topWindow = IS_CLIENT ? findTopWindow() : undefined;

/**
 * 判断当前窗口是否为虚拟顶级窗口，用于识别当前执行环境层级
 */
export const isTopWindow = IS_CLIENT && topWindow === window;

/**
 * 在顶级窗口环境下执行操作
 *
 * @param yes - 当处于顶级窗口时的回调函数
 * @param no - 非顶级窗口时的备用回调（可选）
 */
export function whenTopWindow(yes: () => void, no?: () => void) {
  if (isTopWindow) {
    yes();
  } else {
    no?.();
  }
}

/**
 * 获取虚拟同源顶级窗口对象
 * @returns 当前 iframe 层级中的顶级窗口对象
 */
function findTopWindow() {
  let currentWindow: Window = window;

  // 逐级向上查找，直到找到无父容器的窗口对象
  while (currentWindow.frameElement) {
    currentWindow = currentWindow.parent;
  }

  return currentWindow;
}
