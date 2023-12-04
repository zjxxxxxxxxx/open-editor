import { capOpts } from '../constants';
import { applyAttrs } from './html';
import { off, on } from './event';
import { isValidElement } from './validElement';
import { getOptions } from '../options';

export interface SetupHandlersOptions {
  onChangeElement(el?: HTMLElement): void;
  onOpenEditor(el: HTMLElement): void;
  onOpenTree(el: HTMLElement): void;
  onExitInspect(): void;
}

export function setupListenersOnWindow(opts: SetupHandlersOptions) {
  const onChangeElement = wrapCleanHoldElement(opts.onChangeElement);
  const onOpenEditor = wrapCleanHoldElement(opts.onOpenEditor);
  const onOpenTree = wrapCleanHoldElement(opts.onOpenTree);
  const onExitInspect = wrapCleanHoldElement(opts.onExitInspect);

  const { once } = getOptions();

  function registerEventListeners() {
    on('click', onClick, capOpts);

    on('mousedown', onSilence, capOpts);
    on('mouseenter', onSilence, capOpts);
    on('mouseleave', onSilence, capOpts);
    on('mousemove', onSilence, capOpts);
    on('mouseout', onSilence, capOpts);
    on('mouseover', onSilence, capOpts);
    on('mouseup', onSilence, capOpts);

    on('pointercancel', onPointerCancel, capOpts);
    on('pointerdown', onPointerDown, capOpts);
    on('pointerenter', onSilence, capOpts);
    on('pointerleave', onSilence, capOpts);
    on('pointermove', onSilence, capOpts);
    on('pointerout', onPointerCancel, capOpts);
    on('pointerover', onPointerOver, capOpts);
    on('pointerup', onSilence, capOpts);

    on('touchstart', onSilence, capOpts);
    on('touchend', onSilence, capOpts);
    on('touchcancel', onSilence, capOpts);
    on('touchmove', onTouchMove, capOpts);

    on('longpress', onLongPress, capOpts);

    on('keydown', onQuickExit, capOpts);
    on('contextmenu', onQuickExit, capOpts);
  }

  function removeEventListeners() {
    off('click', onClick, capOpts);

    off('mousedown', onSilence, capOpts);
    off('mouseenter', onSilence, capOpts);
    off('mouseleave', onSilence, capOpts);
    off('mousemove', onSilence, capOpts);
    off('mouseout', onSilence, capOpts);
    off('mouseover', onSilence, capOpts);
    off('mouseup', onSilence, capOpts);

    off('pointercancel', onPointerCancel, capOpts);
    off('pointerdown', onPointerDown, capOpts);
    off('pointerenter', onSilence, capOpts);
    off('pointerleave', onSilence, capOpts);
    off('pointermove', onSilence, capOpts);
    off('pointerout', onPointerCancel, capOpts);
    off('pointerover', onPointerOver, capOpts);
    off('pointerup', onSilence, capOpts);

    off('touchstart', onSilence, capOpts);
    off('touchend', onSilence, capOpts);
    off('touchcancel', onSilence, capOpts);
    off('touchmove', onTouchMove, capOpts);

    off('longpress', onLongPress, capOpts);

    off('keydown', onQuickExit, capOpts);
    off('contextmenu', onQuickExit, capOpts);
  }

  function onPointerDown(e: PointerEvent) {
    onSilence(e);
    setHoldElement(e);
  }

  function onClick(e: PointerEvent) {
    onSilence(e);

    const el = <HTMLElement>e.target;
    if (el === holdEl) {
      if (e.metaKey) {
        onOpenTree(el);
        onChangeElement();
      } else {
        if (once) onExitInspect();
        onOpenEditor(el);
      }
    }
  }

  function onPointerOver(e: PointerEvent) {
    onSilence(e);

    const el = <HTMLElement>e.target;
    const changedEl = isValidElement(el) ? el : undefined;
    onChangeElement(changedEl);
  }

  function onPointerCancel(e: PointerEvent) {
    onSilence(e);

    // On desktop devices, when the mouse leaves the element, overlay needs to be hidden.
    if (isMouseEvent(e)) {
      onChangeElement();
    }
  }

  // In mobile devices, `pointerover` is not triggered repeatedly following the movement of the finger,
  // and the checked element can only be switched through `touchmove`.
  let lastTouchEl: HTMLElement | undefined;
  function onTouchMove(e: TouchEvent) {
    onSilence(e);

    const { clientX, clientY } = e.touches[0];
    const el = <HTMLElement>document.elementFromPoint(clientX, clientY);
    if (el !== lastTouchEl) {
      lastTouchEl = isValidElement(el) ? el : undefined;
      onChangeElement(lastTouchEl);
    }
  }

  function onQuickExit(e: PointerEvent) {
    if (
      // esc exit.
      (<any>e).key === 'Escape' ||
      // right-click exit.
      isMouseEvent(e)
    ) {
      onSilence(e, true);
      onExitInspect();
    }
  }

  function onLongPress(e: PointerEvent) {
    onSilence(e, true);

    const el = <HTMLElement>e.target;
    if (isValidElement(el)) {
      if (once) onExitInspect();
      onChangeElement();
      onOpenTree(el);
    }
  }

  registerEventListeners();
  return removeEventListeners;
}

function onSilence(e: Event, all?: boolean) {
  const el = <HTMLElement>e.target;
  if (all || isValidElement(el)) {
    // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
    // Only need to handle touch events, excluding other events such as pointer
    // See https://www.chromestatus.com/feature/5093566007214080.
    if (!e.type.startsWith('touch')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }
}

let holdEl: HTMLElement | null = null;

function setHoldElement(e: Event) {
  const el = <HTMLElement>e.target;
  if (isValidElement(el)) {
    resetAttrs(el, {
      disabled: {
        from: 'disabled',
        to: '__disabled__',
      },
      href: {
        from: 'href',
        to: '__href__',
      },
    });

    holdEl = el;
  }
}

function cleanHoldElement() {
  if (holdEl) {
    resetAttrs(holdEl, {
      disabled: {
        from: '__disabled__',
        to: 'disabled',
      },
      href: {
        from: '__href__',
        to: 'href',
      },
    });

    holdEl = null;
  }
}

function wrapCleanHoldElement<T extends (...args: any[]) => any>(fn: T) {
  return function wrapped(...args: Parameters<T>): ReturnType<T> {
    cleanHoldElement();
    return fn(...args);
  };
}

function resetAttrs(
  el: HTMLElement,
  attrs: Record<
    'disabled' | 'href',
    {
      from: string;
      to: string;
    }
  >,
) {
  const { disabled, href } = attrs;

  // Prevent click events from being blocked
  swapAttr(el, disabled.from, disabled.to);

  // Prevents the default jump
  // `e.preventDefault()` has no effect on relative paths
  const a = findATag(el);
  if (a) {
    swapAttr(a, href.from, href.to);
  }
}

function swapAttr(el: HTMLElement, from: string, to: string) {
  const val = el.getAttribute(from);
  if (val != null) {
    applyAttrs(el, {
      [from]: null,
      [to]: val,
    });
  }
}

function findATag(el?: HTMLElement | null) {
  while (el) {
    if (el.tagName === 'A') {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function isMouseEvent(e: PointerEvent) {
  return e.pointerType === 'mouse';
}
