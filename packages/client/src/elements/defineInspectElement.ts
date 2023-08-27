import { ServerApis } from '@open-editor/shared';
import { setupListenersOnDocument } from '../utils/setupListenersOnDocument';
import { resolveSource } from '../utils/resolveSource';
import { applyAttrs, create, on, off, append } from '../utils/document';
import { isValidElement } from '../utils/element';
import { InternalElements, Theme } from '../constants';
import { getOptions } from '../options';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLToggleElement } from './defineToggleElement';

export interface HTMLInspectElement extends HTMLElement {}

export function defineInspectElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
    #resetStyle!: HTMLStyleElement;
    #overlay: HTMLOverlayElement;
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

      this.#overlay = <HTMLOverlayElement>(
        create(InternalElements.HTML_OVERLAY_ELEMENT)
      );

      append(shadow, this.#overlay);

      const options = getOptions();
      if (options.displayToggle) {
        this.#toggle = <HTMLToggleElement>(
          create(InternalElements.HTML_TOGGLE_ELEMENT)
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

      if (this.#toggle) {
        on('toggle', this.#toggleActiveEffect, {
          target: this.#toggle,
        });
      }
    }

    disconnectedCallback() {
      off('keydown', this.#onKeydown, { capture: true });
      off('pointermove', this.#changePointer, { capture: true });

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
          onChangeElement: (element) => {
            this.#overlay.update(element);
          },
          onOpenEditor: (element) => {
            this.#openEditor(element);
          },
          onExitInspect: this.#cleanupHandlers,
        });

        if (this.#pointer) {
          const { x, y } = this.#pointer;
          const initElement = <HTMLElement>document.elementFromPoint(x, y);
          if (isValidElement(initElement)) {
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
        this.#removeResetStyle();
        this.#cleanupListenersOnDocument?.();
      }
    };

    #appendResetStyle() {
      requestAnimationFrame(() => {
        if (!this.#resetStyle) {
          this.#resetStyle = create('style');
          this.#resetStyle.type = 'text/css';
          this.#resetStyle.innerText =
            '*:hover{cursor:default;user-select:none;touch-action:none;}';
        }

        append(document.body, this.#resetStyle);
      });
    }

    #removeResetStyle() {
      requestAnimationFrame(() => {
        this.#resetStyle.remove();
      });
    }

    #openEditor(element: HTMLElement) {
      const source = resolveSource(element);
      if (source.file) {
        const { protocol, hostname, port } = window.location;
        const { file, line = 1, column = 1 } = source;
        const { port: customPort } = getOptions();

        const openURL = new URL(`${protocol}//${hostname}`);
        openURL.pathname = `${ServerApis.OPEN_EDITOR}${file}`;
        openURL.searchParams.set('line', String(line));
        openURL.searchParams.set('column', String(column));
        openURL.port = customPort || port;

        // open-editor event
        const event = new CustomEvent('openeditor', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: openURL,
        });

        // Dispatches a synthetic event event to target and returns true if either event's cancelable
        // attribute value is false or its preventDefault() method was not invoked, and false otherwise.
        if (this.dispatchEvent(event)) {
          fetch(openURL).catch(() => {
            console.error(new Error('@open-editor/client: openeditor fail.'));
          });
        }

        this.#cleanupHandlers();
      }
    }
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
