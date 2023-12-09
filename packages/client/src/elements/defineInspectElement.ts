import {
  applyAttrs,
  jsx,
  globalStyle,
  host,
  append,
  addClass,
  removeClass,
  getHtml,
} from '../utils/html';
import { off, on } from '../utils/event';
import { getColorMode } from '../utils/getColorMode';
import { isValidElement } from '../utils/isValidElement';
import { setupListeners } from '../utils/setupListeners';
import {
  offOpenEditorError,
  onOpenEditorError,
  openEditor,
} from '../utils/openEditor';
import { InternalElements, capOpts } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { type HTMLOverlayElement } from './defineOverlayElement';
import { type HTMLTreeElement } from './defineTreeElement';
import { type HTMLToggleElement } from './defineToggleElement';

export interface HTMLInspectElement extends HTMLElement {}

const CSS = postcss`
* {
  box-sizing: content-box;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 12px;
  font-weight: 300;
  line-height: 1.5;
  cursor: default;
  user-select: none;
  touch-action: none;
  -webkit-touch-callout: none;
}
:host {
  all: initial !important;

  --overlay-margin: #f6b26ba8;
  --overlay-border: #ffe599a8;
  --overlay-padding: #93c47d8c;
  --overlay-content: #6fa7dca8;

  --z-index-overlay: 1000000;
  --z-index-toggle: 1000002;
  --z-index-tooltip: 1000003;
  --z-index-tree: 1000003;
  --z-index-error-overlay: 1000004;
}
.oe-error-overlay {
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
    private pointE!: PointerEvent;

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

      const opts = getOptions();
      host(this, {
        css: [CSS, getColorMode()],
        html: [
          jsx<HTMLOverlayElement>(InternalElements.HTML_OVERLAY_ELEMENT, {
            ref: (el) => (this.overlay = el),
          }),
          jsx<HTMLTreeElement>(InternalElements.HTML_TREE_ELEMENT, {
            ref: (el) => (this.tree = el),
          }),
          opts.displayToggle &&
            jsx<HTMLToggleElement>(InternalElements.HTML_TOGGLE_ELEMENT, {
              ref: (el) => (this.toggle = el),
            }),
        ],
      });
    }

    connectedCallback() {
      globalStyle(
        '.oe-screen-lock{overflow:hidden;}.oe-loading *{cursor:wait!important;}',
      ).mount();

      on('keydown', this.onKeydown, capOpts);
      on('mousemove', this.savePointE, capOpts);
      onOpenEditorError(this.showErrorOverlay);

      if (this.toggle) {
        on('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }
    }

    disconnectedCallback() {
      off('keydown', this.onKeydown, capOpts);
      off('mousemove', this.savePointE, capOpts);
      offOpenEditorError(this.showErrorOverlay);

      if (this.toggle) {
        off('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }

      this.cleanHandlers();
    }

    private savePointE = (e: PointerEvent) => {
      this.pointE = e;
    };

    private onKeydown = (e: KeyboardEvent) => {
      if (e.altKey && e.metaKey && e.code === 'KeyO') {
        this.toggleActiveEffect();
      }
    };

    private toggleActiveEffect = () => {
      if (!this.active) {
        this.setupHandlers();
      } else {
        this.cleanHandlers();
      }
    };

    private setupHandlers() {
      if (!this.active && !this.tree.show) {
        this.active = true;
        this.overlay.open();
        this.cleanListeners = setupListeners({
          onChangeElement: this.overlay.update,
          onOpenTree: this.tree.open,
          onOpenEditor: this.openEditor,
          onExitInspect: this.cleanHandlers,
        });

        if (this.pointE) {
          const { x, y } = this.pointE;
          const initEl = <HTMLElement>document.elementFromPoint(x, y);
          if (isValidElement(initEl)) {
            this.overlay.update(initEl);
          }
        }

        overrideStyle.mount();
      }
    }

    private cleanListeners!: () => void;

    private cleanHandlers = () => {
      if (this.active && !this.tree.show) {
        this.active = false;
        this.overlay.close();
        this.cleanListeners();

        overrideStyle.unmount();
      }
    };

    private openEditor = async (el: HTMLElement) => {
      try {
        addClass(getHtml(), 'oe-loading');
        const { meta } = resolveSource(el);
        if (!meta) {
          console.error(Error('@open-editor/client: file not found.'));
          return this.showErrorOverlay();
        }
        await openEditor(meta, (e) => this.dispatchEvent(e));
      } finally {
        removeClass(getHtml(), 'oe-loading');
      }
    };

    private showErrorOverlay = () => {
      const errorOverlay = jsx('div', {
        className: 'oe-error-overlay',
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
