import { CLIENT } from '../constants';
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
    --oe-sait: env(safe-area-inset-top);
    --oe-sair: env(safe-area-inset-right);
    --oe-saib: env(safe-area-inset-bottom);
    --oe-sail: env(safe-area-inset-left);
  }
`;
const variablesStyle = createGlobalStyle(variablesCSS);

let value: SafeAreaValue;
// init
if (CLIENT) {
  updateValue();
}

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
    top: get('--oe-sait'),
    right: get('--oe-sair'),
    bottom: get('--oe-saib'),
    left: get('--oe-sail'),
  };
  variablesStyle.unmount();
}
