import { mitt } from './mitt';
import { on, off } from './event';
import { computedStyle, createGlobalStyle } from './ui';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

export const emitter = mitt<SafeAreaListener>();

const variablesCSS = css`
  :root {
    --o-e-sait: env(safe-area-inset-top);
    --o-e-sair: env(safe-area-inset-right);
    --o-e-saib: env(safe-area-inset-bottom);
    --o-e-sail: env(safe-area-inset-left);
  }
`;
const variablesStyle = createGlobalStyle(variablesCSS);

let value: SafeAreaValue;
// init
updateValue();

export class SafeAreaObserver {
  static get value() {
    return value;
  }
  static observe(listener: SafeAreaListener) {
    if (emitter.isEmpty) {
      on('resize', detectionScreen);
    }
    emitter.on(listener);
    // Execute immediately to ensure the initial value
    listener(value);
  }
  static unobserve(listener: SafeAreaListener) {
    emitter.off(listener);
    if (emitter.isEmpty) {
      off('resize', detectionScreen);
    }
  }
}

let portrait: boolean;
function detectionScreen() {
  const { outerWidth: w, outerHeight: h } = window;
  if (portrait !== (portrait = w < h)) {
    updateValue();
    emitter.emit(value);
  }
}

function updateValue() {
  variablesStyle.mount();
  const get = computedStyle(document.body);
  value = {
    top: get('--o-e-sait'),
    right: get('--o-e-sair'),
    bottom: get('--o-e-saib'),
    left: get('--o-e-sail'),
  };
  variablesStyle.unmount();
}
