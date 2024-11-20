import { addClass, getHtml, removeClass } from '../utils/dom';
import { logError } from '../utils/logError';
import { on } from '../event';
import { CURRENT_INSPECT_ID } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import {
  inspectorActiveBridge,
  inspectorEnableBridge,
  inspectorExitBridge,
  inspectorRenderBridge,
  codeSourceBridge,
  boxModelBridge,
  treeOpenBridge,
  treeCloseBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
  openEditorErrorBridge,
} from '../bridge';
import { effectStyle, overrideStyle } from './globalStyles';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { getBoxModel } from './getBoxModel';
import { openEditor } from './openEditor';
import { setupListeners } from './setupListeners';
import { inspectorState } from './inspectorState';

export function setupInspector() {
  const opts = getOptions();

  let cleanListeners: () => void;

  effectStyle.mount();

  on('mousemove', () => inspectorActiveBridge.emit([CURRENT_INSPECT_ID]), {
    capture: true,
  });

  on(
    'keydown',
    (e) => {
      if (
        !inspectorState.isTreeOpen &&
        e.altKey &&
        e.metaKey &&
        e.code === 'KeyO'
      ) {
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
    const prevIsActive = inspectorState.isActive;
    const nextIsActive = (inspectorState.isActive =
      activeId === CURRENT_INSPECT_ID);
    if (prevIsActive !== nextIsActive) {
      if (nextIsActive) {
        renderUI();
      } else {
        inspectorState.activeEl = null;
      }
    }
  });

  inspectorEnableBridge.on(async () => {
    try {
      const e = new CustomEvent('enableinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (dispatchEvent(e)) {
        inspectorState.isEnable = true;
        cleanListeners = setupListeners({
          onActive: () => inspectorRenderBridge.emit(),
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
      }
    } catch {
      //
    }
  });

  inspectorExitBridge.on(async () => {
    try {
      const e = new CustomEvent('exitinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (dispatchEvent(e)) {
        inspectorState.isEnable = false;
        inspectorState.isActive = false;
        inspectorState.activeEl = null;

        cleanListeners();

        overrideStyle.unmount();
        if (opts.disableHoverCSS) {
          await enableHoverCSS();
        }
      }
    } catch {
      //
    }
  });

  inspectorRenderBridge.on(() => {
    if (inspectorState.activeEl) {
      codeSourceBridge.emit([resolveSource(inspectorState.activeEl)]);
    }
  });

  treeOpenBridge.on(() => (inspectorState.isTreeOpen = true));

  treeCloseBridge.on(() => (inspectorState.isTreeOpen = false));

  openEditorBridge.on(async (meta) => {
    try {
      openEditorStartBridge.emit();

      if (!meta) {
        logError('file not found.');
        openEditorErrorBridge.emit();
        return;
      }

      await openEditor(meta, (e) => dispatchEvent(e));
    } catch {
      openEditorErrorBridge.emit();
    } finally {
      openEditorEndBridge.emit();
    }
  });

  openEditorStartBridge.on(() => addClass(getHtml(), 'oe-loading'));

  openEditorEndBridge.on(() => removeClass(getHtml(), 'oe-loading'));

  function renderUI() {
    if (inspectorState.isActive) {
      const prevActiveEl = inspectorState.prevActiveEl;
      const nextActiveEl = (inspectorState.prevActiveEl =
        inspectorState.activeEl);
      if (prevActiveEl != null || nextActiveEl != null) {
        if (nextActiveEl?.isConnected === false) {
          inspectorState.activeEl = null;
        }
        if (inspectorState.activeEl == null) {
          codeSourceBridge.emit();
        }
        boxModelBridge.emit(getBoxModel(inspectorState.activeEl));
      }

      requestAnimationFrame(renderUI);
    }
  }
}
