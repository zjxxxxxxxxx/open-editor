import { getOptions } from '../../options';
import { off, on } from '../../utils/event';
import { checkValidElement } from '../../utils/ui';
import {
  checkClickedElement,
  setupClickedElementAttrs,
  cleanClickedElementAttrs,
} from './clickedElement';

export interface SetupListenersOptions {
  onChangeElement(el: HTMLElement | null): void;
  onOpenEditor(el: HTMLElement): void;
  onOpenTree(el: HTMLElement): void;
  onExitInspect(): void;
}

const events = [
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
  // reset
  'dbclick',
  'submit',
  'reset',
  'blur',
];

export function setupListeners(opts: SetupListenersOptions) {
  const onChangeElement = withEventFn(opts.onChangeElement);
  const onOpenEditor = withEventFn(opts.onOpenEditor);
  const onOpenTree = withEventFn(opts.onOpenTree);
  const onExitInspect = withEventFn(opts.onExitInspect);

  const { once } = getOptions();

  let activeEl: HTMLElement | null;

  function setupEventListeners() {
    events.forEach((event) => {
      on(event, onSilent, {
        capture: true,
      });
    });

    // The click event on the window does not run, but the click event on the document does.
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

    return cleanEventListeners;
  }

  function cleanEventListeners() {
    events.forEach((event) => {
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
  }

  function onActiveElement(e: PointerEvent) {
    const el = <HTMLElement>(
      (e.pointerType === 'touch'
        ? document.elementFromPoint(e.clientX, e.clientY)
        : e.target)
    );
    if (el !== activeEl) {
      activeEl = checkValidElement(el) ? el : null;
      onChangeElement(activeEl);
    }
  }

  function onEnterScreen(e: PointerEvent) {
    // On mobile devices, getting focus when the screen is first touched
    if (e.pointerType === 'touch') {
      onActiveElement(e);
    }
  }

  function onLeaveScreen(e: PointerEvent) {
    // On PC devices, focus is lost when the mouse leaves the browser window
    if (
      e.pointerType === 'mouse' &&
      !checkValidElement(<HTMLElement>e.relatedTarget)
    ) {
      onChangeElement((activeEl = null));
    }
  }

  function onInspect(e: PointerEvent) {
    onSilent(e);

    const el = <HTMLElement>e.target;
    if (checkClickedElement(el)) {
      const targetEl = activeEl?.isConnected ? activeEl : el;
      if (once) onExitInspect();
      onChangeElement(null);
      if (e.metaKey || e.type === 'longpress') {
        onOpenTree(targetEl);
      } else {
        onOpenEditor(targetEl);
      }
      activeEl = null;
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
  // No action is expected on the event when target or relatedTarget is an invalid element.
  if (
    checkValidElement((<any>e).target) ||
    checkValidElement((<any>e).relatedTarget)
  ) {
    // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
    // Only need to handle touch events, excluding other events such as pointer
    // See https://www.chromestatus.com/feature/5093566007214080.
    if (!e.type.startsWith('touch')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }
}
