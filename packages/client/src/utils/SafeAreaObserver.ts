import { CLIENT } from '../constants';
import { on, off } from './event';
import { computedStyle, globalStyle } from './html';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

export class SafeAreaObserver {
  static get value() {
    return value;
  }
  static observe = observe;
  static unobserve = unobserve;
}

const listeners: SafeAreaListener[] = [];
const isEmptyListeners = () => listeners.length === 0;
const notify = () => listeners.forEach((listener) => listener(value));

function observe(listener: SafeAreaListener) {
  if (isEmptyListeners()) {
    on('resize', handleScreenChange);
  }
  listeners.push(listener);
  // Execute immediately to ensure the initial value
  listener(value);
}

function unobserve(listener: SafeAreaListener) {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
  if (isEmptyListeners()) {
    off('resize', handleScreenChange);
  }
}

let portrait: boolean;
function handleScreenChange() {
  if (portrait !== (portrait = window.outerWidth < window.outerHeight)) {
    setValue();
    notify();
  }
}

let value: SafeAreaValue;
// init
if (CLIENT) setValue();

export function setValue() {
  defineCSSVariables(() => {
    const get = computedStyle(document.body);
    value = {
      top: get('--sait'),
      right: get('--sair'),
      bottom: get('--saib'),
      left: get('--sail'),
    };
  });
}

function defineCSSVariables(cb: () => void) {
  const style = globalStyle(postcss`
  :root {
    --sait: env(safe-area-inset-top);
    --sair: env(safe-area-inset-right);
    --saib: env(safe-area-inset-bottom);
    --sail: env(safe-area-inset-left);
  }
  `);
  try {
    style.mount();
    cb();
  } finally {
    style.unmount();
  }
}
