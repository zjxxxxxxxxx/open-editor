import { globalStyle } from '../../utils/ui';

export const overrideStyle = globalStyle(postcss`
* {
  cursor: default !important;
  user-select: none !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
}
`);

export const effectStyle = globalStyle(postcss`
.oe-lock-screen {
  overflow: hidden !important;
}
.oe-loading * {
  cursor: wait !important;
}
`);
