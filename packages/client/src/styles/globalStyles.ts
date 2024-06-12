import { createGlobalStyle } from '../utils/dom';

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
`;
export const effectStyle = createGlobalStyle(effectCSS);
