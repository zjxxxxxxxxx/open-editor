import { on, off } from './event';
import { computedStyle, globalStyle } from './ui';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

const listeners: SafeAreaListener[] = [];
const isEmptyListeners = () => listeners.length === 0;

let value: SafeAreaValue;

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

const style = globalStyle(postcss`
:root {
  --sait: env(safe-area-inset-top);
  --sair: env(safe-area-inset-right);
  --saib: env(safe-area-inset-bottom);
  --sail: env(safe-area-inset-left);
}
`);
export function updateValue() {
  style.mount();
  const get = computedStyle(document.body);
  value = {
    top: get('--sait'),
    right: get('--sair'),
    bottom: get('--saib'),
    left: get('--sail'),
  };
  style.unmount();
}

// init
updateValue();
