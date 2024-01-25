import { on, off } from './event';
import { computedStyle, globalStyle } from './ui';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

const variableStyle = globalStyle(postcss`
:root {
  --oe-sait: env(safe-area-inset-top);
  --oe-sair: env(safe-area-inset-right);
  --oe-saib: env(safe-area-inset-bottom);
  --oe-sail: env(safe-area-inset-left);
}
`);

const listeners: SafeAreaListener[] = [];
const isEmptyListeners = () => listeners.length === 0;

let value: SafeAreaValue;
// init
updateValue();

export class SafeAreaObserver {
  static get value() {
    return value;
  }
  static observe(listener: SafeAreaListener) {
    if (isEmptyListeners()) {
      on('resize', detectionScreen);
    }
    listeners.push(listener);
    // Execute immediately to ensure the initial value
    listener(value);
  }
  static unobserve(listener: SafeAreaListener) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    if (isEmptyListeners()) {
      off('resize', detectionScreen);
    }
  }
}

let portrait: boolean;
function detectionScreen() {
  const { outerWidth: w, outerHeight: h } = window;
  if (portrait !== (portrait = w < h)) {
    updateValue();
    listeners.forEach((listener) => listener(value));
  }
}

function updateValue() {
  variableStyle.mount();
  const get = computedStyle(document.body);
  value = {
    top: get('--oe-sait'),
    right: get('--oe-sair'),
    bottom: get('--oe-saib'),
    left: get('--oe-sail'),
  };
  variableStyle.unmount();
}
