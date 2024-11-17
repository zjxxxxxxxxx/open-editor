import { createGlobalStyle } from '../utils/createGlobalStyle';
import { on } from '../event';
import { IS_CLIENT } from '../constants';
import { computedStyle } from './dom';
import { mitt } from './mitt';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const safeAreaCSS = css`
  :root {
    --oe-sait: env(safe-area-inset-top);
    --oe-sair: env(safe-area-inset-right);
    --oe-saib: env(safe-area-inset-bottom);
    --oe-sail: env(safe-area-inset-left);
  }
`;
const safeAreaStyle = createGlobalStyle(safeAreaCSS);

export let safeArea: SafeAreaValue;

export const safeAreaObserver = mitt<[SafeAreaValue]>();

initSafeArea();

function initSafeArea() {
  if (IS_CLIENT) {
    on('DOMContentLoaded', () => {
      safeAreaStyle.mount();
      on('resize', detectionScreen);
      updateValue();
    });
  }
}

let portrait: boolean;
function detectionScreen() {
  const { outerWidth: w, outerHeight: h } = window;
  if (portrait !== (portrait = w < h)) {
    updateValue();
    safeAreaObserver.emit([safeArea]);
  }
}

function updateValue() {
  const get = computedStyle(document.body);
  safeArea = {
    top: get('--oe-sait'),
    right: get('--oe-sair'),
    bottom: get('--oe-saib'),
    left: get('--oe-sail'),
  };
}
