import { createGlobalStyle } from './ui';

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
  .o-e-lock-screen {
    overflow: hidden !important;
  }
  .o-e-loading * {
    cursor: wait !important;
  }
`;
export const effectStyle = createGlobalStyle(effectCSS);
