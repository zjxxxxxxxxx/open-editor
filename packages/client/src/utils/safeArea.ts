import { createStyleGetter } from './createStyleGetter';
import { createStyleInject } from './createStyleInject';

const CSS = `
:root {
  --sait: env(safe-area-inset-top);
  --sair: env(safe-area-inset-right);
  --saib: env(safe-area-inset-bottom);
  --sail: env(safe-area-inset-left);
}
`;

let getValue: ReturnType<typeof createStyleGetter>;
export function getSafeArea() {
  if (!getValue) {
    createStyleInject(CSS).insert();
    getValue = createStyleGetter(document.body);
  }

  return {
    top: getValue('--sait'),
    right: getValue('--sair'),
    bottom: getValue('--saib'),
    left: getValue('--sail'),
  };
}
