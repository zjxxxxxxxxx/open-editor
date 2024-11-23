import { addClass, getHtml, removeClass } from '../utils/dom';
import { on } from '../event';
import { CURRENT_INSPECT_ID } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import {
  inspectorActiveBridge,
  inspectorEnableBridge,
  inspectorExitBridge,
  codeSourceBridge,
  boxModelBridge,
  treeOpenBridge,
  treeCloseBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
} from '../bridge';
import { effectStyle, overrideStyle } from './globalStyles';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { getBoxModel } from './getBoxModel';
import { openEditor } from './openEditor';
import { setupListeners } from './setupListeners';
import { inspectorState } from './inspectorState';
import { getActiveElement } from './getActiveElement';

export function setupInspector() {
  const opts = getOptions();

  let cleanListeners: () => void;

  effectStyle.mount();

  on(
    'mousemove',
    () => {
      inspectorActiveBridge.emit([CURRENT_INSPECT_ID]);
    },
    {
      capture: true,
    },
  );

  on(
    'keydown',
    (e) => {
      if (!inspectorState.isTreeOpen && e.altKey && e.metaKey && e.code === 'KeyO') {
        if (!inspectorState.isEnable) {
          inspectorEnableBridge.emit();
        } else {
          inspectorExitBridge.emit();
        }
      }
    },
    {
      capture: true,
    },
  );

  inspectorActiveBridge.on((activeId) => {
    inspectorState.isActive = activeId === CURRENT_INSPECT_ID;

    if (!inspectorState.isActive && inspectorState.isRendering) {
      inspectorState.isRendering = false;
      inspectorState.activeEl = null;
    }
  });

  inspectorEnableBridge.on(async () => {
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
  });

  inspectorExitBridge.on(async () => {
    try {
      inspectorState.isEnable = false;
      inspectorState.isRendering = false;
      inspectorState.activeEl = null;

      cleanListeners();

      overrideStyle.unmount();
      if (opts.disableHoverCSS) {
        await enableHoverCSS();
      }
    } catch {
      //
    }
  });

  treeOpenBridge.on(() => (inspectorState.isTreeOpen = true));
  treeCloseBridge.on(() => (inspectorState.isTreeOpen = false));
  openEditorBridge.on((meta) => openEditor(meta));
  openEditorStartBridge.on(() => addClass(getHtml(), 'oe-loading'));
  openEditorEndBridge.on(() => removeClass(getHtml(), 'oe-loading'));

  function renderUI() {
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
}
