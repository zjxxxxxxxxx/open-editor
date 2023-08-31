import { setupListenersOnDocument } from '../utils/setupListenersOnDocument';
import { ElementSourceMeta, resolveSource } from '../utils/resolveSource';
import { applyAttrs, create, on, off, append, raf } from '../utils/document';
import { isValidElement } from '../utils/element';
import { InternalElements, Theme } from '../constants';
import { getOptions } from '../options';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLToggleElement } from './defineToggleElement';
import { openEditor } from '../utils/openEditor';
import { HTMLTreeElement } from './defineTreeElement';

export interface HTMLInspectElement extends HTMLElement {}

export function defineInspectElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
    #resetStyle!: HTMLStyleElement;

    #overlay: HTMLOverlayElement;
    #tree: HTMLTreeElement;

    #toggle?: HTMLToggleElement;

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

    #pointer!: PointerEvent;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style style="display: none;">${Theme}</style>`;

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

    connectedCallback() {
      on('keydown', this.#onKeydown, { capture: true });
      on('pointermove', this.#changePointer, { capture: true });
      on('confirm', this.#openEditorOnTree, {
        target: this.#tree,
      });

      if (this.#toggle) {
        on('toggle', this.#toggleActiveEffect, {
          target: this.#toggle,
        });
      }
    }

    disconnectedCallback() {
      off('keydown', this.#onKeydown, { capture: true });
      off('pointermove', this.#changePointer, { capture: true });
      off('confirm', this.#openEditorOnTree, {
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
        this.#appendResetStyle();
        this.#cleanupListenersOnDocument = setupListenersOnDocument({
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
      }
    }

    #cleanupListenersOnDocument?: () => void;

    #cleanupHandlers = () => {
      if (this.#active) {
        this.#active = false;
        this.#overlay.close();
        this.#tree.close();
        this.#removeResetStyle();
        this.#cleanupListenersOnDocument?.();
      }
    };

    #appendResetStyle() {
      raf(() => {
        if (!this.#resetStyle) {
          this.#resetStyle = create('style');
          this.#resetStyle.type = 'text/css';
          this.#resetStyle.innerText =
            '*:hover{cursor:default!important;user-select:none!important;touch-action:none!important;}';
        }

        append(document.body, this.#resetStyle);
      });
    }

    #removeResetStyle() {
      raf(() => {
        this.#resetStyle.remove();
      });
    }

    #openEditor = (element: HTMLElement) => {
      const { meta } = resolveSource(element);
      if (meta) {
        openEditor(meta, this.dispatchEvent.bind(this));
      }
    };

    #openEditorOnTree = (e: CustomEvent<ElementSourceMeta>) => {
      openEditor(e.detail, this.dispatchEvent.bind(this));
      this.#cleanupHandlers();
    };
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
