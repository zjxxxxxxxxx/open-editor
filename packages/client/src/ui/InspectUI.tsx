import { OverlayUI } from './OverlayUI';
import { TreeUI } from './TreeUI';
import { addClass, removeClass, getHtml } from '../utils/dom';
import { logError } from '../utils/logError';
import { overrideStyle } from '../styles/globalStyles';
import { on } from '../event';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { openEditor } from './utils/openEditor';
import { setupListeners } from './utils/setupListeners';
import { disableHoverCSS, enableHoverCSS } from './utils/disableHoverCSS';
import { ToggleUI } from './ToggleUI';

export function InspectUI(props: { showErrorOverlay(): void }) {
  const state = {} as {
    active: boolean;
  };
  const toggleRef = {} as AnyObject;
  const overlayRef = {} as AnyObject;
  const treeRef = {} as AnyObject;
  const { displayToggle, disableHoverCSS: isDisabled } = getOptions();

  on('keydown', onKeydown);

  function onKeydown(e: KeyboardEvent) {
    if (e.altKey && e.metaKey && e.code === 'KeyO') {
      toggleActiveEffect();
    }
  }

  function toggleActiveEffect() {
    if (!state.active) {
      setupHandlers();
    } else {
      cleanHandlers();
    }
  }

  async function setupHandlers() {
    try {
      const e = new CustomEvent('enableinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (!state.active && !treeRef.isOpen && dispatchEvent(e)) {
        state.active = true;
        toggleRef.toggle();
        overlayRef.open();
        cleanListeners = setupListeners({
          onActive: overlayRef.update,
          onOpenTree: treeRef.open,
          onOpenEditor: openEditors,
          onExitInspect: cleanHandlers,
        });

        // Override the default mouse style and touch feedback
        overrideStyle.mount();

        if (isDisabled) await disableHoverCSS();

        // @ts-ignore
        document.activeElement?.blur();
      }
    } catch {
      //
    }
  }

  let cleanListeners: () => void;

  async function cleanHandlers() {
    try {
      const e = new CustomEvent('exitinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (state.active && !treeRef.isOpen && dispatchEvent(e)) {
        state.active = false;
        toggleRef.toggle();
        overlayRef.close();
        cleanListeners();

        overrideStyle.unmount();

        if (isDisabled) await enableHoverCSS();
      }
    } catch {
      //
    }
  }

  async function openEditors(el: HTMLElement) {
    try {
      addClass(getHtml(), 'oe-loading');
      const { meta } = resolveSource(el);
      if (!meta) {
        logError('file not found');
        props.showErrorOverlay();
        return;
      }

      const dispatch = (e: CustomEvent<URL>) => dispatchEvent(e);
      await openEditor(meta, dispatch);
    } finally {
      removeClass(getHtml(), 'oe-loading');
    }
  }

  return (
    <>
      {displayToggle && (
        <ToggleUI ref={toggleRef} onToggle={toggleActiveEffect} />
      )}
      <OverlayUI ref={overlayRef} />
      <TreeUI ref={treeRef} />
    </>
  );
}
