import { safeAreaStyle } from '../styles/safeAreaStyle';
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
