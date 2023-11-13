import { computedStyle, globalStyle } from './html';

const CSS = postcss`
:root {
  --sait: env(safe-area-inset-top);
  --sair: env(safe-area-inset-right);
  --saib: env(safe-area-inset-bottom);
  --sail: env(safe-area-inset-left);
}
`;

let get: ReturnType<typeof computedStyle>;
function createGetter() {
  globalStyle(CSS, true);
  return computedStyle(document.body);
}

export function getSafeArea() {
  get ||= createGetter();

  return {
    top: get('--sait'),
    right: get('--sair'),
    bottom: get('--saib'),
    left: get('--sail'),
  };
}
