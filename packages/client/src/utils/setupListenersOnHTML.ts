import { on, off, applyAttrs } from './document';
import { isInternalElement, isValidElement } from './element';

export interface SetupHandlersOptions {
  onChangeElement(element?: HTMLElement): void;
  onOpenEditor(element: HTMLElement): void;
  onOpenTree(element: HTMLElement): void;
  onExitInspect(): void;
}

export function setupListenersOnHTML(options: SetupHandlersOptions) {
  const { onChangeElement, onOpenEditor, onOpenTree, onExitInspect } = options;

  function registerListenersOnHTML() {
    on('click', onClick, { capture: true });

    on('mousedown', onSilence, { capture: true });
    on('mouseenter', onSilence, { capture: true });
    on('mouseleave', onSilence, { capture: true });
    on('mousemove', onSilence, { capture: true });
    on('mouseout', onSilence, { capture: true });
    on('mouseover', onSilence, { capture: true });
    on('mouseup', onSilence, { capture: true });

    on('pointercancel', onSilence, { capture: true });
    on('pointerdown', onPointerDown, { capture: true });
    on('pointerenter', onSilence, { capture: true });
    on('pointerleave', onPointerLeave, { capture: true });
    on('pointermove', onSilence, { capture: true });
    on('pointerout', onSilence, { capture: true });
    on('pointerover', onPointerOver, { capture: true });
    on('pointerup', onSilence, { capture: true });

    on('touchstart', onSilence, { capture: true });
    on('touchend', onSilence, { capture: true });
    on('touchcancel', onSilence, { capture: true });
    on('touchmove', onSilence, { capture: true });

    on('keydown', onKeyDown, { capture: true });
    on('contextmenu', onContextMenu, { capture: true });
  }

  function removeEventListenersOnHTML() {
    off('click', onClick, { capture: true });

    off('mousedown', onSilence, { capture: true });
    off('mouseenter', onSilence, { capture: true });
    off('mouseleave', onSilence, { capture: true });
    off('mousemove', onSilence, { capture: true });
    off('mouseout', onSilence, { capture: true });
    off('mouseover', onSilence, { capture: true });
    off('mouseup', onSilence, { capture: true });

    off('pointercancel', onSilence, { capture: true });
    off('pointerdown', onPointerDown, { capture: true });
    off('pointerenter', onSilence, { capture: true });
    off('pointerleave', onPointerLeave, { capture: true });
    off('pointermove', onSilence, { capture: true });
    off('pointerout', onSilence, { capture: true });
    off('pointerover', onPointerOver, { capture: true });
    off('pointerup', onSilence, { capture: true });

    off('touchstart', onSilence, { capture: true });
    off('touchend', onSilence, { capture: true });
    off('touchcancel', onSilence, { capture: true });
    off('touchmove', onSilence, { capture: true });

    off('keydown', onKeyDown, { capture: true });
    off('contextmenu', onContextMenu, { capture: true });
  }

  let holdElement: HTMLElement;

  function onPointerDown(event: PointerEvent) {
    onSilence(event);
    onUnlockDisabled(event);

    const element = <HTMLElement>event.target;
    if (isValidElement(element)) {
      holdElement = element;
    }
  }

  function onClick(event: PointerEvent) {
    onSilence(event);
    onRestoreDisabled(event);

    const element = <HTMLElement>event.target;
    if (isValidElement(element) && element === holdElement) {
      if (event.metaKey) {
        return onOpenTree(element);
      }

      onOpenEditor(element);
      onExitInspect();
    }
  }

  function onPointerOver(event: PointerEvent) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    const validElement = isValidElement(element) ? element : undefined;
    onChangeElement(validElement);
  }

  function onPointerLeave(event: PointerEvent) {
    onSilence(event);
    onRestoreDisabled(event);

    if (event.pointerType === 'mouse') {
      const element = <HTMLElement>event.target;
      if (!isValidElement(element)) {
        onChangeElement();
      }
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    onSilence(event, true);
    // esc exit.
    if (event.keyCode === 27) {
      onRestoreDisabled(event);
      onExitInspect();
    }
  }

  // right-click exit.
  function onContextMenu(event: Event) {
    onSilence(event, true);
    onRestoreDisabled(event);
    onExitInspect();
  }

  registerListenersOnHTML();
  return removeEventListenersOnHTML;
}

function onSilence(event: Event, all?: boolean) {
  const element = <HTMLElement>event.target;
  if (all || !isInternalElement(element)) {
    // [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive.
    // See https://www.chromestatus.com/feature/5093566007214080.
    if (!(<any>event).type.startsWith('touch')) {
      event.preventDefault?.();
    }
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
  }
}

const unlockID = '__unlock_disabled__';

function onUnlockDisabled(event: Event) {
  const element = <HTMLButtonElement>event.target;
  if (isValidElement(element) && element.disabled) {
    element.disabled = false;
    applyAttrs(element, {
      [unlockID]: '',
    });
  }
}

function onRestoreDisabled(event: Event) {
  const element = <HTMLButtonElement>event.target;
  if (isValidElement(element) && element.getAttribute(unlockID) != null) {
    element.disabled = true;
    applyAttrs(element, {
      [unlockID]: null,
    });
  }
}
