import { applyAttrs, jsx, globalStyle, host, append } from '../utils/html';
import { off, on } from '../utils/event';
import { isValidElement } from '../utils/validElement';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import {
  offOpenEditorError,
  onOpenEditorError,
  openEditor,
} from '../utils/openEditor';
import { InternalElements, Theme, captureOpts } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLTreeElement } from './defineTreeElement';
import { HTMLToggleElement } from './defineToggleElement';

export interface HTMLInspectElement extends HTMLElement {}

const CSS = postcss`
* {
  box-sizing: content-box;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  line-height: 1.5;
  font-weight: 400;
  cursor: default;
  user-select: none;
  touch-action: none;
  -webkit-touch-callout: none;
}
:host {
  all: initial !important;
}
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-index-error-overlay);
}
`;

const overrideCSS = postcss`
* {
  cursor: default !important;
  user-select: none !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
}
`;

export function defineInspectElement() {
  const overrideStyle = globalStyle(overrideCSS);

  class InspectElement extends HTMLElement implements HTMLInspectElement {
    readonly shadowRoot!: ShadowRoot;

    private overlay!: HTMLOverlayElement;
    private tree!: HTMLTreeElement;
    private toggle?: HTMLToggleElement;
    private pointEvt!: PointerEvent;

    private __active__!: boolean;
    private get active() {
      return this.__active__;
    }
    private set active(value) {
      this.__active__ = value;

      if (this.toggle) {
        applyAttrs(this.toggle, {
          active: value,
        });
      }
    }

    constructor() {
      super();

      const options = getOptions();
      host({
        root: this,
        style: [Theme, CSS],
        element: [
          jsx<HTMLOverlayElement>(InternalElements.HTML_OVERLAY_ELEMENT, {
            ref: (el) => (this.overlay = el),
          }),
          jsx<HTMLTreeElement>(InternalElements.HTML_TREE_ELEMENT, {
            ref: (el) => (this.tree = el),
          }),
          options.displayToggle
            ? jsx<HTMLToggleElement>(InternalElements.HTML_TOGGLE_ELEMENT, {
                ref: (el) => (this.toggle = el),
              })
            : null,
        ],
      });
    }

    connectedCallback() {
      on('keydown', this.onKeydown, captureOpts);
      on('pointermove', this.cachePointEvt, captureOpts);
      on('exit', this.cleanupHandlers, {
        target: this.tree,
      });
      onOpenEditorError(this.showErrorOverlay);

      if (this.toggle) {
        on('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }
    }

    disconnectedCallback() {
      off('keydown', this.onKeydown, captureOpts);
      off('pointermove', this.cachePointEvt, captureOpts);
      off('exit', this.cleanupHandlers, {
        target: this.tree,
      });
      offOpenEditorError(this.showErrorOverlay);

      if (this.toggle) {
        off('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }

      this.cleanupHandlers();
    }

    private cachePointEvt = (event: PointerEvent) => {
      this.pointEvt = event;
    };

    private onKeydown = (event: KeyboardEvent) => {
      // toggle
      if (event.altKey && event.metaKey && event.keyCode === 79) {
        this.toggleActiveEffect();
      }
    };

    private toggleActiveEffect = () => {
      if (!this.active) {
        this.setupHandlers();
      } else {
        this.cleanupHandlers();
      }
    };

    private setupHandlers() {
      if (!this.active) {
        this.active = true;
        overrideStyle.mount();
        this.overlay.open();

        if (this.pointEvt) {
          const { x, y } = this.pointEvt;
          const initElement = <HTMLElement>document.elementFromPoint(x, y);
          if (initElement && isValidElement(initElement)) {
            this.overlay.update(initElement);
          }
        }

        this.cleanupListenersOnWindow = setupListenersOnWindow({
          onChangeElement: this.overlay.update,
          onOpenTree: this.tree.open,
          onOpenEditor: this.openEditor,
          onExitInspect: this.cleanupHandlers,
        });
      }
    }

    private cleanupListenersOnWindow!: () => void;

    private cleanupHandlers = () => {
      if (this.active) {
        this.active = false;
        overrideStyle.unmount();
        this.overlay.close();
        this.tree.close();
        this.cleanupListenersOnWindow();
      }
    };

    private openEditor = (element: HTMLElement) => {
      const { meta } = resolveSource(element);
      if (!meta) {
        console.error(Error('@open-editor/client: file not found.'));
        return this.showErrorOverlay();
      }
      openEditor(meta, (event) => this.dispatchEvent(event));
    };

    private showErrorOverlay = () => {
      const errorOverlay = jsx('div', {
        className: 'error-overlay',
      });
      const ani = errorOverlay.animate(
        [
          {},
          {
            boxShadow: 'inset 0 0 20px 10px var(--red)',
            background: 'var(--red-light)',
          },
          {},
        ],
        {
          duration: 600,
          easing: 'ease-out',
        },
      );
      on('finish', () => errorOverlay.remove(), {
        target: ani,
      });
      append(this.shadowRoot, errorOverlay);
    };
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
