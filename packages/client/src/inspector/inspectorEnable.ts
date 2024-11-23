import { inspectorExitBridge, openEditorBridge, treeOpenBridge } from '../bridge';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { setupListeners } from './setupListeners';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { getActiveElement } from './getActiveElement';
import { overrideStyle } from './globalStyles';
import { inspectorState } from './inspectorState';
import { renderUI } from './renderUI';

let cleanListeners: (() => void) | null = null;

export async function inspectorEnable() {
  const opts = getOptions();

  try {
    inspectorState.isEnable = true;
    inspectorState.activeEl = getActiveElement();

    renderUI();

    cleanListeners = setupListeners({
      onActive: () => renderUI(),
      onOpenTree: (el) => treeOpenBridge.emit([resolveSource(el, true)]),
      onOpenEditor: (el) => openEditorBridge.emit([resolveSource(el).meta]),
      onExitInspect: () => inspectorExitBridge.emit(),
    });

    // Override the default mouse style and touch feedback
    overrideStyle.mount();
    if (opts.disableHoverCSS) {
      await disableHoverCSS();
    }
    // @ts-ignore
    document.activeElement?.blur();
  } catch {
    //
  }
}

export async function inspectorExit() {
  const opts = getOptions();

  try {
    inspectorState.isEnable = false;
    inspectorState.isRendering = false;
    inspectorState.activeEl = null;

    if (cleanListeners != null) {
      cleanListeners();
      cleanListeners = null;
    }

    overrideStyle.unmount();
    if (opts.disableHoverCSS) {
      await enableHoverCSS();
    }
  } catch {
    //
  }
}
