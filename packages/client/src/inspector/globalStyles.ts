import { createStyleController } from '../utils/createStyleController';

/**
 * 全局样式覆盖模块
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
