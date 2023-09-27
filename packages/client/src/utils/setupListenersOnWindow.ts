import { captureOpts } from '../constants';
import { on, off, applyAttrs } from './document';
import { isInternalElement, isValidElement } from './element';
import type { LongPressEvent } from './longPressHandler';
import { longPressHandler } from './longPressHandler';

export interface SetupHandlersOptions {
  onChangeElement(element?: HTMLElement): void;
  onOpenEditor(element: HTMLElement): void;
  onOpenTree(element: HTMLElement): void;
  onExitInspect(): void;
}

export function setupListenersOnWindow(options: SetupHandlersOptions) {
  const onChangeElement = wrapHoldElementRestoreDisabled(
    options.onChangeElement,
  );
  const onOpenEditor = wrapHoldElementRestoreDisabled(options.onOpenEditor);
  const onOpenTree = wrapHoldElementRestoreDisabled(options.onOpenTree);
  const onExitInspect = wrapHoldElementRestoreDisabled(options.onExitInspect);

  function registerEventListeners() {
    on('click', onClick, {
      ...captureOpts,
      target: document,
    });

    on('mousedown', onSilence, captureOpts);
    on('mouseenter', onSilence, captureOpts);
    on('mouseleave', onSilence, captureOpts);
    on('mousemove', onSilence, captureOpts);
    on('mouseout', onSilence, captureOpts);
    on('mouseover', onSilence, captureOpts);
    on('mouseup', onSilence, captureOpts);

    on('pointercancel', onSilence, captureOpts);
    on('pointerdown', onPointerDown, captureOpts);
    on('pointerenter', onSilence, captureOpts);
    on('pointerleave', onPointerLeave, captureOpts);
    on('pointermove', onSilence, captureOpts);
    on('pointerout', onSilence, captureOpts);
    on('pointerover', onPointerOver, captureOpts);
    on('pointerup', onSilence, captureOpts);

    on('touchstart', onSilence, captureOpts);
    on('touchend', onSilence, captureOpts);
    on('touchcancel', onSilence, captureOpts);
    on('touchmove', onSilence, captureOpts);

    on('keydown', onKeyDown, captureOpts);
    on('contextmenu', onContextMenu, captureOpts);

    longPressHandler.on(onLongPress, captureOpts);
  }

  function removeEventListeners() {
    off('click', onClick, {
      ...captureOpts,
      target: document,
    });

    off('mousedown', onSilence, captureOpts);
    off('mouseenter', onSilence, captureOpts);
    off('mouseleave', onSilence, captureOpts);
    off('mousemove', onSilence, captureOpts);
    off('mouseout', onSilence, captureOpts);
    off('mouseover', onSilence, captureOpts);
    off('mouseup', onSilence, captureOpts);

    off('pointercancel', onSilence, captureOpts);
    off('pointerdown', onPointerDown, captureOpts);
    off('pointerenter', onSilence, captureOpts);
    off('pointerleave', onPointerLeave, captureOpts);
    off('pointermove', onSilence, captureOpts);
    off('pointerout', onSilence, captureOpts);
    off('pointerover', onPointerOver, captureOpts);
    off('pointerup', onSilence, captureOpts);

    off('touchstart', onSilence, captureOpts);
    off('touchend', onSilence, captureOpts);
    off('touchcancel', onSilence, captureOpts);
    off('touchmove', onSilence, captureOpts);

    off('keydown', onKeyDown, captureOpts);
    off('contextmenu', onContextMenu, captureOpts);

    longPressHandler.off(onLongPress, captureOpts);
  }

  function onPointerDown(event: PointerEvent) {
    onSilence(event);
    onHoldElementUnlockDisabled(event);
  }

  function onClick(event: PointerEvent) {
    onSilence(event);
    const element = <HTMLElement>event.target;
    if (element === holdElement) {
      if (event.metaKey) {
        onOpenTree(element);
        onChangeElement();
      } else {
        onOpenEditor(element);
        onExitInspect();
      }
    }
  }

  function onPointerOver(event: PointerEvent) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    const changedElement = isValidElement(element) ? element : undefined;
    onChangeElement(changedElement);
  }

  function onPointerLeave(event: PointerEvent) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    if (event.pointerType === 'mouse') {
      if (!isValidElement(element)) {
        onChangeElement();
      }
    }
  }

  // esc exit.
  function onKeyDown(event: KeyboardEvent) {
    onSilence(event, true);

    if (event.key === 'Escape') {
      onExitInspect();
    }
  }

  // right-click exit.
  function onContextMenu(event: MouseEvent) {
    onSilence(event, true);
    onExitInspect();
  }

  function onLongPress(event: LongPressEvent) {
    const element = event.detail;
    if (isValidElement(element)) {
      onChangeElement();
      onOpenTree(element);
    }
  }

  registerEventListeners();
  return removeEventListeners;
}

function onSilence(event: Event, all?: boolean) {
  const element = <HTMLElement>event.target;
  if (all || !isInternalElement(element)) {
    // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
    // See https://www.chromestatus.com/feature/5093566007214080.
    if (!(<any>event).type.startsWith('touch')) {
      event.preventDefault();
    }
    event.stopPropagation();
  }
}

const unlockID = '__unlock_disabled__';
let holdElement: HTMLInputElement | HTMLButtonElement | null = null;

function onHoldElementUnlockDisabled(event: Event) {
  const element = <HTMLButtonElement>event.target;
  if (isValidElement(element)) {
    if (element.disabled) {
      element.disabled = false;
      applyAttrs(element, {
        [unlockID]: '',
      });
    }
    holdElement = element;
  }
}

function onHoldElementRestoreDisabled() {
  if (holdElement) {
    if (holdElement.getAttribute(unlockID) != null) {
      holdElement.disabled = true;
      applyAttrs(holdElement, {
        [unlockID]: null,
      });
    }
    holdElement = null;
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
