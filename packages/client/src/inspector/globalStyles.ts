import { createStyleController } from '../utils/createStyleController';

/**
 * 全局样式覆盖模块
 *
 * 作用：强制修改浏览器默认行为，用于特殊场景下的交互限制
 */
const overrideCSS = css`
  * {
    cursor: default !important;
    user-select: none !important;
    touch-action: none !important;
    -webkit-touch-callout: none !important;
  }
`;
export const overrideStyle = createStyleController(overrideCSS);

/**
 * 交互效果样式模块
 *
 * 包含：
 * 1. 屏幕锁定样式
 * 2. 加载状态样式
 * 3. 事件阻止层样式
 */
const effectCSS = css`
  .oe-lock-screen {
    overflow: hidden !important;
  }

  .oe-loading * {
    cursor: wait !important;
  }

  .oe-event-blocker {
    position: fixed;
    inset: 0;
    opacity: 0;
    z-index: 2147483647;
  }
`;
export const effectStyle = createStyleController(effectCSS);
