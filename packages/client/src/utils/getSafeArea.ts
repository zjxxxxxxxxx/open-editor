import { createStyleGetter, createGlobalStyle } from './html';

const CSS = postcss`
:root {
  --sait: env(safe-area-inset-top);
  --sair: env(safe-area-inset-right);
  --saib: env(safe-area-inset-bottom);
  --sail: env(safe-area-inset-left);
}
`;

let get: ReturnType<typeof createStyleGetter>;
export function getSafeArea() {
  if (!get) {
    createGlobalStyle(CSS).insert();
    get = createStyleGetter(document.body);
  }

  return {
    top: get('--sait'),
    right: get('--sair'),
    bottom: get('--saib'),
    left: get('--sail'),
  };
}
