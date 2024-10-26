import { createGlobalStyle } from '../utils/createGlobalStyle';

const safeAreaCSS = css`
  :root {
    --oe-sait: env(safe-area-inset-top);
    --oe-sair: env(safe-area-inset-right);
    --oe-saib: env(safe-area-inset-bottom);
    --oe-sail: env(safe-area-inset-left);
  }
`;
export const safeAreaStyle = createGlobalStyle(safeAreaCSS);
