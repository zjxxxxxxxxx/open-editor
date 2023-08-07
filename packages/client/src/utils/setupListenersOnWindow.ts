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
    addEventListener('click', onClick, true);
    addEventListener('dblclick', onClick, true);

    addEventListener('mousedown', onSilence, true);
    addEventListener('mouseenter', onSilence, true);
    addEventListener('mouseleave', onSilence, true);
    addEventListener('mousemove', onSilence, true);
    addEventListener('mouseout', onSilence, true);
    addEventListener('mouseover', onSilence, true);
    addEventListener('mouseup', onSilence, true);

    addEventListener('pointercancel', onSilence, true);
    addEventListener('pointerdown', onSilence, true);
    addEventListener('pointerenter', onSilence, true);
    //addEventListener('pointerleave', onSilence, true);
    addEventListener('pointermove', onSilence, true);
    addEventListener('pointerout', onSilence, true);
    addEventListener('pointerover', onPointerOver, true);
    addEventListener('pointerup', onSilence, true);

    addEventListener('touchstart', onSilence, true);
    addEventListener('touchend', onSilence, true);
    addEventListener('touchcancel', onSilence, true);
    addEventListener('touchmove', onSilence, true);

    addEventListener.call(document.body, 'pointerleave', onPointerLeave, true);
  }

  function removeEventListenersOnWindow() {
    removeEventListener('click', onClick, true);
    removeEventListener('dblclick', onClick, true);

    removeEventListener('mousedown', onSilence, true);
    removeEventListener('mouseenter', onSilence, true);
    removeEventListener('mouseleave', onSilence, true);
    removeEventListener('mousemove', onSilence, true);
    removeEventListener('mouseout', onSilence, true);
    removeEventListener('mouseover', onSilence, true);
    removeEventListener('mouseup', onSilence, true);

    removeEventListener('pointercancel', onSilence, true);
    removeEventListener('pointerdown', onSilence, true);
    removeEventListener('pointerenter', onSilence, true);
    //removeEventListener('pointerleave', onSilence, true);
    removeEventListener('pointermove', onSilence, true);
    removeEventListener('pointerout', onSilence, true);
    removeEventListener('pointerover', onPointerOver, true);
    removeEventListener('pointerup', onSilence, true);

    removeEventListener('touchstart', onSilence, true);
    removeEventListener('touchend', onSilence, true);
    removeEventListener('touchcancel', onSilence, true);
    removeEventListener('touchmove', onSilence, true);

    removeEventListener.call(
      document.body,
      'pointerleave',
      onPointerLeave,
      true,
    );
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
