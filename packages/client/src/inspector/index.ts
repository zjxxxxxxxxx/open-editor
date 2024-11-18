import { addClass, getHtml, removeClass } from '../utils/dom';
import { logError } from '../utils/logError';
import { on } from '../event';
import { CURRENT_INSPECT_ID } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import {
  closeTreeBridge,
  enableBridge,
  exitBridge,
  openEditorBridge,
  openTreeBridge,
  boxModelBridge,
  sourceBridge,
  openEditorErrorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
  activeBridge,
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

  on('keydown', (e) => {
    if (
      !inspectorState.isTreeOpen &&
      e.altKey &&
      e.metaKey &&
      e.code === 'KeyO'
    ) {
      if (!inspectorState.isEnable) {
        enableBridge.emit();
      } else {
        exitBridge.emit();
      }
    }
  });

  enableBridge.on(async () => {
    try {
      const e = new CustomEvent('enableinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (dispatchEvent(e)) {
        inspectorState.isEnable = true;

        cleanListeners = setupListeners({
          onActive() {
            activeBridge.emit([CURRENT_INSPECT_ID]);
          },
          onOpenTree(el) {
            openTreeBridge.emit([resolveSource(el, true)]);
          },
          onOpenEditor(el) {
            const { meta } = resolveSource(el);
            openEditorBridge.emit([meta]);
          },
          onExitInspect: exitBridge.emit,
        });

        // Override the default mouse style and touch feedback
        overrideStyle.mount();

        if (opts.disableHoverCSS) await disableHoverCSS();

        // @ts-ignore
        document.activeElement?.blur();
      }
    } catch {
      //
    }
  });

  exitBridge.on(async () => {
    try {
      const e = new CustomEvent('exitinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (dispatchEvent(e)) {
        inspectorState.isEnable = false;
        inspectorState.isRending = false;
        inspectorState.activeEl = null;

        cleanListeners();

        overrideStyle.unmount();

        if (opts.disableHoverCSS) await enableHoverCSS();
      }
    } catch {
      //
    }
  });

  activeBridge.on((activeId) => {
    if (activeId === CURRENT_INSPECT_ID) {
      sourceBridge.emit(
        inspectorState.activeEl
          ? [resolveSource(inspectorState.activeEl)]
          : undefined,
      );
      boxModelBridge.emit(getBoxModel(inspectorState.activeEl));

      if (!inspectorState.isRending) {
        inspectorState.isRending = true;
        renderUI();
      }
    } else {
      inspectorState.isRending = false;
      inspectorState.activeEl = null;
    }
  });

  openTreeBridge.on(() => {
    inspectorState.isTreeOpen = true;
  });

  closeTreeBridge.on(() => {
    inspectorState.isTreeOpen = false;
  });

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

  openEditorStartBridge.on(() => {
    addClass(getHtml(), 'oe-loading');
  });

  openEditorEndBridge.on(() => {
    removeClass(getHtml(), 'oe-loading');
  });

  function renderUI() {
    if (inspectorState.isRending) {
      const prevActiveEl = inspectorState.prevActiveEl;
      const activeEl = (inspectorState.prevActiveEl = inspectorState.activeEl);
      if (prevActiveEl != null || activeEl != null) {
        if (inspectorState.activeEl?.isConnected === false) {
          inspectorState.activeEl = null;
        }

        boxModelBridge.emit(getBoxModel(inspectorState.activeEl));
      }

      requestAnimationFrame(renderUI);
    }
  }
}
