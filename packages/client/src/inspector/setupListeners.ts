import { checkValidElement } from '../utils/checkElement';
import { isTopWindow } from '../utils/topWindow';
import { getOptions } from '../options';
import { off, on } from '../event';
import {
  checkClickedElement,
  setupClickedElementAttrs,
  cleanClickedElementAttrs,
} from './clickedElement';
import { inspectorState } from './inspectorState';

export interface SetupListenersOptions {
  onActive(): void;
  onOpenEditor(el: HTMLElement): void;
  onOpenTree(el: HTMLElement): void;
  onExitInspect(): void;
}

/**
 * Events that need to be blocked
 */
const SILENT_EVENTS = [
  // mouse
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  // touch
  'touchstart',
  'touchend',
  'touchcancel',
  'touchmove',
  // pointer
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  // drag
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  // form
  'focus',
  'focusin',
  'focusout',
  'blur',
  'reset',
  'submit',
  'input',
  'change',
  'select',
  // others
  'dbclick',
];

/**
 * Blocking the default behavior of touchstart and touchend in
 * Safari will result in the inability to trigger click events
 */
const CLICK_ATTACHMENT_EVENTS = ['touchstart', 'touchend'];

/**
 * Keys for quick interaction
 */
const SHORTCUT_KEYS = ['Enter', 'Space'];

export function setupListeners(opts: SetupListenersOptions) {
  const { once, crossIframe } = getOptions();
  const onActive = withEventFn(opts.onActive);
  const onOpenEditor = withEventFn(opts.onOpenEditor);
  const onOpenTree = withEventFn(opts.onOpenTree);
  const onExitInspect = withEventFn(opts.onExitInspect);

  function setupEventListeners() {
    SILENT_EVENTS.forEach((event) => {
      on(event, onSilent, {
        capture: true,
        passive: false,
      });
    });

    // The click event on the window does not run, but the click
    // event on the document does.
    on('click', onInspect, {
      capture: true,
      target: document,
    });
    on('pointerdown', setupClickedElementAttrs, {
      capture: true,
    });
    on('pointermove', onActiveElement, {
      capture: true,
    });
    on('pointerover', onEnterScreen, {
      capture: true,
    });
    on('pointerout', onLeaveScreen, {
      capture: true,
    });
    on('longpress', onInspect, {
      capture: true,
    });
    on('quickexit', onExitInspect, {
      capture: true,
    });
    on('keydown', onKeydown, {
      capture: true,
    });
    on('keyup', onKeyup, {
      capture: true,
    });

    return cleanEventListeners;
  }

  function cleanEventListeners() {
    SILENT_EVENTS.forEach((event) => {
      off(event, onSilent, {
        capture: true,
      });
    });

    off('click', onInspect, {
      capture: true,
      target: document,
    });
    off('pointerdown', setupClickedElementAttrs, {
      capture: true,
    });
    off('pointermove', onActiveElement, {
      capture: true,
    });
    off('pointerover', onEnterScreen, {
      capture: true,
    });
    off('pointerout', onLeaveScreen, {
      capture: true,
    });
    off('longpress', onInspect, {
      capture: true,
    });
    off('quickexit', onExitInspect, {
      capture: true,
    });
    off('keydown', onKeydown, {
      capture: true,
    });
    off('keyup', onKeyup, {
      capture: true,
    });
  }

  function onActiveElement(e: PointerEvent) {
    const el = <HTMLElement>(
      (e.pointerType === 'touch' ? document.elementFromPoint(e.clientX, e.clientY) : e.target)
    );
    if (el !== inspectorState.activeEl) {
      inspectorState.activeEl = checkValidElement(el) ? el : null;
      onActive();
    }
  }

  function onEnterScreen(e: PointerEvent) {
    // On mobile devices, getting focus when the screen is first touched
    if (e.pointerType === 'touch') {
      onActiveElement(e);
    }
  }

  function onLeaveScreen(e: PointerEvent) {
    if (crossIframe && !isTopWindow) {
      return;
    }
    // On PC devices, focus is lost when the mouse leaves the browser window
    if (e.pointerType === 'mouse' && e.relatedTarget == null) {
      inspectorState.activeEl = null;
      onActive();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (inspectorState.activeEl && SHORTCUT_KEYS.includes(e.code)) {
      Object.defineProperty(e, 'type', {
        get() {
          return `key${e.code}`.toLowerCase();
        },
      });
      Object.defineProperty(e, 'target', {
        get() {
          return inspectorState.activeEl;
        },
      });
      setupClickedElementAttrs(e);
      onInspect(e as unknown as PointerEvent);
    }
  }

  function onKeyup(e: KeyboardEvent) {
    if (SHORTCUT_KEYS.includes(e.code)) {
      cleanClickedElementAttrs();
    }
  }

  function onInspect(e: PointerEvent) {
    onSilent(e);

    const el = <HTMLElement>e.target;
    if (checkClickedElement(el)) {
      const targetEl = inspectorState.activeEl?.isConnected ? inspectorState.activeEl : el;

      inspectorState.activeEl = null;

      if (once) onExitInspect();

      if (e.metaKey || e.type === 'longpress' || e.type === 'keyspace') {
        onOpenTree(targetEl);
      } else {
        onOpenEditor(targetEl);
      }
    }
  }

  return setupEventListeners();
}

function withEventFn<T extends (...args: any[]) => any>(fn: T) {
  function wrappedEventFn(...args: Parameters<T>): ReturnType<T> {
    cleanClickedElementAttrs();
    return fn(...args);
  }
  return wrappedEventFn;
}

function onSilent(e: Event) {
  // No action is expected on the event when target or relatedTarget
  // is an invalid element.
  if (checkValidElement((<any>e).target) || checkValidElement((<any>e).relatedTarget)) {
    if (!CLICK_ATTACHMENT_EVENTS.includes(e.type)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }
}
