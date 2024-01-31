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
.o-e-lock-screen {
  overflow: hidden !important;
}
.o-e-loading * {
  cursor: wait !important;
}
`);
