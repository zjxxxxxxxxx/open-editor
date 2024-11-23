import { boxModelBridge, codeSourceBridge } from '../bridge';
import { resolveSource } from '../resolve';
import { getBoxModel } from './getBoxModel';
import { inspectorState } from './inspectorState';

export function renderUI() {
  if (inspectorState.activeEl) {
    codeSourceBridge.emit([resolveSource(inspectorState.activeEl)]);
    boxModelBridge.emit(getBoxModel(inspectorState.activeEl));

    if (!inspectorState.isRendering) {
      inspectorState.isRendering = true;
      requestAnimationFrame(rerenderUI);
    }
  }
}

function rerenderUI() {
  if (inspectorState.isRendering) {
    const prevActiveEl = inspectorState.prevActiveEl;
    const nextActiveEl = (inspectorState.prevActiveEl = inspectorState.activeEl);
    if (prevActiveEl != null || nextActiveEl != null) {
      if (nextActiveEl?.isConnected === false) {
        inspectorState.activeEl = null;
      }

      if (inspectorState.activeEl == null) {
        codeSourceBridge.emit();
      }

      boxModelBridge.emit(getBoxModel(inspectorState.activeEl));
    }

    requestAnimationFrame(rerenderUI);
  }
}
