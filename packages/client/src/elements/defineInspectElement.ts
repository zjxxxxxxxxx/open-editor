import { applyAttrs, create, on, off, append } from '../utils/document';
import { isValidElement } from '../utils/element';
import { setupListenersOnHTML } from '../utils/setupListenersOnHTML';
import { openEditor } from '../utils/openEditor';
import { InternalElements, Theme } from '../constants';
import { getOptions } from '../options';
import { resolveSource } from '../resolve';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLTreeElement } from './defineTreeElement';
import { HTMLToggleElement } from './defineToggleElement';

export interface HTMLInspectElement extends HTMLElement {}

const CSS = `
* {
  box-sizing: content-box;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}
:host {
  all: initial !important;
}
`;

export function defineInspectElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
    #overlay: HTMLOverlayElement;
    #tree: HTMLTreeElement;
    #toggle?: HTMLToggleElement;
    #pointer!: PointerEvent;
    #resetStyle!: HTMLStyleElement;

    #__active__!: boolean;
    get #active() {
      return this.#__active__;
    }
    set #active(value) {
      this.#__active__ = value;

      if (this.#toggle) {
        applyAttrs(this.#toggle, {
          active: value,
        });
      }
    }

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${Theme}${CSS}</style>`;

      this.#overlay = create<HTMLOverlayElement>(
        InternalElements.HTML_OVERLAY_ELEMENT,
      );
      this.#tree = create<HTMLTreeElement>(InternalElements.HTML_TREE_ELEMENT);

      append(shadow, this.#overlay);
      append(shadow, this.#tree);

      const options = getOptions();
      if (options.displayToggle) {
        this.#toggle = create<HTMLToggleElement>(
          InternalElements.HTML_TOGGLE_ELEMENT,
        );
        applyAttrs(this.#toggle, {
          enable: true,
        });

        append(shadow, this.#toggle);
      }
    }

    public connectedCallback() {
      on('keydown', this.#onKeydown, { capture: true });
      on('pointermove', this.#changePointer, { capture: true });
      on('exit', this.#cleanupHandlers, {
        target: this.#tree,
      });

      if (this.#toggle) {
        on('toggle', this.#toggleActiveEffect, {
          target: this.#toggle,
        });
      }
    }

    public disconnectedCallback() {
      off('keydown', this.#onKeydown, { capture: true });
      off('pointermove', this.#changePointer, { capture: true });
      off('exit', this.#cleanupHandlers, {
        target: this.#tree,
      });

      if (this.#toggle) {
        off('toggle', this.#toggleActiveEffect, {
          target: this.#toggle,
        });
      }

      this.#cleanupHandlers();
    }

    #changePointer = (event: PointerEvent) => {
      this.#pointer = event;
    };

    #onKeydown = (event: KeyboardEvent) => {
      // toggle
      if (event.altKey && event.metaKey && event.keyCode === 79) {
        this.#toggleActiveEffect();
      }
    };

    #toggleActiveEffect = () => {
      if (!this.#active) {
        this.#setupHandlers();
      } else {
        this.#cleanupHandlers();
      }
    };

    #setupHandlers() {
      if (!this.#active) {
        this.#active = true;
        this.#overlay.open();
        this.#cleanupListenersOnHTML = setupListenersOnHTML({
          onChangeElement: this.#overlay.update,
          onOpenTree: this.#tree.open,
          onOpenEditor: this.#openEditor,
          onExitInspect: this.#cleanupHandlers,
        });

        if (this.#pointer) {
          const { x, y } = this.#pointer;
          const initElement = <HTMLElement>document.elementFromPoint(x, y);
          if (initElement && isValidElement(initElement)) {
            this.#overlay.update(initElement);
          }
        }

        this.#appendResetStyle();
      }
    }

    #cleanupListenersOnHTML!: () => void;

    #cleanupHandlers = () => {
      if (this.#active) {
        this.#active = false;
        this.#overlay.close();
        this.#tree.close();
        this.#cleanupListenersOnHTML();
        this.#removeResetStyle();
      }
    };

    #appendResetStyle() {
      if (!this.#resetStyle) {
        this.#resetStyle = create('style');
        this.#resetStyle.innerHTML = `
          * {
            cursor: default !important;
            user-select: none !important;
          } 
        `;
      }

      append(document.body, this.#resetStyle);
    }

    #removeResetStyle() {
      this.#resetStyle.remove();
    }

    #openEditor = (element: HTMLElement) => {
      const { meta } = resolveSource(element);
      if (meta) {
        openEditor(meta, this.dispatchEvent.bind(this));
      }
    };
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
