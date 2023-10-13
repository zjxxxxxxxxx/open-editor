import { applyAttrs, create, on, off, append } from '../utils/document';
import { isValidElement } from '../utils/element';
import { createStyleInject } from '../utils/createStyleInject';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { openEditor } from '../utils/openEditor';
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
  cursor: default !important;
  user-select: none !important;
  -webkit-touch-callout: none !important;
}
:host {
  all: initial !important;
}
`;

const resetCSS = postcss`
* {
  cursor: default !important;
  user-select: none !important;
  -webkit-touch-callout: none !important;
}
`;

export function defineInspectElement() {
  const resetStyle = createStyleInject(resetCSS);

  class InspectElement extends HTMLElement implements HTMLInspectElement {
    private overlay: HTMLOverlayElement;
    private tree: HTMLTreeElement;
    private toggle?: HTMLToggleElement;
    private pointer!: PointerEvent;

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

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${Theme}${CSS}</style>`;

      this.overlay = create<HTMLOverlayElement>(
        InternalElements.HTML_OVERLAY_ELEMENT,
      );
      this.tree = create<HTMLTreeElement>(InternalElements.HTML_TREE_ELEMENT);

      append(shadow, this.overlay);
      append(shadow, this.tree);

      const options = getOptions();
      if (options.displayToggle) {
        this.toggle = create<HTMLToggleElement>(
          InternalElements.HTML_TOGGLE_ELEMENT,
        );
        applyAttrs(this.toggle, {
          enable: true,
        });

        append(shadow, this.toggle);
      }
    }

    connectedCallback() {
      on('keydown', this.onKeydown, captureOpts);
      on('pointermove', this.changePointer, captureOpts);
      on('exit', this.cleanupHandlers, {
        target: this.tree,
      });

      if (this.toggle) {
        on('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }
    }

    disconnectedCallback() {
      off('keydown', this.onKeydown, captureOpts);
      off('pointermove', this.changePointer, captureOpts);
      off('exit', this.cleanupHandlers, {
        target: this.tree,
      });

      if (this.toggle) {
        off('toggle', this.toggleActiveEffect, {
          target: this.toggle,
        });
      }

      this.cleanupHandlers();
    }

    private changePointer = (event: PointerEvent) => {
      this.pointer = event;
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
        this.overlay.open();

        if (this.pointer) {
          const { x, y } = this.pointer;
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
        resetStyle.insert();
      }
    }

    private cleanupListenersOnWindow!: () => void;

    private cleanupHandlers = () => {
      if (this.active) {
        this.active = false;
        this.overlay.close();
        this.tree.close();
        this.cleanupListenersOnWindow();
        resetStyle.remove();
      }
    };

    private openEditor = (element: HTMLElement) => {
      const { meta } = resolveSource(element);
      if (meta) {
        openEditor(meta, this.dispatchEvent.bind(this));
      }
    };
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
