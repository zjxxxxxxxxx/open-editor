import { InternalElements } from '../constants';

const internalElements: string[] = Object.values(InternalElements);
export function isInternalElement(element: HTMLElement) {
  return internalElements.includes(element.localName);
}

export interface SetupHandlersOptions {
  onChangeElement(element: HTMLElement): void;
  onOpenEditor(element: HTMLElement): void;
}

export function setupListenersOnWindow(options: SetupHandlersOptions) {
  const { onChangeElement, onOpenEditor } = options;

  function registerListenersOnWindow() {
    window.addEventListener('click', onClick, true);
    window.addEventListener('dblclick', onClick, true);

    window.addEventListener('mousedown', onSilence, true);
    window.addEventListener('mouseenter', onSilence, true);
    window.addEventListener('mouseleave', onSilence, true);
    window.addEventListener('mousemove', onSilence, true);
    window.addEventListener('mouseout', onSilence, true);
    window.addEventListener('mouseover', onSilence, true);
    window.addEventListener('mouseup', onSilence, true);

    window.addEventListener('pointercancel', onSilence, true);
    window.addEventListener('pointerdown', onSilence, true);
    window.addEventListener('pointerenter', onSilence, true);
    window.addEventListener('pointerleave', onSilence, true);
    window.addEventListener('pointermove', onSilence, true);
    window.addEventListener('pointerout', onSilence, true);
    window.addEventListener('pointerover', onPointerOver, true);
    window.addEventListener('pointerup', onSilence, true);

    window.addEventListener('touchstart', onSilence, true);
    window.addEventListener('touchend', onSilence, true);
    window.addEventListener('touchcancel', onSilence, true);
    window.addEventListener('touchmove', onSilence, true);
  }

  function removeListenersOnWindow() {
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('dblclick', onClick, true);

    window.removeEventListener('mousedown', onSilence, true);
    window.removeEventListener('mouseenter', onSilence, true);
    window.removeEventListener('mouseleave', onSilence, true);
    window.removeEventListener('mousemove', onSilence, true);
    window.removeEventListener('mouseout', onSilence, true);
    window.removeEventListener('mouseover', onSilence, true);
    window.removeEventListener('mouseup', onSilence, true);

    window.removeEventListener('pointercancel', onSilence, true);
    window.removeEventListener('pointerdown', onSilence, true);
    window.removeEventListener('pointerenter', onSilence, true);
    window.removeEventListener('pointerleave', onSilence, true);
    window.removeEventListener('pointermove', onSilence, true);
    window.removeEventListener('pointerout', onSilence, true);
    window.removeEventListener('pointerover', onPointerOver, true);
    window.removeEventListener('pointerup', onSilence, true);

    window.removeEventListener('touchstart', onSilence, true);
    window.removeEventListener('touchend', onSilence, true);
    window.removeEventListener('touchcancel', onSilence, true);
    window.removeEventListener('touchmove', onSilence, true);
  }

  function onClick(event: Event) {
    const element = event.target as HTMLElement;
    if (!isInternalElement(element)) {
      onSilence(event);
      onOpenEditor(element);
    }
  }

  function onPointerOver(event: Event) {
    const element = event.target as HTMLElement;
    if (!isInternalElement(element)) {
      onSilence(event);
      onChangeElement(element);
    }
  }

  function onSilence(event: Event) {
    const element = event.target as HTMLElement;
    if (!isInternalElement(element)) {
      event.preventDefault?.();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
    }
  }

  registerListenersOnWindow();
  return removeListenersOnWindow;
}
