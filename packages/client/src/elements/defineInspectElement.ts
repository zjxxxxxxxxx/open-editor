import { ServerApis } from '@open-editor/shared';
import { setupListenersOnWindow } from '../utils/setupListenersOnWindow';
import { resolveSource } from '../utils/resolveSource';
import { applyAttrs, create, on, off, append } from '../utils/dom';
import { isValidElement } from '../utils/isValidElement';
import { InternalElements, Theme } from '../constants';
import { getOptions } from '../options';
import { HTMLOverlayElement } from './defineOverlayElement';
import { HTMLToggleElement } from './defineToggleElement';

export interface HTMLInspectElement extends HTMLElement {}

export function defineInspectElement() {
  class InspectElement extends HTMLElement implements HTMLInspectElement {
    #mouseStyle!: HTMLElement;
    #overlay: HTMLOverlayElement;
    #toggle: HTMLToggleElement;

    #__active__!: boolean;

    get #active() {
      return this.#__active__;
    }

    set #active(value) {
      this.#__active__ = value;
      applyAttrs(this.#toggle, {
        active: value,
      });
    }

    #mousePoint!: MouseEvent;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'closed' });
      shadow.innerHTML = `<style>${Theme}</style>`;

      this.#overlay = <HTMLOverlayElement>(
        create(InternalElements.HTML_OVERLAY_ELEMENT)
      );
      this.#toggle = <HTMLToggleElement>(
        create(InternalElements.HTML_TOGGLE_ELEMENT)
      );

      const options = getOptions();
      if (options.displayToggle) {
        applyAttrs(this.#toggle, {
          enable: true,
        });
      }

      append(shadow, this.#overlay);
      append(shadow, this.#toggle);
    }

    connectedCallback() {
      on('keydown', this.#onKeydown);
      on('mousemove', this.#changeMousePoint);
      on('toggle', this.#toggleActiveEffect, {
        target: this.#toggle,
      });
    }

    disconnectedCallback() {
      off('keydown', this.#onKeydown);
      off('mousemove', this.#changeMousePoint);
      off('toggle', this.#toggleActiveEffect, {
        target: this.#toggle,
      });

      this.#cleanupHandlers();
    }

    #changeMousePoint = (event: MouseEvent) => {
      this.#mousePoint = event;
    };

    #onKeydown = (event: KeyboardEvent) => {
      // toggle
      if (event.altKey && event.metaKey && event.keyCode === 79) {
        this.#toggleActiveEffect();
      }
      // stop
      else if (event.keyCode === 27) {
        this.#cleanupHandlers();
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
      if (this.#active) return;
      this.#active = true;

      this.#overlay.open();
      this.#lockMouseStyle();
      this.#cleanupListenersOnWindow = setupListenersOnWindow({
        onChangeElement: (element) => {
          this.#overlay.update(element);
        },
        onOpenEditor: (element) => {
          this.#openEditor(element);
        },
      });

      if (this.#mousePoint) {
        const { x, y } = this.#mousePoint;
        const initElement = <HTMLElement>document.elementFromPoint(x, y);
        if (isValidElement(initElement)) {
          this.#overlay.update(initElement);
        }
      }
    }

    #cleanupListenersOnWindow?: () => void;

    #cleanupHandlers() {
      if (!this.#active) return;
      this.#active = false;

      this.#overlay.close();
      this.#unlockMouseStyle();
      this.#cleanupListenersOnWindow?.();
    }

    #lockMouseStyle() {
      if (!this.#mouseStyle) {
        const style = create('style');
        style.innerHTML = `*:hover {
          cursor: default;
        }`;
        this.#mouseStyle = style;
      }
      requestAnimationFrame(() => append(document.head, this.#mouseStyle));
    }

    #unlockMouseStyle() {
      this.#mouseStyle.remove();
    }

    async #openEditor(element: HTMLElement) {
      const source = resolveSource(element);
      if (source.file) {
        const { file, line = 1, column = 1 } = source;
        let openURL = `${ServerApis.OPEN_EDITOR}${file}?line=${line}&column=${column}`;

        const { serverAddress } = getOptions();
        if (serverAddress) {
          openURL = `${serverAddress}${openURL}`;
        }

        await fetch(openURL);
        this.#cleanupHandlers();

        // dispatch open-editor event
        this.dispatchEvent(
          new CustomEvent('open-editor', {
            detail: source,
          }),
        );
      }
    }
  }

  customElements.define(InternalElements.HTML_INSPECT_ELEMENT, InspectElement);
}
