import { createGlobalStyle } from '../utils/createGlobalStyle';

const overrideCSS = css`
  * {
    cursor: default !important;
    user-select: none !important;
    touch-action: none !important;
    -webkit-touch-callout: none !important;
  }
`;
export const overrideStyle = createGlobalStyle(overrideCSS);

const effectCSS = css`
  .oe-lock-screen {
    overflow: hidden !important;
  }
  .oe-loading * {
    cursor: wait !important;
  }
  .oe-prevent-event-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    z-index: 2147483647;
  }
`;
export const effectStyle = createGlobalStyle(effectCSS);
