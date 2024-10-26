import { computedStyle } from '../utils/dom';
import { safeAreaStyle } from '../styles/safeAreaStyle';
import { IS_CLIENT } from '../constants';
import { on, off } from '../event';
import { mitt } from './mitt';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

export type SafeAreaObserver = ReturnType<typeof createSafeAreaObserver>;

export function createSafeAreaObserver() {
  const emitter = mitt<SafeAreaListener>();

  let value: SafeAreaValue;
  // init
  if (IS_CLIENT) {
    updateValue();
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
    safeAreaStyle.mount();
    const get = computedStyle(document.body);
    value = {
      top: get('--oe-sait'),
      right: get('--oe-sair'),
      bottom: get('--oe-saib'),
      left: get('--oe-sail'),
    };
    safeAreaStyle.unmount();
  }

  return {
    get value() {
      return value;
    },
    observe(listener: SafeAreaListener) {
      if (emitter.isEmpty) {
        on('resize', detectionScreen);
      }
      emitter.on(listener);
      // Execute immediately to ensure the initial value
      listener(value);
    },
    unobserve(listener: SafeAreaListener) {
      emitter.off(listener);
      if (emitter.isEmpty) {
        off('resize', detectionScreen);
      }
    },
  };
}
