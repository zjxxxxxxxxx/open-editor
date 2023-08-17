import { on, off } from '../utils/dom';
import { isInternalElement } from './isInternalElement';
import { isValidElement } from './isValidElement';

export interface SetupHandlersOptions {
  onChangeElement(element?: HTMLElement): void;
  onOpenEditor(element: HTMLElement): void;
}

export function setupListenersOnWindow(options: SetupHandlersOptions) {
  const { onChangeElement, onOpenEditor } = options;

  function registerListenersOnWindow() {
    on('click', onClick, { capture: true });
    on('dblclick', onClick, { capture: true });

    on('mousedown', onSilence, { capture: true });
    on('mouseenter', onSilence, { capture: true });
    on('mouseleave', onSilence, { capture: true });
    on('mousemove', onSilence, { capture: true });
    on('mouseout', onSilence, { capture: true });
    on('mouseover', onSilence, { capture: true });
    on('mouseup', onSilence, { capture: true });

    on('pointercancel', onSilence, { capture: true });
    on('pointerdown', onSilence, { capture: true });
    on('pointerenter', onSilence, { capture: true });
    //on('pointerleave', onSilence, { capture: true });
    on('pointermove', onSilence, { capture: true });
    on('pointerout', onSilence, { capture: true });
    on('pointerover', onPointerOver, { capture: true });
    on('pointerup', onSilence, { capture: true });

    on('touchstart', onSilence, { capture: true });
    on('touchend', onSilence, { capture: true });
    on('touchcancel', onSilence, { capture: true });
    on('touchmove', onSilence, { capture: true });

    on('pointerleave', onPointerLeave, {
      capture: true,
      target: document.body,
    });
  }

  function removeEventListenersOnWindow() {
    off('click', onClick, { capture: true });
    off('dblclick', onClick, { capture: true });

    off('mousedown', onSilence, { capture: true });
    off('mouseenter', onSilence, { capture: true });
    off('mouseleave', onSilence, { capture: true });
    off('mousemove', onSilence, { capture: true });
    off('mouseout', onSilence, { capture: true });
    off('mouseover', onSilence, { capture: true });
    off('mouseup', onSilence, { capture: true });

    off('pointercancel', onSilence, { capture: true });
    off('pointerdown', onSilence, { capture: true });
    off('pointerenter', onSilence, { capture: true });
    //off('pointerleave', onSilence, { capture: true });
    off('pointermove', onSilence, { capture: true });
    off('pointerout', onSilence, { capture: true });
    off('pointerover', onPointerOver, { capture: true });
    off('pointerup', onSilence, { capture: true });

    off('touchstart', onSilence, { capture: true });
    off('touchend', onSilence, { capture: true });
    off('touchcancel', onSilence, { capture: true });
    off('touchmove', onSilence, { capture: true });

    off('pointerleave', onPointerLeave, {
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
