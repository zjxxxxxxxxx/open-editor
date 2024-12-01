import { inspectorExitBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { CURRENT_INSPECT_ID } from '../constants';
import { setupListeners } from './setupListeners';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { getActiveElement } from './getActiveElement';
import { overrideStyle } from './globalStyles';
import { inspectorState } from './inspectorState';
import { renderUI } from './renderUI';

let cleanListeners: (() => void) | null = null;

export async function inspectorEnable() {
  try {
    const { disableHoverCSS: isDisableHoverCSS } = getOptions();

    inspectorState.isEnable = true;
    inspectorState.activeEl = getActiveElement();

    renderUI();

    cleanListeners = setupListeners({
      onActive: () => renderUI(),
      onOpenTree: (el) => treeOpenBridge.emit([resolveSource(el, true), CURRENT_INSPECT_ID]),
      onOpenEditor: (el) => openEditorBridge.emit([resolveSource(el).meta]),
      onExitInspect: () => inspectorExitBridge.emit(),
    });

    if (isDisableHoverCSS) {
      await disableHoverCSS();
    }

    // Override the default mouse style and touch feedback
    overrideStyle.mount();

    // @ts-ignore
    document.activeElement?.blur();
  } catch {
    //
  }
}

export async function inspectorExit() {
  try {
    const { disableHoverCSS: isDisableHoverCSS } = getOptions();

    inspectorState.isEnable = false;
    inspectorState.isRendering = false;
    inspectorState.activeEl = null;

    if (cleanListeners != null) {
      cleanListeners();
      cleanListeners = null;
    }

    if (isDisableHoverCSS) {
      await enableHoverCSS();
    }

    overrideStyle.unmount();

    // @ts-ignore
    document.activeElement?.blur();
  } catch {
    //
  }
}
