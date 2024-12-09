import { createGlobalStyle } from '../utils/createGlobalStyle';
import { on } from '../event';
import { IS_CLIENT } from '../constants';
import { createStyleGetter } from './dom';
import { mitt } from './mitt';

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const safeAreaObserver = mitt<[SafeArea]>();

const safeAreaCSS = css`
  :root {
    --oe-sait: env(safe-area-inset-top);
    --oe-sair: env(safe-area-inset-right);
    --oe-saib: env(safe-area-inset-bottom);
    --oe-sail: env(safe-area-inset-left);
  }
`;

export let safeArea: SafeArea;

if (IS_CLIENT) {
  initValue();
}

function initValue() {
  on('DOMContentLoaded', () => {
    createGlobalStyle(safeAreaCSS).mount();
    updateValue();
    on('change', updateValue, {
      target: matchMedia('(orientation: portrait)'),
    });
  });
}

function updateValue() {
  const getStyle = createStyleGetter(document.body);
  safeArea = {
    top: getStyle('--oe-sait'),
    right: getStyle('--oe-sair'),
    bottom: getStyle('--oe-saib'),
    left: getStyle('--oe-sail'),
  };
  safeAreaObserver.emit(safeArea);
}
