import { capOpts } from '../constants';
import { getOptions } from '../options';
import { off, on } from './event';
import { isValidElement } from './isValidElement';
import {
  checkHoldElement,
  setupHoldElement,
  cleanHoldElementHOC,
} from './holdElement';

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
];

export function setupListeners(opts: SetupListenersOptions) {
  const onChangeElement = cleanHoldElementHOC(opts.onChangeElement);
  const onOpenEditor = cleanHoldElementHOC(opts.onOpenEditor);
  const onOpenTree = cleanHoldElementHOC(opts.onOpenTree);
  const onExitInspect = cleanHoldElementHOC(opts.onExitInspect);

  const { once } = getOptions();

  function setupEventListeners() {
    events.forEach((event) => on(event, onSilent, capOpts));

    // The click event on the window does not run, but the click event on the document does.
    on('click', onInspect, { ...capOpts, target: document });
    on('pointerdown', setupHoldElement, capOpts);
    on('pointermove', onActiveElement, capOpts);
    on('pointerover', onEnterScreen, capOpts);
    on('pointerout', onLeaveScreen, capOpts);
    on('longpress', onInspect, capOpts);
    on('quickexit', onExitInspect, capOpts);

    return () => {
      events.forEach((event) => off(event, onSilent, capOpts));

      off('click', onInspect, { ...capOpts, target: document });
      off('pointerdown', setupHoldElement, capOpts);
      off('pointermove', onActiveElement, capOpts);
      off('pointerover', onEnterScreen, capOpts);
      off('pointerout', onLeaveScreen, capOpts);
      off('longpress', onInspect, capOpts);
      off('quickexit', onExitInspect, capOpts);
    };
  }

  let activeEl: HTMLElement | null;
  function onActiveElement(e: PointerEvent) {
    const el = <HTMLElement>(
      (e.pointerType === 'touch'
        ? document.elementFromPoint(e.clientX, e.clientY)
        : e.target)
    );
    if (el !== activeEl) {
      activeEl = isValidElement(el) ? el : null;
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
    if (e.pointerType === 'mouse' && e.relatedTarget == null) {
      onChangeElement((activeEl = null));
    }
  }

  function onInspect(e: PointerEvent) {
    const el = <HTMLElement>e.target;
    if (checkHoldElement(el)) {
      if (once) onExitInspect();
      if (e.metaKey || e.type === 'longpress') {
        onChangeElement((activeEl = null));
        onOpenTree(el);
      } else {
        onOpenEditor(el);
      }
    }
  }

  function onSilent(e: Event) {
    const el = <HTMLElement>e.target;
    if (isValidElement(el)) {
      // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
      // Only need to handle touch events, excluding other events such as pointer
      // See https://www.chromestatus.com/feature/5093566007214080.
      if (!e.type.startsWith('touch')) {
        e.preventDefault();
      }
      e.stopPropagation();
    }
  }

  return setupEventListeners();
}
