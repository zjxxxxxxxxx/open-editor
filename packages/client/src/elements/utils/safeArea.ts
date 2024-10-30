import { computedStyle } from '../../utils/dom';
import { safeAreaStyle } from '../../styles/safeAreaStyle';
import { on, off } from '../../event';
import { mitt } from '../../utils/mitt';
import { IS_CLIENT } from '../../constants';

export interface SafeAreaValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaListener = (value: SafeAreaValue) => void;

const emitter = mitt<SafeAreaListener>();

export let safeArea: SafeAreaValue;

initSafeArea();

function initSafeArea() {
  if (IS_CLIENT) {
    safeAreaStyle.mount();
    updateValue();
  }
}

export function onSafeAreaChange(listener: SafeAreaListener) {
  if (emitter.isEmpty) {
    on('resize', detectionScreen);
  }
  emitter.on(listener);
  // Execute immediately to ensure the initial value
  listener(safeArea);
}

export function offSafeAreaChange(listener: SafeAreaListener) {
  emitter.off(listener);
  if (emitter.isEmpty) {
    off('resize', detectionScreen);
  }
}

let portrait: boolean;
function detectionScreen() {
  const { outerWidth: w, outerHeight: h } = window;
  if (portrait !== (portrait = w < h)) {
    updateValue();
    emitter.emit(safeArea);
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
