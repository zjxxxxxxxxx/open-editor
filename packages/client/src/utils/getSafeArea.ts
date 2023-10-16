import { createStyleGetter, createGlobalStyle } from './style';

const CSS = postcss`
:root {
  --sait: env(safe-area-inset-top);
  --sair: env(safe-area-inset-right);
  --saib: env(safe-area-inset-bottom);
  --sail: env(safe-area-inset-left);
}
`;

let get: ReturnType<typeof createStyleGetter>;
function cresteGetter() {
  createGlobalStyle(CSS).insert();
  return createStyleGetter(document.body);
}

export function getSafeArea() {
  get ||= cresteGetter();

  return {
    top: get('--sait'),
    right: get('--sair'),
    bottom: get('--saib'),
    left: get('--sail'),
  };
}
