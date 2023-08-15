import { addEventListener, removeEventListener } from '../utils/dom';
import { isInternalElement } from './isInternalElement';
import { isValidElement } from './isValidElement';

export interface SetupHandlersOptions {
  onChangeElement(element?: HTMLElement): void;
  onOpenEditor(element: HTMLElement): void;
}

export function setupListenersOnWindow(options: SetupHandlersOptions) {
  const { onChangeElement, onOpenEditor } = options;

  function registerListenersOnWindow() {
    addEventListener('click', onClick, { capture: true });
    addEventListener('dblclick', onClick, { capture: true });

    addEventListener('mousedown', onSilence, { capture: true });
    addEventListener('mouseenter', onSilence, { capture: true });
    addEventListener('mouseleave', onSilence, { capture: true });
    addEventListener('mousemove', onSilence, { capture: true });
    addEventListener('mouseout', onSilence, { capture: true });
    addEventListener('mouseover', onSilence, { capture: true });
    addEventListener('mouseup', onSilence, { capture: true });

    addEventListener('pointercancel', onSilence, { capture: true });
    addEventListener('pointerdown', onSilence, { capture: true });
    addEventListener('pointerenter', onSilence, { capture: true });
    //addEventListener('pointerleave', onSilence, { capture: true });
    addEventListener('pointermove', onSilence, { capture: true });
    addEventListener('pointerout', onSilence, { capture: true });
    addEventListener('pointerover', onPointerOver, { capture: true });
    addEventListener('pointerup', onSilence, { capture: true });

    addEventListener('touchstart', onSilence, { capture: true });
    addEventListener('touchend', onSilence, { capture: true });
    addEventListener('touchcancel', onSilence, { capture: true });
    addEventListener('touchmove', onSilence, { capture: true });

    addEventListener('pointerleave', onPointerLeave, {
      capture: true,
      target: document.body,
    });
  }

  function removeEventListenersOnWindow() {
    removeEventListener('click', onClick, { capture: true });
    removeEventListener('dblclick', onClick, { capture: true });

    removeEventListener('mousedown', onSilence, { capture: true });
    removeEventListener('mouseenter', onSilence, { capture: true });
    removeEventListener('mouseleave', onSilence, { capture: true });
    removeEventListener('mousemove', onSilence, { capture: true });
    removeEventListener('mouseout', onSilence, { capture: true });
    removeEventListener('mouseover', onSilence, { capture: true });
    removeEventListener('mouseup', onSilence, { capture: true });

    removeEventListener('pointercancel', onSilence, { capture: true });
    removeEventListener('pointerdown', onSilence, { capture: true });
    removeEventListener('pointerenter', onSilence, { capture: true });
    //removeEventListener('pointerleave', onSilence, { capture: true });
    removeEventListener('pointermove', onSilence, { capture: true });
    removeEventListener('pointerout', onSilence, { capture: true });
    removeEventListener('pointerover', onPointerOver, { capture: true });
    removeEventListener('pointerup', onSilence, { capture: true });

    removeEventListener('touchstart', onSilence, { capture: true });
    removeEventListener('touchend', onSilence, { capture: true });
    removeEventListener('touchcancel', onSilence, { capture: true });
    removeEventListener('touchmove', onSilence, { capture: true });

    removeEventListener('pointerleave', onPointerLeave, {
      capture: true,
      target: document.body,
    });
  }

  function onClick(event: Event) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    if (isValidElement(element)) {
      onOpenEditor(element);
    }
  }

  function onPointerOver(event: Event) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    const validElement = isValidElement(element) ? element : undefined;
    onChangeElement(validElement);
  }

  function onPointerLeave(event: Event) {
    onSilence(event);

    const element = <HTMLElement>event.target;
    if (!isValidElement(element)) {
      onChangeElement();
    }
  }

  function onSilence(event: Event) {
    const element = <HTMLElement>event.target;
    if (!isInternalElement(element)) {
      event.preventDefault?.();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
    }
  }

  registerListenersOnWindow();
  return removeEventListenersOnWindow;
}
