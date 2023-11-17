import { capOpts } from '../constants';
import { applyAttrs } from './html';
import { off, on } from './event';
import { isValidElement } from './validElement';

export interface SetupHandlersOptions {
  onChangeElement(el?: HTMLElement): void;
  onOpenEditor(el: HTMLElement): void;
  onOpenTree(el: HTMLElement): void;
  onExitInspect(): void;
}

export function setupListenersOnWindow(opts: SetupHandlersOptions) {
  const onChangeElement = wrapHoldElementRestoreDisabled(opts.onChangeElement);
  const onOpenEditor = wrapHoldElementRestoreDisabled(opts.onOpenEditor);
  const onOpenTree = wrapHoldElementRestoreDisabled(opts.onOpenTree);
  const onExitInspect = wrapHoldElementRestoreDisabled(opts.onExitInspect);

  function registerEventListeners() {
    on('click', onClick, {
      ...capOpts,
      target: document,
    });

    on('mousedown', onSilence, capOpts);
    on('mouseenter', onSilence, capOpts);
    on('mouseleave', onSilence, capOpts);
    on('mousemove', onSilence, capOpts);
    on('mouseout', onSilence, capOpts);
    on('mouseover', onSilence, capOpts);
    on('mouseup', onSilence, capOpts);

    on('pointercancel', onSilence, capOpts);
    on('pointerdown', onPointerDown, capOpts);
    on('pointerenter', onSilence, capOpts);
    on('pointerleave', onSilence, capOpts);
    on('pointermove', onSilence, capOpts);
    on('pointerout', onSilence, capOpts);
    on('pointerover', onPointerOver, capOpts);
    on('pointerup', onSilence, capOpts);

    on('touchstart', onSilence, capOpts);
    on('touchend', onSilence, capOpts);
    on('touchcancel', onSilence, capOpts);
    on('touchmove', onTouchMove, capOpts);

    on('keydown', onKeyDown, capOpts);
    on('contextmenu', onContextMenu, capOpts);
    on('longpress', onLongPress, capOpts);
  }

  function removeEventListeners() {
    off('click', onClick, {
      ...capOpts,
      target: document,
    });

    off('mousedown', onSilence, capOpts);
    off('mouseenter', onSilence, capOpts);
    off('mouseleave', onSilence, capOpts);
    off('mousemove', onSilence, capOpts);
    off('mouseout', onSilence, capOpts);
    off('mouseover', onSilence, capOpts);
    off('mouseup', onSilence, capOpts);

    off('pointercancel', onSilence, capOpts);
    off('pointerdown', onPointerDown, capOpts);
    off('pointerenter', onSilence, capOpts);
    off('pointerleave', onSilence, capOpts);
    off('pointermove', onSilence, capOpts);
    off('pointerout', onSilence, capOpts);
    off('pointerover', onPointerOver, capOpts);
    off('pointerup', onSilence, capOpts);

    off('touchstart', onSilence, capOpts);
    off('touchend', onSilence, capOpts);
    off('touchcancel', onSilence, capOpts);
    off('touchmove', onTouchMove, capOpts);

    off('keydown', onKeyDown, capOpts);
    off('contextmenu', onContextMenu, capOpts);
    off('longpress', onLongPress, capOpts);
  }

  function onPointerDown(e: PointerEvent) {
    onSilence(e);
    onHoldElementUnlockDisabled(e);
  }

  function onClick(e: PointerEvent) {
    onSilence(e);

    const el = <HTMLElement>e.target;
    if (el === holdEl) {
      if (e.metaKey) {
        onOpenTree(el);
        onChangeElement();
      } else {
        onOpenEditor(el);
        onExitInspect();
      }
    }
  }

  function onPointerOver(e: PointerEvent) {
    onSilence(e);

    const el = <HTMLElement>e.target;
    const changedEl = isValidElement(el) ? el : undefined;
    onChangeElement(changedEl);
  }

  let lastTouchEl: HTMLElement | undefined;
  function onTouchMove(e: TouchEvent) {
    onSilence(e);

    const { clientX, clientY } = e.touches[0];
    const el = <HTMLElement>document.elementFromPoint(clientX, clientY);
    if (el && el !== lastTouchEl) {
      lastTouchEl = isValidElement(el) ? el : undefined;
      onChangeElement(lastTouchEl);
    }
  }

  // esc exit.
  function onKeyDown(e: KeyboardEvent) {
    onSilence(e, true);

    if (e.key === 'Escape') {
      onExitInspect();
    }
  }

  // right-click exit.
  function onContextMenu(e: PointerEvent) {
    onSilence(e, true);
    if (e.pointerType === 'mouse') {
      onExitInspect();
    }
  }

  function onLongPress(e: PointerEvent) {
    const el = <HTMLElement>e.target;
    if (isValidElement(el)) {
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
    // See https://www.chromestatus.com/feature/5093566007214080.
    if (!(<any>e).type.startsWith('touch')) {
      e.preventDefault();
    }
    e.stopPropagation();
  }
}

const unlockID = '__unlock_disabled__';
let holdEl: HTMLButtonElement | null = null;

function onHoldElementUnlockDisabled(e: Event) {
  const el = <HTMLButtonElement>e.target;
  if (isValidElement(el)) {
    // <div disabled/> => <div __unlock_disabled__/>
    if (el.disabled) {
      el.disabled = false;
      applyAttrs(el, {
        [unlockID]: '',
      });
    }
    holdEl = el;
  }
}

function onHoldElementRestoreDisabled() {
  if (holdEl) {
    // <div __unlock_disabled__/> => <div disabled/>
    if (
      // __unlock_disabled__ === ''
      holdEl.getAttribute(unlockID) != null
    ) {
      holdEl.disabled = true;
      applyAttrs(holdEl, {
        [unlockID]: null,
      });
    }
    holdEl = null;
  }
}

function wrapHoldElementRestoreDisabled<T extends (...args: any[]) => any>(
  fn: T,
) {
  return (...args: Parameters<T>) => {
    onHoldElementRestoreDisabled();
    return fn(...args);
  };
}
