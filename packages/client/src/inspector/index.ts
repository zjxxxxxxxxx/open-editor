import { addClass, getHtml, removeClass } from '../utils/dom';
import { logError } from '../utils/logError';
import { on } from '../event';
import {
  CURRENT_INSPECT_ID,
  IS_SAME_ORIGIN,
  IS_TOP_WINDOW,
} from '../constants';
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

export let isEnable = false;
export let isRending = false;
export let isTreeOpen = false;
export let activeEl: HTMLElement | null = null;
export let activeRect: DOMRect | null = null;

export function setupInspector() {
  const opts = getOptions();

  let cleanListeners: () => void;

  effectStyle.mount();

  on('keydown', (e) => {
    if (!isTreeOpen && e.altKey && e.metaKey && e.code === 'KeyO') {
      if (!isEnable) {
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
        isEnable = true;

        cleanListeners = setupListeners({
          onActive(el) {
            activeEl = el;
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
        isEnable = false;
        isRending = false;

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
      sourceBridge.emit(activeEl ? [resolveSource(activeEl)] : undefined);
      boxModelBridge.emit(getBoxModel(activeEl));

      if (!isRending) {
        isRending = true;
        renderUI();
      }
    } else {
      isRending = false;
      activeEl = null;
      activeRect = null;
    }
  });

  openTreeBridge.on(() => {
    isTreeOpen = true;
  });

  closeTreeBridge.on(() => {
    isTreeOpen = false;
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
    if (isRending) {
      if (
        isActiveRectChanged() ||
        (opts.crossIframe && IS_SAME_ORIGIN && !IS_TOP_WINDOW && activeEl)
      ) {
        if (activeEl?.isConnected === false) {
          activeEl = null;
          activeRect = null;
        }

        boxModelBridge.emit(getBoxModel(activeEl));
      }

      requestAnimationFrame(renderUI);
    }
  }

  function isActiveRectChanged() {
    const prevAxis = activeRect;
    const nextAxis = (activeRect = activeEl?.getBoundingClientRect() ?? null);

    if (prevAxis == null && nextAxis == null) {
      return false;
    }
    if (prevAxis == null || nextAxis == null) {
      return true;
    }

    const diff = (key: keyof DOMRect) => prevAxis[key] !== nextAxis[key];
    return diff('x') || diff('y') || diff('width') || diff('height');
  }
}
